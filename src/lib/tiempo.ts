/**
 * Todo el tiempo del proyecto en un solo sitio.
 *
 * Regla: la base de datos guarda instantes en UTC (`Date`), y los horarios
 * semanales se guardan como minutos desde medianoche EN HORA LOCAL del negocio.
 * España cambia de hora dos veces al año, así que "las 10:00 del 15 de marzo"
 * y "las 10:00 del 15 de julio" NO están al mismo número de horas de UTC.
 * Convertir con `new Date("...Z")` a mano se come esa diferencia y desplaza
 * toda la agenda una hora media parte del año.
 */

export const ZONA = "Europe/Madrid";

const FORMATO_PARTES = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export type ParteFecha = {
  anio: number;
  mes: number; // 1-12
  dia: number; // 1-31
  hora: number;
  minuto: number;
  segundo: number;
};

/** Descompone un instante en su hora de pared en Europe/Madrid. */
export function partesEnZona(instante: Date): ParteFecha {
  const p = Object.fromEntries(
    FORMATO_PARTES.formatToParts(instante)
      .filter((x) => x.type !== "literal")
      .map((x) => [x.type, x.value]),
  ) as Record<string, string>;
  return {
    anio: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    hora: Number(p.hour === "24" ? "0" : p.hour),
    minuto: Number(p.minute),
    segundo: Number(p.second),
  };
}

/** Desfase de la zona respecto a UTC, en minutos, para un instante dado. */
function desfaseMin(instante: Date): number {
  const p = partesEnZona(instante);
  const comoSiFueraUtc = Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return (comoSiFueraUtc - Math.floor(instante.getTime() / 1000) * 1000) / 60000;
}

/**
 * Hora de pared local -> instante UTC.
 * Itera dos veces porque el desfase depende del propio instante que buscamos.
 */
export function desdeLocal(
  anio: number,
  mes: number,
  dia: number,
  hora = 0,
  minuto = 0,
): Date {
  const supuesto = Date.UTC(anio, mes - 1, dia, hora, minuto, 0);
  let instante = new Date(supuesto - desfaseMin(new Date(supuesto)) * 60000);
  instante = new Date(supuesto - desfaseMin(instante) * 60000);
  return instante;
}

/** "2026-08-19" -> instante de las 00:00 locales de ese día. */
export function inicioDelDia(fechaISO: string): Date {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return desdeLocal(a, m, d, 0, 0);
}

/** Instante -> "2026-08-19" en hora local. */
export function aFechaISO(instante: Date): string {
  const p = partesEnZona(instante);
  return `${p.anio}-${String(p.mes).padStart(2, "0")}-${String(p.dia).padStart(2, "0")}`;
}

/** Día ISO de la semana en hora local: 1 lunes … 7 domingo. */
export function diaSemanaISO(fechaISO: string): number {
  const [a, m, d] = fechaISO.split("-").map(Number);
  const dow = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 domingo
  return dow === 0 ? 7 : dow;
}

/** Suma días a una fecha ISO sin tocar husos (aritmética de calendario). */
export function sumarDias(fechaISO: string, dias: number): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  const t = new Date(Date.UTC(a, m - 1, d));
  t.setUTCDate(t.getUTCDate() + dias);
  return t.toISOString().slice(0, 10);
}

/** Minutos desde medianoche -> "09:30". */
export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "09:30" -> 570. Devuelve null si no es una hora válida. */
export function horaAMinutos(hora: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Hora local de un instante, "09:30". */
export function horaLocal(instante: Date): string {
  const p = partesEnZona(instante);
  return `${String(p.hora).padStart(2, "0")}:${String(p.minuto).padStart(2, "0")}`;
}

const DIAS_LARGOS = [
  "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo",
];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function nombreDia(fechaISO: string): string {
  return DIAS_LARGOS[diaSemanaISO(fechaISO) - 1];
}

/** "miércoles, 19 de agosto de 2026" */
export function fechaLarga(fechaISO: string): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return `${nombreDia(fechaISO)}, ${d} de ${MESES[m - 1]} de ${a}`;
}

/** "19 ago" */
export function fechaCorta(fechaISO: string): string {
  const [, m, d] = fechaISO.split("-").map(Number);
  return `${d} ${MESES[m - 1].slice(0, 3)}`;
}

/** Hoy, en hora local del negocio. */
export function hoyISO(): string {
  return aFechaISO(new Date());
}
