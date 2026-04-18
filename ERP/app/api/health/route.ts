import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET() {
  try {
    await getDbPool();
    return NextResponse.json({ ok: true, message: "DB conectada" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Error de conexion DB",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
