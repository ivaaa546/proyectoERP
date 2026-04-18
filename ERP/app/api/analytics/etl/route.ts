import { NextResponse } from "next/server";
import { getDbPool, sql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.REPORTES) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const pool = await getDbPool();
    await pool.request().input("anio_inicio", sql.Int, 2020).input("anio_fin", sql.Int, 2030).execute("dw.sp_PoblarDimTiempo");
    await pool.request().execute("dw.sp_CargarDataWarehouse");
    return NextResponse.json({ ok: true, message: "ETL ejecutado" });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al ejecutar ETL", error: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
