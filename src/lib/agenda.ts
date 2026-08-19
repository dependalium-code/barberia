import { prisma } from "@/lib/prisma";
import {
  desdeLocal,
  diaSemanaISO,
  hoyISO,
  inicioDelDia,
  minutosAHora,
  sumarDias,
} from "@/lib/tiempo";
import { EstadoCita } from "@/generated/prisma/enums";

export type Hueco = {
  hora: string; // "10:30" en hora local del negocio
  minutos: number; // minutos desde medianoche local
  barberoIds: string[]; // quién puede atenderlo a esa hora
};

export type AjustesAgenda = {
  intervaloSlotMin: number;
  antelacionMinHoras: number;
  ventanaDiasMax: number;
  maxCitasPorEmail: number;
  avisoReservas: string;
};

const AJUSTES_POR_DEFECTO: AjustesAgenda = {
  intervaloSlotMin: 15,
  antelacionMinHoras: 2,
  ventanaDiasMax: 60,
  maxCitasPorEmail: 3,
  avisoReservas: "",
};

export async function leerAjustes(): Promise<AjustesAgenda> {
  const fila = await prisma.ajustes.findUnique({ where: { id: "ajustes" } });
  if (!fila) return AJUSTES_POR_DEFECTO;
  return {
    intervaloSlotMin: fila.intervaloSlotMin,
    antelacionMinHoras: fila.antelacionMinHoras,
    ventanaDiasMax: fila.ventanaDiasMax,
    maxCitasPorEmail: fila.maxCitasPorEmail,
    avisoReservas: fila.avisoReservas,
  };
}

type Tramo = { inicio: number; fin: number }; // ms epoch

/** Tocarse no es solaparse: una cita que acaba a las 10:00 deja libre las 10:00. */
function solapa(aIni: number, aFin: number, b: Tramo) {
  return aIni < b.fin && b.inicio < aFin;
}

type Opciones = {
  servicioId: string;
  barberoId?: string | null;
  ignorarCitaId?: string | null;
  saltarAntelacion?: boolean;
};

/**
 * Calcula los huecos de VARIOS días con una sola tanda de consultas.
 *
 * Se hace así y no día a día porque el calendario del formulario necesita
 * saber qué días tienen sitio: día a día eran tres consultas por cada uno.
 */
export async function huecosDelRango(
  opciones: Opciones & { desdeISO: string; dias: number },
): Promise<Map<string, Hueco[]>> {
  const { servicioId, barberoId, ignorarCitaId, saltarAntelacion } = opciones;
  const resultado = new Map<string, Hueco[]>();

  const fechas = Array.from({ length: Math.max(opciones.dias, 1) }, (_, i) =>
    sumarDias(opciones.desdeISO, i),
  );
  for (const f of fechas) resultado.set(f, []);

  const [ajustes, servicio] = await Promise.all([
    leerAjustes(),
    prisma.servicio.findUnique({ where: { id: servicioId } }),
  ]);
  if (!servicio || !servicio.activo) return resultado;

  const barberos = await prisma.barbero.findMany({
    where: {
      activo: true,
      ...(barberoId ? { id: barberoId } : {}),
      servicios: { some: { servicioId } },
    },
    select: { id: true, horarios: true },
    orderBy: { orden: "asc" },
  });
  if (barberos.length === 0) return resultado;

  const ids = barberos.map((b) => b.id);
  const desde = inicioDelDia(fechas[0]);
  const hasta = inicioDelDia(sumarDias(fechas[fechas.length - 1], 1));

  const [citas, bloqueos] = await Promise.all([
    prisma.cita.findMany({
      where: {
        barberoId: { in: ids },
        estado: { notIn: [EstadoCita.CANCELADA] },
        inicio: { lt: hasta },
        fin: { gt: desde },
        ...(ignorarCitaId ? { NOT: { id: ignorarCitaId } } : {}),
      },
      select: { barberoId: true, inicio: true, fin: true },
    }),
    prisma.bloqueo.findMany({
      where: {
        OR: [{ barberoId: null }, { barberoId: { in: ids } }],
        inicio: { lt: hasta },
        fin: { gt: desde },
      },
      select: { barberoId: true, inicio: true, fin: true },
    }),
  ]);

  const ocupado = new Map<string, Tramo[]>(ids.map((id) => [id, []]));
  for (const c of citas) {
    ocupado.get(c.barberoId)?.push({ inicio: c.inicio.getTime(), fin: c.fin.getTime() });
  }
  for (const b of bloqueos) {
    const t = { inicio: b.inicio.getTime(), fin: b.fin.getTime() };
    if (b.barberoId === null) for (const id of ids) ocupado.get(id)?.push(t);
    else ocupado.get(b.barberoId)?.push(t);
  }

  const minimo = saltarAntelacion
    ? 0
    : Date.now() + ajustes.antelacionMinHoras * 3600_000;

  for (const fechaISO of fechas) {
    const dia = diaSemanaISO(fechaISO);
    const [anio, mes, diaMes] = fechaISO.split("-").map(Number);
    const porMinuto = new Map<number, string[]>();

    for (const barbero of barberos) {
      const suyo = ocupado.get(barbero.id) ?? [];
      for (const tramo of barbero.horarios) {
        if (tramo.diaSemana !== dia) continue;
        for (
          let m = tramo.inicioMin;
          m + servicio.duracionMin <= tramo.finMin;
          m += ajustes.intervaloSlotMin
        ) {
          const ini = desdeLocal(anio, mes, diaMes, Math.floor(m / 60), m % 60).getTime();
          const fin = ini + servicio.duracionMin * 60_000;
          if (ini < minimo) continue;
          if (suyo.some((o) => solapa(ini, fin, o))) continue;
          const lista = porMinuto.get(m);
          if (lista) {
            if (!lista.includes(barbero.id)) lista.push(barbero.id);
          } else porMinuto.set(m, [barbero.id]);
        }
      }
    }

    resultado.set(
      fechaISO,
      [...porMinuto.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([minutos, barberoIds]) => ({
          minutos,
          hora: minutosAHora(minutos),
          barberoIds,
        })),
    );
  }

  return resultado;
}

export async function huecosDelDia(
  opciones: Opciones & { fechaISO: string },
): Promise<Hueco[]> {
  const mapa = await huecosDelRango({ ...opciones, desdeISO: opciones.fechaISO, dias: 1 });
  return mapa.get(opciones.fechaISO) ?? [];
}

/** Franja que cubre el local ese día: de la primera apertura al último cierre. */
export async function ventanaDelDia(
  fechaISO: string,
): Promise<{ desdeMin: number; hastaMin: number } | null> {
  const tramos = await prisma.horario.findMany({
    where: { diaSemana: diaSemanaISO(fechaISO), barbero: { activo: true } },
    select: { inicioMin: true, finMin: true },
  });
  if (tramos.length === 0) return null;
  return {
    desdeMin: Math.min(...tramos.map((t) => t.inicioMin)),
    hastaMin: Math.max(...tramos.map((t) => t.finMin)),
  };
}

/** El primer día, a partir de hoy, con algún hueco para ese servicio. */
export async function primerDiaConHueco(
  servicioId: string,
  limiteDias = 14,
): Promise<{ fechaISO: string; huecos: Hueco[] } | null> {
  const mapa = await huecosDelRango({
    servicioId,
    desdeISO: hoyISO(),
    dias: limiteDias,
  });
  for (const [fechaISO, huecos] of mapa) {
    if (huecos.length > 0) return { fechaISO, huecos };
  }
  return null;
}
