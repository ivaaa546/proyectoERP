import { getDbPool } from "../db";

export async function getReporteVentasPorCategoria() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Reporte_VentasPorCategoria");
  return result.recordset;
}

export async function getReporteClientesVIP() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Reporte_ClientesVIP");
  return result.recordset;
}

export async function getReporteJerarquico() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Reporte_Jerarquico");
  return result.recordset;
}

export async function getReporteVentasTiempo() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Reporte_VentasTiempo");
  return result.recordset;
}
