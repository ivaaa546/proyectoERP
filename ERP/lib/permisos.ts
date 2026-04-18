export const ROLES = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
  REPORTES: "Reportes",
} as const;

export const RUTAS_PROTEGIDAS: Record<string, string[]> = {
  "/dashboard": [ROLES.ADMIN, ROLES.VENDEDOR, ROLES.REPORTES],
  "/productos": [ROLES.ADMIN, ROLES.VENDEDOR],
  "/clientes": [ROLES.ADMIN, ROLES.VENDEDOR],
  "/ventas": [ROLES.ADMIN, ROLES.VENDEDOR],
  "/reportes": [ROLES.ADMIN, ROLES.REPORTES],
  "/backups": [ROLES.ADMIN],
  "/analytics": [ROLES.ADMIN, ROLES.REPORTES],
  "/predicciones": [ROLES.ADMIN, ROLES.REPORTES],
};
