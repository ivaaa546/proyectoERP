import * as sql from "mssql";

// Para evitar que TypeScript se queje del tipo en global
declare global {
  var __erpSqlPool: any; // Usamos any para simplificar la referencia global
}

const config: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE || "bdERP",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: (process.env.DB_ENCRYPT || "false") === "true",
    trustServerCertificate: true,
  },
};

export async function getDbPool() {
  if (!global.__erpSqlPool) {
    global.__erpSqlPool = await new sql.ConnectionPool(config).connect();
  }
  return global.__erpSqlPool;
}

export { sql };
