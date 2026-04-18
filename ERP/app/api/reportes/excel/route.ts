import { NextResponse } from "next/server";
import { getReporteVentasPorCategoria, getReporteClientesVIP, getReporteJerarquico, getReporteVentasTiempo } from "@/lib/procedures/reportes";

function jsonToCsv(json: any[]) {
  if (!json || json.length === 0) return "";
  const keys = Object.keys(json[0]);
  const header = keys.join(",");
  const rows = json.map((obj) =>
    keys
      .map((k) => {
        let value = obj[k] === null || obj[k] === undefined ? "" : obj[k];
        value = String(value).replace(/"/g, '""');
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
        return value;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("No autenticado. Inicie sesión.", { status: 401 });
  }
  if (user.rol !== "Administrador" && user.rol !== "Reportes") {
    return new NextResponse("No autorizado. Necesita rol de Administrador o Reportes.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  try {
    let data;
    let filename = "reporte.csv";

    switch (tipo) {
      case "ventas_categoria":
        data = await getReporteVentasPorCategoria();
        filename = "Ventas_Por_Categoria.csv";
        break;
      case "clientes_vip":
        data = await getReporteClientesVIP();
        filename = "Clientes_VIP.csv";
        break;
      case "jerarquico":
        data = await getReporteJerarquico();
        filename = "Jerarquico_Productos.csv";
        break;
      case "ventas_tiempo":
        data = await getReporteVentasTiempo();
        filename = "Ventas_A_Traves_Del_Tiempo.csv";
        break;
      default:
        return new NextResponse("Tipo de reporte inválido", { status: 400 });
    }

    const csvStr = jsonToCsv(data);

    return new NextResponse(csvStr, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error al exportar CSV:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
