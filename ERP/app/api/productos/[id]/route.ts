import { NextRequest, NextResponse } from "next/server";
import { actualizarProducto, eliminarProducto, cambiarEstadoProducto } from "@/lib/procedures/productos";
import { productoSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

function parseProductoId(idStr: string) {
  const id = Number.parseInt(idStr, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function canManageProductos(rol: string) {
  return rol === ROLES.ADMIN || rol === ROLES.VENDEDOR;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (!canManageProductos(user.rol)) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const { id: idStr } = await params;
    const id = parseProductoId(idStr);
    if (!id) {
      return NextResponse.json({ ok: false, message: "ID de producto inválido" }, { status: 400 });
    }

    const body = await req.json();

    const validation = productoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, message: "Validación fallida", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const validData = validation.data;

    await actualizarProducto({
      id_producto: id,
      nombre: validData.nombre,
      descripcion: validData.descripcion || "",
      precio: validData.precio,
      id_categoria: validData.id_categoria,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN) {
      return NextResponse.json({ ok: false, message: "Acceso denegado" }, { status: 403 });
    }

    const { id: idStr } = await params;
    const id = parseProductoId(idStr);
    if (!id) {
      return NextResponse.json({ ok: false, message: "ID de producto inválido" }, { status: 400 });
    }

    await eliminarProducto(id);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al eliminar producto" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (!canManageProductos(user.rol)) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { id: idStr } = await params;
    const id = parseProductoId(idStr);
    if (!id) {
      return NextResponse.json({ ok: false, message: "ID de producto inválido" }, { status: 400 });
    }

    if (typeof body.activo !== "boolean") {
      return NextResponse.json({ ok: false, message: "El campo activo debe ser booleano" }, { status: 400 });
    }

    await cambiarEstadoProducto(id, body.activo);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al cambiar estado", error: error instanceof Error ? error.message : "Error desconocido" }, 
      { status: 500 }
    );
  }
}
