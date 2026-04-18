import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getDbPool } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    }

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.REPORTES) {
      return NextResponse.json(
        { ok: false, message: "No tiene permisos para ver datos históricos" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "ventas_totales";
    const idProducto = searchParams.get("id_producto");
    const fechaInicio = searchParams.get("fecha_inicio");
    const fechaFin = searchParams.get("fecha_fin");

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { ok: false, message: "Debe proporcionar fecha_inicio y fecha_fin" },
        { status: 400 }
      );
    }

    const pool = await getDbPool();

    let query = "";
    let params: any = {
      fechaInicio,
      fechaFin,
    };

    if (tipo === "producto" && idProducto) {
      query = `
        SELECT 
          CAST(V.fecha AS DATE) as fecha,
          SUM(DV.cantidad * DV.precio_unitario) as valor
        FROM Ventas V
        INNER JOIN DetalleVentas DV ON V.id_venta = DV.id_venta
        WHERE DV.id_producto = @idProducto
          AND CAST(V.fecha AS DATE) BETWEEN @fechaInicio AND @fechaFin
        GROUP BY CAST(V.fecha AS DATE)
        ORDER BY fecha ASC
      `;
      params.idProducto = parseInt(idProducto);
    } else {
      query = `
        SELECT 
          CAST(fecha AS DATE) as fecha,
          SUM(total) as valor
        FROM Ventas
        WHERE CAST(fecha AS DATE) BETWEEN @fechaInicio AND @fechaFin
        GROUP BY CAST(fecha AS DATE)
        ORDER BY fecha ASC
      `;
    }

    const request = pool.request()
      .input("fechaInicio", params.fechaInicio)
      .input("fechaFin", params.fechaFin);

    if (tipo === "producto" && idProducto) {
      request.input("idProducto", parseInt(idProducto));
    }

    const result = await request.query(query);

    const data = result.recordset.map((row: any) => ({
      fecha: row.fecha.toISOString().split("T")[0],
      valor: parseFloat(row.valor) || 0,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error("Error en /api/predicciones/historial:", error);
    return NextResponse.json(
      { ok: false, message: "Error al obtener datos históricos", error: error.message },
      { status: 500 }
    );
  }
}