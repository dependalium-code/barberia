import type { MetadataRoute } from "next";
import { SITE_URL } from "@/datos/negocio";

/**
 * Se deja rastrear todo (menos lo privado) a propósito, incluso en modo
 * demostración: quien decide qué se indexa es la etiqueta `robots` de cada
 * página, no este archivo. Un `Disallow` aquí impediría a Google leer el
 * `noindex` de las páginas de la barbería de ejemplo, y una URL bloqueada
 * puede acabar indexada igual, sin descripción.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel", "/entrar", "/cita/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
