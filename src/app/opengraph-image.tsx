import { ImageResponse } from "next/og";
import { NEGOCIO } from "@/datos/negocio";

// Imagen al compartir cualquier página (WhatsApp, LinkedIn, X), 1200×630.
// Ninguna página declara su propio openGraph, así que esta imagen baja a todas.
// Colores de la lámina de la web: papel acero, tinta negra y bermellón.
export const alt = `${NEGOCIO.nombreLargo} · Cita previa online`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACERO = "#e6e8ea";
const TINTA = "#14171a";
const BERMELLON = "#c22e10";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ACERO,
          color: TINTA,
          padding: "72px 80px",
          borderTop: `24px solid ${BERMELLON}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, color: BERMELLON }}>
          CITA PREVIA ONLINE · MATARÓ
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 800, lineHeight: 1, textTransform: "uppercase" }}>
            {NEGOCIO.nombreLargo}
          </div>
          <div style={{ display: "flex", fontSize: 40, marginTop: 28, maxWidth: 980 }}>
            {NEGOCIO.reclamo}. Mira los huecos libres de hoy y reserva sin esperas.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, borderTop: `3px solid ${TINTA}`, paddingTop: 20 }}>
          labarberiamataro.com
        </div>
      </div>
    ),
    size,
  );
}
