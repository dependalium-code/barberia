import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 ya no lee .env por su cuenta.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // En Vercel/CI no hay .env: las variables ya vienen del entorno.
}

// Ojo: NO usar el ayudante env() de prisma/config aquí. Lanza si la variable no
// existe y eso tumba el `npm install` (postinstall) en cualquier clon limpio.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
