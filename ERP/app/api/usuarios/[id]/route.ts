import { NextRequest, NextResponse } from "next/server";
import { setUsuarioEstado, setUsuarioAprobado, resetUsuarioPassword } from "@/lib/procedures/usuarios";
import { hashPassword } from "@/lib/crypto";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userId = parseInt(id);

    if (body.activo !== undefined) {
      await setUsuarioEstado(userId, body.activo);
    }

    if (body.aprobado !== undefined) {
      await setUsuarioAprobado(userId, body.aprobado);
    }

    if (body.reset_password === true && body.new_password) {
      // Intentar obtener el ID del admin desde la cookie de sesión
      let adminId = null;
      const session = req.cookies.get("erp_session")?.value;
      if (session) {
        try {
          adminId = JSON.parse(session).id_usuario;
        } catch (e) {}
      }
      await resetUsuarioPassword(userId, hashPassword(body.new_password), adminId || -1);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar usuario" }, { status: 500 });
  }
}
