import { NextResponse, type NextRequest } from "next/server";

/**
 * Retira las URLs de la WordPress anterior que no tienen sustituta.
 *
 * Se responde **410 Gone** y no 404: 410 dice «esto se ha retirado a
 * propósito», y Google lo saca del índice antes y deja de reintentarlo. Un 404
 * lo reintenta durante meses.
 *
 * Y NO se redirigen a la portada: 950 municipios apuntando todos al mismo sitio
 * es un 404 disfrazado (soft 404) y además era justo el patrón de páginas
 * duplicadas que convenía retirar.
 *
 * ⚠️ Si el servicio a domicilio o el de residencias sigue vivo en otra web del
 * grupo, saca esas dos rutas de aquí y ponles un 301 al destino real en
 * `next.config.ts`. Retirarlas es una decisión de negocio, no técnica.
 */
const RETIRADAS: RegExp[] = [
  /^\/localidad(\/|$)/, // las ~950 páginas de municipio
  /^\/barberia-en-[^/]+\/?$/, // landings de ciudad
  /^\/barberia-cerca-de-[^/]+\/?$/,
  /^\/servicio-a-domicilio\/?$/,
  /^\/servicio-en-residencias\/?$/,
  /^\/trabaja-con-nosotros\/?$/,
  /^\/gracias\/?$/,
];

/** Restos de WordPress: no existen y no van a existir. */
const WORDPRESS: RegExp[] = [
  /^\/wp-(admin|includes|content|login\.php|json|cron\.php|signup\.php|trackback)/,
  /^\/xmlrpc\.php$/,
  /^\/feed\/?$/,
  /^\/(comments\/)?feed\/?$/,
];

/**
 * El 410 se sirve CON página, no en blanco.
 *
 * Estas URLs estaban indexadas de verdad, así que durante semanas seguirá
 * llegando gente desde Google. El código de estado es para el buscador; la
 * página es para la persona, que si no se encuentra un folio en blanco y se va.
 *
 * Va escrita aquí a mano porque el middleware no puede pintar React ni cargar
 * la hoja de estilos del sitio.
 */
function paginaRetirada(esWordPress: boolean): string {
  const titulo = esWordPress ? "Aquí no hay nada" : "Esta página ya no está";
  const texto = esWordPress
    ? "Esa dirección era de la web anterior y ya no existe."
    : "Retiramos el servicio a domicilio y en residencias, y las páginas de cada municipio se fueron con él. No es un fallo: ya no lo hacemos.";

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${titulo} · La Barbería</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700&family=Martian+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:2rem;
       background:#e6e8ea;color:#14171a;
       font-family:Archivo,'Helvetica Neue',Arial,sans-serif;line-height:1.65}
  main{max-width:34rem}
  .cota{font-family:'Martian Mono',ui-monospace,monospace;font-size:.6875rem;
        letter-spacing:.14em;text-transform:uppercase;color:#c22e10}
  h1{font-weight:700;text-transform:uppercase;letter-spacing:-.025em;line-height:.95;
     font-size:clamp(2rem,7vw,3.4rem);margin:.6rem 0 0}
  p{color:#4e575e;margin:1.2rem 0 0}
  .acciones{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}
  a{display:inline-block;padding:.9rem 1.6rem;text-decoration:none;
    font-family:'Martian Mono',ui-monospace,monospace;font-size:.6875rem;
    letter-spacing:.14em;text-transform:uppercase}
  .primaria{background:#c22e10;color:#fff}
  .primaria:hover{background:#14171a}
  .secundaria{border:2px solid #14171a;color:#14171a}
  .secundaria:hover{background:#14171a;color:#fff}
</style></head><body><main>
  <p class="cota">Error 410 · retirada</p>
  <h1>${titulo}</h1>
  <p>${texto}</p>
  <div class="acciones">
    <a class="primaria" href="/">Ir a la portada</a>
    <a class="secundaria" href="/para-barberias">Tengo una barbería</a>
  </div>
</main></body></html>`;
}

export function middleware(peticion: NextRequest) {
  const ruta = peticion.nextUrl.pathname;
  const esWordPress = WORDPRESS.some((r) => r.test(ruta));

  if (RETIRADAS.some((r) => r.test(ruta)) || esWordPress) {
    return new NextResponse(paginaRetirada(esWordPress), {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Fuera los estáticos y las rutas internas: si entran aquí, se pierden
    // peticiones de imágenes y fuentes por un matcher demasiado goloso.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)",
    // Y estos a mano, porque la regla de arriba se salta todo lo que lleve
    // extensión y los puntos de entrada de WordPress la llevan.
    "/xmlrpc.php",
    "/wp-login.php",
    "/wp-cron.php",
    "/wp-signup.php",
  ],
};
