/**
 * Diagrama de cabeza de perfil con las bandas de degradado numeradas, como en
 * la lámina de números de peine. Sustituye a la foto de archivo: es dibujo
 * propio, dice algo del trabajo y no finge ser una persona que no existe.
 *
 * `variante` cambia la altura a la que sube el degradado (1 bajo, 2 medio,
 * 3 alto), que es justo lo que distingue un corte de otro.
 */
type Props = {
  variante?: 1 | 2 | 3;
  color?: string;
  className?: string;
  /** Cotas laterales con los números de peine. */
  conCotas?: boolean;
};

const ALTURAS: Record<number, { corte: number; etiquetas: [number, string][] }> = {
  1: { corte: 158, etiquetas: [[188, "0.5"], [168, "2"], [148, "4"]] },
  2: { corte: 132, etiquetas: [[192, "0"], [162, "1"], [130, "3"]] },
  3: { corte: 108, etiquetas: [[190, "0"], [150, "2"], [108, "6"]] },
};

export function DiagramaCabeza({
  variante = 1,
  color = "#c22e10",
  className,
  conCotas = true,
}: Props) {
  const { corte, etiquetas } = ALTURAS[variante];
  const id = `deg-${variante}`;

  return (
    <svg
      viewBox="0 0 220 260"
      role="img"
      aria-label="Diagrama del corte: perfil de la cabeza con las alturas de degradado marcadas"
      className={className}
    >
      <defs>
        <clipPath id={id}>
          <path d="M96 30C140 20 168 42 170 78c1 12 0 18 4 22l22 20c4 4 2 8-4 9l-10 1c2 8 0 13-6 15c4 7 2 17-8 23c-8 6-16 8-20 10v28c0 14 20 24 48 32l14 5v17H14v-17c26-9 48-19 52-35v-18C46 176 34 150 34 118 34 74 58 42 96 30Z" />
        </clipPath>
      </defs>

      {/* Papel de la ficha */}
      <rect x="0" y="0" width="220" height="260" fill="none" />

      {/* Bandas de degradado: cuanto más abajo, más corto el peine */}
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="220" height="260" fill={color} opacity="0.1" />
        <rect x="0" y={corte} width="220" height={260 - corte} fill={color} opacity="0.3" />
        <g stroke={color} strokeWidth="1" opacity="0.75">
          {Array.from({ length: Math.floor((260 - corte) / 6) }, (_, i) => (
            <line key={i} x1="0" y1={corte + i * 6} x2="220" y2={corte + i * 6} />
          ))}
        </g>
      </g>

      {/* Perfil */}
      <path
        d="M96 30C140 20 168 42 170 78c1 12 0 18 4 22l22 20c4 4 2 8-4 9l-10 1c2 8 0 13-6 15c4 7 2 17-8 23c-8 6-16 8-20 10v28c0 14 20 24 48 32l14 5v17H14v-17c26-9 48-19 52-35v-18C46 176 34 150 34 118 34 74 58 42 96 30Z"
        fill="none"
        stroke="#14171a"
        strokeWidth="2"
        strokeLinejoin="miter"
      />

      {/* Línea de corte */}
      <line
        x1="14"
        y1={corte}
        x2="206"
        y2={corte}
        stroke="#14171a"
        strokeWidth="2.5"
        strokeDasharray="8 5"
      />

      {conCotas && (
        <g fontFamily="var(--font-medida)" fontSize="11" fill="#4e575e">
          {etiquetas.map(([y, n]) => (
            <g key={n}>
              <line x1="6" y1={y} x2="16" y2={y} stroke="#a7b0b6" strokeWidth="1.5" />
              <text x="6" y={y - 6} letterSpacing="0.08em">
                {n}
              </text>
            </g>
          ))}
          <line x1="6" y1="30" x2="6" y2="240" stroke="#c2c8cc" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}
