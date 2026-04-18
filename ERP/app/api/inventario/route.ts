import { NextRequest, NextResponse } from "next/server";
import { listarProductos, actualizarStock } from "@/lib/procedures/productos";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    const data = await listarProductos();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al listar productos" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    // Solo admin puede actualizar stock manualmente
    if (user.rol !== ROLES.ADMIN) {
      return NextResponse.json({ ok: false, message: "Solo administradores pueden ajustar stock" }, { status: 403 });
    }

    const { id_producto, nueva_cantidad, nuevo_minimo } = await req.json();

    if (id_producto === undefined || nueva_cantidad === undefined || nuevo_minimo === undefined) {
      return NextResponse.json({ ok: false, message: "Datos faltantes" }, { status: 400 });
    }

    const result = await actualizarStock(id_producto, nueva_cantidad, nuevo_minimo);
    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}
