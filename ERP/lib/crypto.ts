import crypto from "crypto";

/**
 * Genera un hash SHA-512 determinista a partir de una cadena de texto.
 * El resultado es un Buffer, ideal para campos VARBINARY en SQL Server.
 */
export function hashPassword(password: string): Buffer {
  return crypto
    .createHash("sha512")
    .update(password)
    .digest();
}
