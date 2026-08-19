import { NEGOCIO } from "@/datos/negocio";
import { IconoFlecha } from "@/componentes/Iconos";

/**
 * Mapa por OpenStreetMap, no por Google.
 *
 * El «output=embed» de Google responde 301 y, sobre todo, planta cookies de
 * terceros antes de que nadie haya aceptado nada. OSM se sirve sin ellas, así
 * que el mapa puede estar en la página sin pelearse con el banner.
 */
export function Mapa({ className = "" }: { className?: string }) {
  const consulta = encodeURIComponent(
    `${NEGOCIO.direccion}, ${NEGOCIO.codigoPostal} ${NEGOCIO.ciudad}`,
  );

  return (
    <figure className={`flex flex-col border border-tinta-60 ${className}`}>
      <iframe
        src={NEGOCIO.mapa}
        title={`Mapa de la zona de ${NEGOCIO.nombreLargo}`}
        loading="lazy"
        className="min-h-[18rem] w-full flex-1 grayscale-[0.55] contrast-[1.05]"
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-tinta-60 px-4 py-3">
        <span className="cota text-acero-30">{NEGOCIO.ciudad}</span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${consulta}`}
          target="_blank"
          rel="noreferrer"
          className="cota inline-flex items-center gap-2 text-bermellon-vivo transition-colors hover:text-white"
        >
          Cómo llegar
          <IconoFlecha className="h-4 w-4" />
        </a>
      </figcaption>
    </figure>
  );
}
