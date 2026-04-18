import { getDbPool, sql } from "../db";

export async function listarProductos() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Producto_Listar");
  return result.recordset;
}

export async function listarCategorias() {
  const pool = await getDbPool();
  const result = await pool.request().execute("sp_Categoria_Listar");
  return result.recordset;
}

export async function crearProducto(data: {
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
  stock_inicial: number;
  id_usuario_audit: number;
}) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("nombre", data.nombre)
    .input("descripcion", data.descripcion || "")
    .input("precio", data.precio)
    .input("id_categoria", data.id_categoria)
    .input("stock_inicial", data.stock_inicial)
    .input("id_usuario_audit", data.id_usuario_audit)
    .execute("sp_Producto_Crear");
  
  return result.recordset?.[0];
}

export async function actualizarProducto(data: {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: number;
}) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_producto", data.id_producto)
    .input("nombre", data.nombre)
    .input("descripcion", data.descripcion || "")
    .input("precio", data.precio)
    .input("id_categoria", data.id_categoria)
    .execute("sp_Producto_Actualizar");
  
  return { ok: true };
}

export async function eliminarProducto(id: number) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_producto", id)
    .execute("sp_Producto_Eliminar");
  return { ok: true };
}

export async function cambiarEstadoProducto(id: number, activo: boolean) {
  const pool = await getDbPool();
  await pool
    .request()
    .input("id_producto", id)
    .input("activo", activo ? 1 : 0)
    .execute("sp_Producto_Estado");
  return { ok: true };
}

export async function actualizarStock(id_producto: number, nueva_cantidad: number, nuevo_minimo: number) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input("id_producto", id_producto)
    .input("nueva_cantidad", nueva_cantidad)
    .input("nuevo_minimo", nuevo_minimo)
    .execute("sp_Inventario_ActualizarStock");
  
  return { ok: true, actualizados: result.recordset?.[0]?.Actualizados };
}
