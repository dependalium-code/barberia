import type { MetadataRoute } from "next";
import { DEMO, SITE_URL } from "@/datos/negocio";

export default function robots(): MetadataRoute.Robots {
  // Mientras sea la maqueta de demostración no se indexa NADA: tiene una
  // dirección inventada y una ficha de negocio que no existe. Que Google la
  // recoja solo sirve para crear un local fantasma en Mataró.
  if (DEMO) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

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
