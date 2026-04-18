import { NextRequest, NextResponse } from "next/server";
import { actualizarCategoria, eliminarCategoria, cambiarEstadoCategoria } from "@/lib/procedures/categorias";
import { categoriaSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    
    // Si viene solo 'activo', es un cambio de estado
    if (body.activo !== undefined && Object.keys(body).length === 1) {
      await cambiarEstadoCategoria(parseInt(id), body.activo);
      return NextResponse.json({ ok: true, message: "Estado actualizado" });
    }

    // Si no, es una actualización completa
    const validation = categoriaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, errors: validation.error.format() }, { status: 400 });
    }

    await actualizarCategoria({ id_categoria: parseInt(id), ...validation.data });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    // SOLO ADMIN PUEDE ELIMINAR
    if (user.rol !== ROLES.ADMIN) {
      return NextResponse.json({ ok: false, message: "Solo los administradores pueden eliminar categorías" }, { status: 403 });
    }

    const { id } = await params;
    await eliminarCategoria(parseInt(id));
    return NextResponse.json({ ok: true, message: "Categoría eliminada" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: "No se puede eliminar la categoría. Probablemente tenga productos asociados.", error: error.message }, { status: 400 });
  }
}
