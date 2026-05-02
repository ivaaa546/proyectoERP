import { NextRequest, NextResponse } from "next/server";
import { getDbPool, sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const idUsuario = user.id_usuario;
    const rutaBase = String(body.ruta_base || "C:\\Backups\\");

    const pool = await getDbPool();
    await pool
      .request()
      .input("id_usuario", idUsuario)
      .input("ruta_base", rutaBase)
      .execute("sp_GenerarBackup");

    return NextResponse.json({ ok: true, message: "Backup ejecutado" });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al ejecutar backup", error: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
