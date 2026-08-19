import type { MetadataRoute } from "next";
import { SITE_URL } from "@/datos/negocio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel y los enlaces privados de cita no se rastrean nunca.
        disallow: ["/panel", "/entrar", "/cita/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
