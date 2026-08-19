import type { MetadataRoute } from "next";
import { DEMO, SITE_URL } from "@/datos/negocio";

/**
 * Sin `lastModified` a la fecha del build: poner la fecha de hoy en TODAS las
 * páginas cada vez que se despliega es mentirle a Google sobre qué ha cambiado.
 * Aquí solo se declaran las URLs y su importancia relativa.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Sin sitemap mientras sea la demo: robots.ts ya la cierra entera.
  if (DEMO) return [];

  const paginas: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
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
    priority,
    changeFrequency,
  }));
}
