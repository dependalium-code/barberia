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

/**
 * Neon entrega la cadena con `sslmode=require`. Hoy el driver lo trata como
 * `verify-full`, pero avisa de que en pg v9 pasará a la semántica de libpq,
 * que verifica menos. Se deja explícito para que el día que cambien la
 * versión no baje la seguridad sin que nadie se entere.
 */
function conSslExplicito(url: string): string {
  try {
    const u = new URL(url);
    const modo = u.searchParams.get("sslmode");
    if (modo && ["require", "prefer", "verify-ca"].includes(modo)) {
      u.searchParams.set("sslmode", "verify-full");
    }
    return u.toString();
  } catch {
    return url; // Si no es una URL válida, que falle el conector y lo diga él.
  }
}

function crearCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. En local, copia .env.example a .env; en Vercel, ponla en las variables de entorno del proyecto.",
    );
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: conSslExplicito(connectionString) }),
  });
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
