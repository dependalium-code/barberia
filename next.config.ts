import type { NextConfig } from "next";

/**
 * Redirecciones de la WordPress a la que sustituye esta web.
 *
 * Solo se redirige lo que tiene un destino HONESTO: una página que contesta lo
 * mismo que contestaba la vieja. Todo lo demás —las 950 páginas de municipio,
 * las landings de ciudad y los servicios retirados— se retira con 410 desde
 * `src/middleware.ts`, porque mandarlas todas a la portada es un 404 disfrazado
 * y Google lo trata como tal.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      // www → dominio a secas. Si los dos sirven con 200 es contenido
      // duplicado: el canónico lo resuelve, pero un 301 lo deja sin discusión.
      {
        source: "/:ruta*",
        has: [{ type: "host", value: "www.labarberiamataro.com" }],
        destination: "https://labarberiamataro.com/:ruta*",
        permanent: true,
      },
      { source: "/nuestro-equipo", destination: "/equipo", permanent: true },
      { source: "/contacta", destination: "/contacto", permanent: true },
      { source: "/politica-de-privacidad", destination: "/privacidad", permanent: true },
      // «Términos y condiciones» y «Aviso legal» decían lo mismo en la vieja.
      { source: "/terminos-y-condiciones", destination: "/aviso-legal", permanent: true },
    ];
  },
};

export default nextConfig;
