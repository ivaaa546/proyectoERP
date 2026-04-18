import { NextResponse } from "next/server";
import { listarHistorialBackups } from "@/lib/procedures/backups";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    const history = await listarHistorialBackups();
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al obtener historial de backups" },
      { status: 500 }
    );
  }
}
