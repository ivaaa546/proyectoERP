import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { listarProductos, crearProducto } from "@/lib/procedures/productos";
import { productoSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    const data = await listarProductos();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al listar productos", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();

    // Validar con Zod
    const validation = productoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, message: "Validación fallida", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const validData = validation.data;
    
    const result = await crearProducto({
      nombre: validData.nombre,
      descripcion: validData.descripcion || "",
      precio: validData.precio,
      id_categoria: validData.id_categoria,
      stock_inicial: validData.stock_inicial || 0,
      id_usuario_audit: user.id_usuario,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error al crear producto", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
