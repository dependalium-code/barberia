import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { DEMO, NEGOCIO, SITE_URL } from "@/datos/negocio";
import "./globals.css";

const titular = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--tipo-titular",
  display: "swap",
});

const medida = Martian_Mono({
  subsets: ["latin"],
  variable: "--tipo-medida",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NEGOCIO.nombreLargo} · Cita previa online`,
    template: `%s · ${NEGOCIO.nombreLargo}`,
  },
  description: NEGOCIO.descripcion,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: NEGOCIO.nombreLargo,
    title: `${NEGOCIO.nombreLargo} · Cita previa online`,
    description: NEGOCIO.descripcion,
  },
  // La barbería de ejemplo no se indexa, pero SÍ se siguen sus enlaces: con
  // `nofollow`, Google no llegaría a /para-barberias desde ninguna página y la
  // única puerta sería el sitemap.
  robots: DEMO ? { index: false, follow: true } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e6e8ea",
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${titular.variable} ${medida.variable}`}>
      <body className="min-h-dvh antialiased">
        {/* El contrato de dirección se emite como comentario HTML de verdad:
            un comentario JSX se lo come el compilador y solo queda en los mapas
            de origen, así que en producción no habría nada que auditar. */}
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
  THESIS: la agenda es un instrumento de medida, no un formulario. Esta web
  enseña los huecos reales antes de pedir nada y rechaza el hero de foto oscura
  con dorado que lleva toda barbería.
  OWN-WORLD: la lámina de números de peine que cuelga junto al espejo. Papel
  acero #E6E8EA, dos tintas — negro #14171A y bermellón #C22E10 —, bloques
  rayados con filete, titulares Archivo en ancho 125% y caja alta, y toda cifra
  en Martian Mono con cotas de plano. La graduación vive dentro de los
  instrumentos (la regla del día, las barras de duración), no de fondo. Sin
  tarjetas iguales, sin antetítulos, sin franjas laterales de color, sin dorado.
  STORY: el visitante ve libre la hora de hoy, entiende cuánto dura y cuánto
  cuesta, y reserva en cuatro toques sin registrarse.
  FIRST VIEWPORT: campo bermellón a sangre; el nombre en Archivo enorme; debajo,
  un instrumento enmarcado que contiene la regla graduada del día con las marcas
  de los huecos LIBRES DE VERDAD, las primeras horas tocables y, cerrándolo por
  abajo, el propio botón de reservar.
  FORM: carta técnica del barbero, 7.ª de la lista propia. Semilla d3e9feb1.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        <a
          href="#contenido"
          className="cota sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-tinta focus:px-5 focus:py-3 focus:text-white"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
