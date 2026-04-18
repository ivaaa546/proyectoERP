import { NextRequest, NextResponse } from "next/server";
import { spRegistroPublico } from "@/lib/procedures/auth";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body.nombre || "").trim();
    const correo = String(body.correo || "").trim();
    const password = String(body.password || "");
    const id_rol = Number(body.id_rol);

    if (!nombre || !correo || !password || isNaN(id_rol)) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const registroResult = await spRegistroPublico({
      nombre,
      correo,
      password_hash: hashPassword(password),
      id_rol,
    });

    if (registroResult?.estado === "FALLIDO") {
      return NextResponse.json(
        { ok: false, message: registroResult.mensaje },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: registroResult?.mensaje || "Registro exitoso.",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Error interno al procesar el registro.",
      },
      { status: 500 }
    );
  }
}
