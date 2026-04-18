import { NextRequest, NextResponse } from "next/server";
import { listarCategorias, crearCategoria } from "@/lib/procedures/categorias";
import { categoriaSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    const data = await listarCategorias();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al listar categorías" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });

    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const body = await req.json();
    const validation = categoriaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, errors: validation.error.format() }, { status: 400 });
    }

    const result = await crearCategoria(validation.data);
    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: "Error al crear categoría", error: error.message }, { status: 500 });
  }
}
