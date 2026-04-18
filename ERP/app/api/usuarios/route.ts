import { NextResponse } from "next/server";
import { listarUsuarios } from "@/lib/procedures/usuarios";

export async function GET() {
  try {
    const users = await listarUsuarios();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
  }
}
