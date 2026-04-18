import { getDbPool } from "../db";

export async function listarVentas() {
  const pool = await getDbPool();
  return (await pool.request().execute("sp_Venta_Listar")).recordset;
}

export async function obtenerDetalleVenta(id_venta: number) {
  const pool = await getDbPool();
  return (await pool.request()
    .input("id_venta", id_venta)
    .execute("sp_Venta_ObtenerDetalle")).recordset;
}

export async function registrarVenta(data: {
  id_cliente: number;
  id_usuario: number;
  detalles: Array<{ id_producto: number; cantidad: number; precio_unitario: number }>;
}) {
  const pool = await getDbPool();
  
  // Enviamos los detalles como un string JSON. 
  // Esto es inmune a los errores de "validate is not a function" del driver.
  const detallesJSON = JSON.stringify(data.detalles);

  const result = await pool
    .request()
    .input("id_cliente", data.id_cliente)
    .input("id_usuario", data.id_usuario)
    .input("detallesJSON", detallesJSON) // Enviamos texto plano
    .execute("sp_RegistrarVenta");

  return {
    ok: true,
    id_venta: result.recordset?.[0]?.ID,
    total: result.recordset?.[0]?.Total,
  };
}
