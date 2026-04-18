import { getDbPool, sql } from "../db";

export async function listarHistorialBackups() {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .query("SELECT * FROM LogBackups ORDER BY id_backup DESC");
  return result.recordset;
}
