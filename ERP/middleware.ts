import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RUTAS_PROTEGIDAS } from "@/lib/permisos";

function getPathRole(pathname: string) {
  return Object.entries(RUTAS_PROTEGIDAS).find(([route]) => pathname.startsWith(route));
}

const API_ROLE_RULES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/api/productos", roles: ["Administrador", "Vendedor"] },
  { prefix: "/api/categorias", roles: ["Administrador", "Vendedor"] },
  { prefix: "/api/clientes", roles: ["Administrador", "Vendedor"] },
  { prefix: "/api/ventas", roles: ["Administrador", "Vendedor"] },
  { prefix: "/api/usuarios", roles: ["Administrador"] },
  { prefix: "/api/backups", roles: ["Administrador"] },
  { prefix: "/api/reportes", roles: ["Administrador", "Reportes"] },
  { prefix: "/api/analytics", roles: ["Administrador", "Reportes"] },
  { prefix: "/api/monitoreo", roles: ["Administrador", "Reportes"] },
  { prefix: "/api/predicciones", roles: ["Administrador", "Reportes"] },
];

function getApiRoleRule(pathname: string) {
  return API_ROLE_RULES.find((rule) => pathname.startsWith(rule.prefix));
}

function parseSessionRole(req: NextRequest): string | null {
  const session = req.cookies.get("erp_session")?.value;
  if (!session) return null;

  try {
    const parsed = JSON.parse(session) as { rol?: string };
    return parsed.rol || null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/logout") || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const apiRule = getApiRoleRule(pathname);
    if (!apiRule) return NextResponse.next();

    const role = parseSessionRole(req);
    if (!role) {
      return NextResponse.json({ ok: false, message: "No autenticado" }, { status: 401 });
    }

    if (!apiRule.roles.includes(role)) {
      return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }

    return NextResponse.next();
  }

  const matched = getPathRole(pathname);
  if (!matched) return NextResponse.next();

  const [, allowedRoles] = matched;
  const role = parseSessionRole(req);
  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/productos/:path*", "/clientes/:path*", "/ventas/:path*", "/reportes/:path*", "/backups/:path*", "/analytics/:path*", "/prediccion/:path*", "/api/:path*"],
};
