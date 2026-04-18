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

    const body = await req.json();
    const rutaArchivo = String(body.ruta_archivo || "");

    if (!rutaArchivo) {
      return NextResponse.json({ ok: false, message: "ruta_archivo es requerido" }, { status: 400 });
    }

    const pool = await getDbPool();
    await pool
      .request()
      .input("ruta_archivo", sql.NVarChar(500), rutaArchivo)
      .execute("sp_RestaurarBackup");

    return NextResponse.json({ ok: true, message: "Restore ejecutado" });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al restaurar backup", error: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
