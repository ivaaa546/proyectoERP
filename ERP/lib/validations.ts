import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(150),
  descripcion: z.string().max(300).optional().or(z.literal("")),
  precio: z.preprocess((val) => parseFloat(String(val)), z.number().positive("El precio debe ser mayor a 0")),
  id_categoria: z.preprocess((val) => parseInt(String(val)), z.number().int().positive("Categoría inválida")),
  stock_inicial: z.preprocess((val) => parseInt(String(val)), z.number().int().min(0, "El stock no puede ser negativo")).optional(),
});

export type ProductoInput = z.infer<typeof productoSchema>;

export const clienteSchema = z.object({
  nombres: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  apellidos: z.string().min(3, "El apellido debe tener al menos 3 caracteres").max(100),
  documento_identidad: z.string().min(5, "El documento debe ser válido").max(20),
  telefono: z.string().max(20).optional().or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const detalleVentaSchema = z.object({
  id_producto: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precio_unitario: z.number().positive(),
});

export const ventaSchema = z.object({
  id_cliente: z.number().int().positive(),
  detalles: z.array(detalleVentaSchema).min(1, "La venta debe tener al menos un producto"),
});

export type VentaInput = z.infer<typeof ventaSchema>;

export const categoriaSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  descripcion: z.string().max(255).optional().or(z.literal("")),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
