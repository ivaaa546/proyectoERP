import { NextRequest, NextResponse } from "next/server";
import { actualizarCliente, cambiarEstadoCliente } from "@/lib/procedures/clientes";
import { clienteSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";
import { z } from "zod";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    // Validar sesión y rol
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    const body = await req.json();
    const validation = clienteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, errors: validation.error.format() }, { status: 400 });
    }

    const { nombres, apellidos, documento_identidad, telefono } = validation.data;
    await actualizarCliente({
      id_cliente: id,
      nombres,
      apellidos,
      documento: documento_identidad,
      telefono: telefono || "",
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.number === 2627 || error.number === 2601) {
      return NextResponse.json(
        { ok: false, message: "El documento de identidad ya pertenece a otro cliente" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, message: "Error al actualizar" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    // Validar sesión y rol
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const { id: idStr } = await params;
    const body = await req.json();

    const patchSchema = z.object({ activo: z.boolean() });
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, message: "Payload inválido" }, { status: 400 });
    }

    await cambiarEstadoCliente(parseInt(idStr), validation.data.activo);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al cambiar estado" }, { status: 500 });
  }
}
