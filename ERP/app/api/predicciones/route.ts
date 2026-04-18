import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

const ML_SERVICE_URL = "http://localhost:8000/v1/predict";

export async function POST(req: NextRequest) {
  try {
    // 1. Validar Sesión y Rol
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.REPORTES) {
      return NextResponse.json(
        { ok: false, message: "No tiene permisos para generar predicciones" },
        { status: 403 }
      );
    }

    const { tipo, id_producto, horizonte_dias, observaciones } = await req.json();

    // 2. Validar datos mínimos
    if (!observaciones || observaciones.length < 20) {
      return NextResponse.json(
        { ok: false, message: "Se requieren al menos 20 observaciones para mayor precisión" },
        { status: 400 }
      );
    }

    if (tipo === 'producto' && !id_producto) {
      return NextResponse.json(
        { ok: false, message: "Debe proporcionar el ID de producto" },
        { status: 400 }
      );
    }

    // Preparar payload para ml-service
    // id_producto: 0 se usa para representar Ventas Totales según convención
    const payload = {
      id_producto: tipo === 'ventas_totales' ? 1 : parseInt(id_producto),
      id_sucursal: 1, // Hardcoded según requerimiento
      horizonte_dias: horizonte_dias || 30,
      observaciones: observaciones
    };

    // 3. Llamar al ml-service
    const response = await fetch(ML_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Error desconocido en el servicio ML" }));

      // Asegurarse de que el mensaje sea un string (FastAPI devuelve objetos en 'detail' para errores de validación)
      let errorMessage = "Error en el servicio de predicción";
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
        errorMessage = JSON.stringify(errorData.detail);
      }

      return NextResponse.json(
        { ok: false, message: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      ok: true,
      data: result,
    });

  } catch (error: any) {
    console.error("Error en API de predicciones:", error);

    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { ok: false, message: "El servicio de Machine Learning (ml-service) no está disponible." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Error interno al procesar la predicción", error: error.message },
      { status: 500 }
    );
  }
}
