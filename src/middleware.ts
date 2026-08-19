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

export function middleware(peticion: NextRequest) {
  const ruta = peticion.nextUrl.pathname;

  if (RETIRADAS.some((r) => r.test(ruta)) || WORDPRESS.some((r) => r.test(ruta))) {
    return new NextResponse(null, {
      status: 410,
      headers: { "x-robots-tag": "noindex" },
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
