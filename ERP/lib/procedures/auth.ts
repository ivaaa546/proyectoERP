import { getDbPool } from "../db";

type LoginParams = {
  correo: string;
  password_hash: Buffer;
  ip_address?: string;
};

export async function spLogin(params: LoginParams) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    // Inferencia de tipos para evitar errores de validación de parámetros
    .input("correo", params.correo)
    .input("password_hash", params.password_hash)
    .input("ip_address", params.ip_address || null)
    .execute("sp_Login");

  return result.recordset?.[0] || null;
}

type RegistroParams = {
  nombre: string;
  correo: string;
  password_hash: Buffer;
  id_rol: number;
};

export async function spRegistroPublico(params: RegistroParams) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("nombre", params.nombre)
    .input("correo", params.correo)
    .input("password_hash", params.password_hash)
    .input("id_rol", params.id_rol)
    .execute("sp_Usuario_RegistroPublico");

  return result.recordset?.[0] || null;
}

export async function spCambiarPassword(
  id_usuario: number,
  password_viejo: Buffer,
  password_nuevo: Buffer
) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("id_usuario", id_usuario)
    .input("password_viejo", password_viejo)
    .input("password_nuevo", password_nuevo)
    .execute("sp_CambiarPassword");

  return result.recordset?.[0] || null;
}
