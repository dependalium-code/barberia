/**
 * Iconografía propia, dibujada con la gramática de la lámina técnica:
 * trazo de 1.5, esquinas vivas, nada redondeado de más. Ni un emoji.
 */
type Props = { className?: string };

const base = "shrink-0";

function Svg({ children, className }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={`${base} ${className ?? "h-5 w-5"}`}
    >
      {children}
    </svg>
  );
}

export function IconoTijera(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="18" r="2.6" />
      <circle cx="18" cy="18" r="2.6" />
      <path d="M8 16.2 18.5 3.5M16 16.2 5.5 3.5" />
    </Svg>
  );
}

export function IconoNavaja(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3 15.5 15.5 3h3.2v3.2L6.2 18.7H3z" />
      <path d="M3 21h18" />
      <path d="M12.5 6 18 11.5" />
    </Svg>
  );
}

export function IconoMaquina(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 9h16v11H4z" />
      <path d="M7 9V4h10v5" />
      <path d="M4 13h16" />
      <path d="M8 4v5M12 4v5M16 4v5" />
    </Svg>
  );
}

export function IconoReloj(p: Props) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5V12l4 2.4" />
    </Svg>
  );
}

export function IconoTelefono(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 4h5l1.6 4.4-2.3 1.7a12.5 12.5 0 0 0 5.6 5.6l1.7-2.3L20 15v5h-2C10.8 20 4 13.2 4 6z" />
    </Svg>
  );
}

export function IconoSitio(p: Props) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </Svg>
  );
}

export function IconoFlecha(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconoCheck(p: Props) {
  return (
    <Svg {...p}>
      <path d="M4 12.5 9.5 18 20 6.5" />
    </Svg>
  );
}

export function IconoCruz(p: Props) {
  return (
    <Svg {...p}>
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </Svg>
  );
}

export function IconoWhatsapp(p: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`${base} ${p.className ?? "h-5 w-5"}`}
    >
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.5 3.68 1.4 5.22L2 22l5.06-1.55a9.85 9.85 0 0 0 4.98 1.33h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm0 18.02a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.95.98-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.36c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.4a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.05-8.29 8.05Zm4.48-6.03c-.24-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.77.97-.14.16-.28.18-.52.06-.25-.12-1.04-.38-1.97-1.22-.73-.65-1.22-1.45-1.36-1.7-.15-.24-.02-.37.1-.5.11-.1.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.6.18 1.13.16 1.56.1.48-.07 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function IconoInstagram(p: Props) {
  // El único radio de la casa: el logotipo de Instagram es un cuadrado
  // redondeado y sin ese radio deja de reconocerse. El resto —trazo de 1.5,
  // punto macizo, nada de degradado— sigue la gramática de la lámina.
  return (
    <Svg className={p.className}>
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}
