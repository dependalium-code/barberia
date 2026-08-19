/**
 * Prueba el SMTP sin enviar nada:  npm run correo:probar
 *
 * Lee las variables de `.env.local` (las que bajan de Vercel) y si no, de
 * `.env`. Dice LOGIN OK o el motivo exacto: 535 credenciales, 550 buzón,
 * ETIMEDOUT puerto bloqueado. Se lanza ANTES de tocar el panel de Vercel.
 */
import path from "node:path";

// Sin top-level await: tsx compila estos scripts a CommonJS y no lo admite.
async function principal() {
  for (const f of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(process.cwd(), f));
    } catch {}
  }

  const { probarCredenciales } = await import("../src/lib/correo");

  const donde = `${process.env.SMTP_USUARIO ?? "(sin usuario)"} en ${process.env.SMTP_HOST ?? "(sin host)"}:${process.env.SMTP_PORT ?? 465}`;
  console.log(`Probando ${donde}…`);

  const r = await probarCredenciales();
  console.log(r.ok ? "✔ LOGIN OK — el correo puede salir" : `✘ NO entra — ${r.motivo}`);
  console.log(`  Los avisos irían a: ${process.env.AVISOS_EMAIL ?? "(falta AVISOS_EMAIL)"}`);
  process.exit(r.ok ? 0 : 1);
}

void principal();
