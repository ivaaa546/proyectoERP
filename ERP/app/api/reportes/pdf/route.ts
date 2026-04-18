import { NextResponse } from "next/server";
import { getReporteVentasPorCategoria, getReporteClientesVIP, getReporteJerarquico, getReporteVentasTiempo } from "@/lib/procedures/reportes";

function generateHTML(title: string, data: any[]) {
  if (!data || data.length === 0) {
    return `<p>No hay datos para el reporte.</p>`;
  }

  const keys = Object.keys(data[0]);

  const rowsHtml = data
    .map(
      (obj) =>
        `<tr>${keys.map((k) => `<td style="padding: 8px; border: 1px solid #ddd;">${obj[k]}</td>`).join("")}</tr>`
    )
    .join("");

  const headerHtml = `<tr>${keys
    .map(
      (k) =>
        `<th style="padding: 10px 8px; background-color: #f3f4f6; color: #111827; text-align: left; border: 1px solid #ddd;">${k.toUpperCase()}</th>`
    )
    .join("")}</tr>`;

  return `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
          h1 { text-align: center; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          @media print {
            body { padding: 0; }
            button { display: none !important; }
          }
          .print-btn {
              display: block; margin: 0 auto 20px; padding: 10px 20px; background-color: #38bdf8; 
              color: #fff; font-weight: bold; border: none; border-radius: 5px; cursor: pointer;
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
        <h1>${title}</h1>
        <table>
          <thead>${headerHtml}</thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
            // Open print dialog automatically
            window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;
}

import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("No autenticado. Inicie sesión mediante la plataforma principal.", { status: 401 });
  }
  if (user.rol !== "Administrador" && user.rol !== "Reportes") {
    return new NextResponse("No autorizado. Necesita rol de Administrador o Reportes.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  try {
    let data;
    let title = "Reporte";

    switch (tipo) {
      case "ventas_categoria":
        data = await getReporteVentasPorCategoria();
        title = "Reporte de Rendimiento de Ventas por Categoría";
        break;
      case "clientes_vip":
        data = await getReporteClientesVIP();
        title = "Reporte de Clientes VIP";
        break;
      case "jerarquico":
        data = await getReporteJerarquico();
        title = "Reporte Jerárquico de Productos y Ventas";
        break;
      case "ventas_tiempo":
        data = await getReporteVentasTiempo();
        title = "Reporte de Evolución de Ventas a través del Tiempo";
        break;
      default:
        return new NextResponse("Tipo de reporte inválido", { status: 400 });
    }

    const htmlStr = generateHTML(title, data);

    return new NextResponse(htmlStr, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      },
    });
  } catch (error) {
    console.error("Error al exportar PDF HTML:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
