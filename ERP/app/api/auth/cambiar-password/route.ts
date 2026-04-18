import { NextRequest, NextResponse } from "next/server";
import { spCambiarPassword } from "@/lib/procedures/auth";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("erp_session")?.value;
    if (!sessionCookie) {
        return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    let userId = null;
    try {
        userId = JSON.parse(sessionCookie).id_usuario;
    } catch {
        return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
    }

    const body = await req.json();
    const { password_viejo, password_nuevo } = body;

    if (!password_viejo || !password_nuevo) {
      return NextResponse.json(
        { ok: false, message: "Las contraseñas son requeridas" },
        { status: 400 }
      );
    }

    if (password_nuevo.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Su nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const result = await spCambiarPassword(
      userId,
      hashPassword(password_viejo),
      hashPassword(password_nuevo)
    );

    if (result?.estado === "FALLIDO") {
      return NextResponse.json(
        { ok: false, message: result.mensaje },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada exitosamente.",
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 }
    );
  }
}
