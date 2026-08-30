import type { MetadataRoute } from "next";
import { DEMO, SITE_URL } from "@/datos/negocio";

/**
 * `lastModified` con la fecha REAL de cada página, de FECHAS.
 *
 * Nunca la del build: poner la de hoy en TODAS las páginas cada vez que se
 * despliega es mentirle a Google sobre qué ha cambiado, y acaba haciendo que
 * ignore el dato para el dominio entero. Pero dejarlo en blanco —que era lo de
 * antes— tampoco: `changefreq` y `priority` son sugerencias que Google admite
 * ignorar, y `lastmod` es el único de los tres que es un dato comprobable. La
 * salida no es callar, es decir la verdad.
 *
 * Las fechas son las del último commit que tocó cada `page.tsx`, y se suben A
 * MANO al reescribir contenido. No se calculan en compilación: Vercel clona en
 * superficial y sella todos los ficheros con la hora del build, así que
 * saldrían todas iguales.
 *
 * En modo demostración solo se declara la página de venta. Las de la barbería
 * de ejemplo van con `noindex`, así que anunciarlas sería pedirle a Google que
 * rastree lo que le acabamos de decir que no indexe.
 */
const FECHAS: Record<string, string> = {
  "": "2026-08-20",
  "/reservar": "2026-08-19",
  "/carta": "2026-08-19",
  "/equipo": "2026-08-19",
  "/el-local": "2026-08-19",
  "/contacto": "2026-08-20",
  "/aviso-legal": "2026-08-19",
  "/privacidad": "2026-08-20",
  "/cookies": "2026-08-29",
  "/para-barberias": "2026-08-20",
  "/lo-que-cuesta-la-comision": "2026-08-20",
};

/** Suelo: primer commit del sitio. */
const PUBLICACION = "2026-08-19";
export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = DEMO
    ? [
        ["/para-barberias", 1, "monthly"],
        ["/lo-que-cuesta-la-comision", 0.8, "yearly"],
      ]
    : [
        ["", 1, "weekly"],
        ["/reservar", 0.9, "daily"],
        ["/carta", 0.8, "monthly"],
        ["/equipo", 0.6, "monthly"],
        ["/el-local", 0.6, "monthly"],
        ["/contacto", 0.5, "yearly"],
        ["/aviso-legal", 0.1, "yearly"],
        ["/privacidad", 0.1, "yearly"],
        ["/cookies", 0.1, "yearly"],
      ];

  return paginas.map(([ruta, priority, changeFrequency]) => ({
    url: `${SITE_URL}${ruta}`,
    lastModified: FECHAS[ruta] ?? PUBLICACION,
    priority,
    changeFrequency,
  }));
}
