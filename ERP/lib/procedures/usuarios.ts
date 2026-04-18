import { getDbPool, sql } from "../db";

export async function listarUsuarios() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Usuario_Listar");
  return result.recordset;
}

export async function setUsuarioEstado(id_usuario: number, activo: boolean) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_usuario", id_usuario)
    .input("activo", activo)
    .execute("sp_Usuario_SetEstado");
  return { ok: true };
}

export async function setUsuarioAprobado(id_usuario: number, aprobado: boolean) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_usuario", id_usuario)
    .input("aprobado", aprobado)
    .execute("sp_Usuario_Aprobar");
  return { ok: true };
}

export async function resetUsuarioPassword(id_usuario: number, password_hash: Buffer, id_admin: number) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("id_usuario", id_usuario)
    .input("password_hash", password_hash)
    .input("id_admin", id_admin)
    .execute("sp_Admin_ResetPassword");
  return result.recordset?.[0] || null;
}
