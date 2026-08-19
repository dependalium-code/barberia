/**
 * Elige tinta negra o blanca sobre un color de fondo según su luminancia real.
 *
 * Los colores de barbero los pone el negocio desde el panel, así que no se
 * puede dar por hecho que el blanco vale: sobre el dorado o el lila claro el
 * texto blanco se queda en 2:1 y no se lee.
 */

const TINTA = "#14171a";
const BLANCO = "#ffffff";

function canal(v: number) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const h = hex.replace("#", "");
  const largo = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(largo.slice(i, i + 2), 16) || 0);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** La de las dos tintas que más contraste da sobre ese fondo. */
export function tintaSobre(fondo: string): string {
  return contraste(TINTA, fondo) >= contraste(BLANCO, fondo) ? TINTA : BLANCO;
}
