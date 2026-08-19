import type { MetadataRoute } from "next";
import { DEMO, SITE_URL } from "@/datos/negocio";

/**
 * Sin `lastModified` a la fecha del build: poner la fecha de hoy en TODAS las
 * páginas cada vez que se despliega es mentirle a Google sobre qué ha cambiado.
 *
 * En modo demostración solo se declara la página de venta. Las de la barbería
 * de ejemplo van con `noindex`, así que anunciarlas sería pedirle a Google que
 * rastree lo que le acabamos de decir que no indexe.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paginas: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = DEMO
    ? [["/para-barberias", 1, "monthly"]]
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
    priority,
    changeFrequency,
  }));
}
