import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente perezoso a propósito.
 *
 * Si se creara al importar el módulo, un despliegue sin `DATABASE_URL` todavía
 * puesta reventaría en la fase de «collecting page data», antes de servir una
 * sola petición y con un error que no dice de dónde viene. Creándolo en el
 * primer acceso, el build sale adelante y el fallo aparece —claro— solo si de
 * verdad se pide algo a la base sin cadena de conexión.
 */
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. En local, copia .env.example a .env; en Vercel, ponla en las variables de entorno del proyecto.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function obtener(): PrismaClient {
  if (!globalParaPrisma.prisma) globalParaPrisma.prisma = crearCliente();
  return globalParaPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_objetivo, propiedad, receptor) {
    return Reflect.get(obtener() as object, propiedad, receptor);
  },
});
