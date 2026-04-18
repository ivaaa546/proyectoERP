import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.REPORTES) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const pool = await getDbPool();
    const result = await pool.request().query("SELECT TOP 100 * FROM MonitoreoRendimiento ORDER BY id_monitoreo DESC");
    return NextResponse.json({ ok: true, data: result.recordset });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al listar monitoreo", error: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
