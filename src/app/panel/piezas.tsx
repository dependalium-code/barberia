/** Piezas repetidas del panel. Modo trabajo: denso, tranquilo y sin adornos. */

export function TituloPanel({
  children,
  extra,
}: {
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-tinta pb-4">
      <h1 className="titular text-[clamp(1.7rem,4vw,2.4rem)]">{children}</h1>
      {extra}
    </div>
  );
}

export function Aviso({ estado }: { estado: { ok: boolean; mensaje?: string } | null }) {
  if (!estado?.mensaje) return null;
  return (
    <p
      role="status"
      className={`mt-4 px-4 py-3 text-[0.9rem] leading-relaxed ${
        estado.ok ? "bg-acero-10" : "border-t-2 border-bermellon bg-bermellon-humo"
      }`}
    >
      {estado.mensaje}
    </p>
  );
}

const CAMPO =
  "mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] text-tinta focus:border-tinta focus:outline-none";

export function Campo({
  etiqueta,
  ancho,
  children,
  ...resto
}: {
  etiqueta: string;
  ancho?: string;
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`cota block text-acero-50 ${ancho ?? ""}`}>
      {etiqueta}
      {children ?? <input className={CAMPO} {...resto} />}
    </label>
  );
}

export function Area({
  etiqueta,
  ...resto
}: { etiqueta: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="cota block text-acero-50">
      {etiqueta}
      <textarea className={`${CAMPO} leading-relaxed`} {...resto} />
    </label>
  );
}

export function Casilla({
  etiqueta,
  ...resto
}: { etiqueta: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cota flex items-center gap-2.5 text-acero-50">
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--color-bermellon)]"
        {...resto}
      />
      {etiqueta}
    </label>
  );
}

export function Boton({
  tono = "principal",
  className = "",
  ...resto
}: { tono?: "principal" | "borde" | "peligro" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tonos = {
    principal:
      "bg-tinta text-white hover:bg-bermellon disabled:bg-acero-20 disabled:text-acero-50",
    borde: "border border-tinta hover:bg-tinta hover:text-white",
    peligro: "border border-bermellon text-bermellon hover:bg-bermellon hover:text-white",
  };
  return (
    <button
      className={`cota px-4 py-2.5 transition-colors disabled:cursor-not-allowed ${tonos[tono]} ${className}`}
      {...resto}
    />
  );
}

export const CLASE_CAMPO = CAMPO;
