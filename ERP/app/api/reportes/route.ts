import { NextResponse } from "next/server";
import { getReporteVentasPorCategoria, getReporteClientesVIP, getReporteJerarquico, getReporteVentasTiempo } from "@/lib/procedures/reportes";
import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
  }
  if (user.rol !== "Administrador" && user.rol !== "Reportes") {
    return NextResponse.json({ ok: false, message: "No autorizado. Permisos insuficientes." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  try {
    let data;
    switch (tipo) {
      case "ventas_categoria":
        data = await getReporteVentasPorCategoria();
        break;
      case "clientes_vip":
        data = await getReporteClientesVIP();
        break;
      case "jerarquico":
        data = await getReporteJerarquico();
        break;
      case "ventas_tiempo":
        data = await getReporteVentasTiempo();
        break;
      default:
        return NextResponse.json({ message: "Tipo de reporte inválido" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    return NextResponse.json({ message: "Error al generar el reporte" }, { status: 500 });
  }
}
