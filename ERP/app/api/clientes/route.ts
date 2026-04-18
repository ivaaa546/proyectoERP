import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { listarClientes, crearCliente } from "@/lib/procedures/clientes";
import { clienteSchema } from "@/lib/validations";
import { getSessionUser } from "@/lib/session";
import { ROLES } from "@/lib/permisos";

export async function GET() {
  try {
    // Validar sesión y rol (Admin o Vendedor) para defensa en profundidad
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const data = await listarClientes();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Error al listar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    // Validar sesión y rol (Admin o Vendedor)
    if (!user) return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 401 });
    if (user.rol !== ROLES.ADMIN && user.rol !== ROLES.VENDEDOR) {
      return NextResponse.json({ ok: false, message: "Permisos insuficientes" }, { status: 403 });
    }

    const body = await req.json();
    const validation = clienteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false, errors: validation.error.format() }, { status: 400 });
    }

    const { nombres, apellidos, documento_identidad, telefono } = validation.data;
    const result = await crearCliente({
      nombres,
      apellidos,
      documento: documento_identidad,
      telefono: telefono || "",
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    // Código 2627 o 2601 es violación de restricción UNIQUE en SQL Server
    if (error.number === 2627 || error.number === 2601) {
      return NextResponse.json(
        { ok: false, message: "Este documento de identidad ya está registrado con otro cliente" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, message: "Error al crear cliente", error: error.message },
      { status: 500 }
    );
  }
}
