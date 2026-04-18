import { NextRequest, NextResponse } from "next/server";
import { obtenerDetalleVenta } from "@/lib/procedures/ventas";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    // Defensa en profundidad: Validar rol
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
       return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const { id } = await params;
    const data = await obtenerDetalleVenta(parseInt(id));

    return NextResponse.json({
      ok: true,
      data
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: "Error al obtener detalle de venta", error: error.message },
      { status: 500 }
    );
  }
}
