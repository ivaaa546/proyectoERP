import { NextRequest, NextResponse } from "next/server";
import { spLogin } from "@/lib/procedures/auth";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const correo = String(body.correo || "");
    const password = String(body.password || "");

    if (!correo || !password) {
      return NextResponse.json({ ok: false, message: "Credenciales incompletas" }, { status: 400 });
    }

    const loginResult = await spLogin({
      correo,
      password_hash: hashPassword(password),
      ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    if (!loginResult || loginResult.estado !== "EXITOSO") {
      return NextResponse.json({ ok: false, message: "Login fallido" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, user: loginResult });
    response.cookies.set("erp_session", JSON.stringify(loginResult), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Error al iniciar sesion",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
