import { getDbPool } from "../db";

export async function listarClientes() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Cliente_Listar");
  return result.recordset;
}

export async function crearCliente(data: {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
}) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("nombres", data.nombres)
    .input("apellidos", data.apellidos)
    .input("documento", data.documento)
    .input("telefono", data.telefono)
    .execute("sp_Cliente_Crear");
  
  return result.recordset?.[0];
}

export async function actualizarCliente(data: {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
}) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_cliente", data.id_cliente)
    .input("nombres", data.nombres)
    .input("apellidos", data.apellidos)
    .input("documento", data.documento)
    .input("telefono", data.telefono)
    .execute("sp_Cliente_Actualizar");
  
  return { ok: true };
}

export async function cambiarEstadoCliente(id: number, activo: boolean) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_cliente", id)
    .input("activo", activo ? 1 : 0)
    .execute("sp_Cliente_Estado");
  
  return { ok: true };
}
