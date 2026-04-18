import { getDbPool } from "../db";

export async function listarCategorias() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Categoria_Listar");
  return result.recordset;
}

export async function crearCategoria(data: { nombre: string; descripcion: string }) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("nombre", data.nombre)
    .input("descripcion", data.descripcion || "")
    .execute("sp_Categoria_Crear");
  return result.recordset?.[0];
}

export async function actualizarCategoria(data: {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_categoria", data.id_categoria)
    .input("nombre", data.nombre)
    .input("descripcion", data.descripcion || "")
    .execute("sp_Categoria_Actualizar");
  return { ok: true };
}

export async function eliminarCategoria(id: number) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_categoria", id)
    .execute("sp_Categoria_Eliminar");
  return { ok: true };
}

export async function cambiarEstadoCategoria(id: number, activo: boolean) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_categoria", id)
    .input("activo", activo ? 1 : 0)
    .execute("sp_Categoria_Estado");
  return { ok: true };
}
