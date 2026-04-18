import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { registrarVenta, listarVentas } from "@/lib/procedures/ventas";
import { ventaSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "No tiene permisos para ver ventas" }, { status: 403 });
    }
    
    const data = await listarVentas();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al listar ventas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validar Sesión y Rol
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }
    
    // Tanto Admin como Vendedor pueden realizar ventas
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "No tiene permisos para vender" }, { status: 403 });
    }

    const body = await req.json();

    // 2. Validar Esquema Zod
    const validation = ventaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, message: "Datos de venta inválidos", errors: validation.error.format() },
        { status: 400 }
      );
    }

    // 3. Registrar en BD
    const result = await registrarVenta({
      id_cliente: validation.data.id_cliente,
      id_usuario: user.id_usuario,
      detalles: validation.data.detalles,
    });

    return NextResponse.json({
      ok: true,
      message: "Venta registrada exitosamente",
      data: result,
    });

  } catch (error: any) {
    console.error("Error en registro de venta:", error);
    
    // Capturar errores específicos de Stock lanzados por Triggers de SQL
    if (error.message?.includes("stock suficiente")) {
      return NextResponse.json(
        { ok: false, message: "Error de inventario: No hay stock suficiente para realizar esta venta." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Error interno al procesar la venta", error: error.message },
      { status: 500 }
    );
  }
}
