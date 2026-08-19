import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Aparte de auth.ts a propósito: el seed necesita cifrar la contraseña y no
// puede arrastrar `next/headers` ni el cliente de Prisma.

const scryptAsync = promisify(scrypt) as (
  clave: string,
  sal: Buffer,
  largo: number,
) => Promise<Buffer>;

export async function hashClave(clave: string): Promise<string> {
  const sal = randomBytes(16);
  const derivada = await scryptAsync(clave, sal, 64);
  return `scrypt$${sal.toString("base64")}$${derivada.toString("base64")}`;
}

export async function claveCorrecta(clave: string, guardado: string): Promise<boolean> {
  const [algoritmo, salB64, hashB64] = guardado.split("$");
  if (algoritmo !== "scrypt" || !salB64 || !hashB64) return false;
  const esperado = Buffer.from(hashB64, "base64");
  const derivada = await scryptAsync(clave, Buffer.from(salB64, "base64"), esperado.length);
  return derivada.length === esperado.length && timingSafeEqual(derivada, esperado);
}
