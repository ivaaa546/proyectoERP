import { cookies } from "next/headers";

export type SessionData = {
  id_usuario: number;
  nombre: string;
  rol: string;
};

export async function getSessionUser(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("erp_session")?.value;

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionData>;
    if (!parsed.id_usuario || !parsed.rol || !parsed.nombre) {
      return null;
    }

    return {
      id_usuario: parsed.id_usuario,
      nombre: parsed.nombre,
      rol: parsed.rol,
    };
  } catch {
    return null;
  }
}
