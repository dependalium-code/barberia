import { randomBytes, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { huecosDelDia, leerAjustes } from "@/lib/agenda";
import { desdeLocal, horaAMinutos, hoyISO, sumarDias } from "@/lib/tiempo";
import { EstadoCita, OrigenCita } from "@/generated/prisma/enums";
import { NEGOCIO } from "@/datos/negocio";

/** Sin vocales ni caracteres que se confundan al dictarlo por teléfono. */
const ALFABETO = "ACDEFGHJKLMNPQRTUVWXY3479";

function codigoCita(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `LB-${s}`;
}

export type DatosReserva = {
  servicioId: string;
  barberoId?: string | null; // null / vacío = "el primero que esté libre"
  fechaISO: string;
  hora: string; // "10:30"
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  notas?: string | null;
  origen?: OrigenCita;
  /**
   * Resultado de reCAPTCHA, si la cita viene de la web. NUNCA impide crearla:
   * solo marca la que hay que mirar a ojo. Desde el panel no se pasa.
   */
  verificacion?: { revisar: boolean; score: number | null; nota: string | null };
};

export type ResultadoReserva =
  | { ok: true; cita: { id: string; codigo: string; tokenGestion: string } }
  | { ok: false; motivo: string; codigo: "OCUPADO" | "DATOS" | "LIMITE" | "ERROR" };

/**
 * Crea una cita comprobándolo TODO en el servidor.
 *
 * El navegador manda servicio, barbero, día y hora, pero nada de eso se cree:
 * se recalculan los huecos reales y se vuelve a mirar el solape dentro de una
 * transacción serializable. Si dos personas pinchan el mismo hueco a la vez,
 * una de las dos se lleva el "ya no está libre" en vez de duplicarse la cita.
 */
export async function crearCita(datos: DatosReserva): Promise<ResultadoReserva> {
  const nombre = datos.clienteNombre.trim();
  const telefono = datos.clienteTelefono.replace(/\s+/g, " ").trim();
  const email = datos.clienteEmail?.trim() || null;

  if (nombre.length < 2) return { ok: false, codigo: "DATOS", motivo: "Falta el nombre." };
  if (telefono.replace(/\D/g, "").length < 9)
    return { ok: false, codigo: "DATOS", motivo: "El teléfono no parece válido." };

  const minutos = horaAMinutos(datos.hora);
  if (minutos === null)
    return { ok: false, codigo: "DATOS", motivo: "La hora elegida no es válida." };

  const ajustes = await leerAjustes();
  const hoy = hoyISO();
  if (datos.fechaISO < hoy)
    return { ok: false, codigo: "DATOS", motivo: "Esa fecha ya ha pasado." };
  if (datos.fechaISO > sumarDias(hoy, ajustes.ventanaDiasMax))
    return {
      ok: false,
      codigo: "DATOS",
      motivo: `De momento solo se puede reservar con ${ajustes.ventanaDiasMax} días de antelación.`,
    };

  const desdePanel = datos.origen === OrigenCita.PANEL || datos.origen === OrigenCita.TELEFONO;

  const servicio = await prisma.servicio.findUnique({ where: { id: datos.servicioId } });
  if (!servicio || !servicio.activo)
    return { ok: false, codigo: "DATOS", motivo: "Ese servicio ya no está disponible." };

  // Tope de citas abiertas por cliente: evita que alguien bloquee la agenda
  // entera reservando diez huecos. El panel no tiene ese tope.
  if (!desdePanel && email) {
    const abiertas = await prisma.cita.count({
      where: {
        clienteEmail: email,
        estado: { in: [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA] },
        inicio: { gte: new Date() },
      },
    });
    if (abiertas >= ajustes.maxCitasPorEmail)
      return {
        ok: false,
        codigo: "LIMITE",
        motivo: `Ya tienes ${abiertas} citas pendientes. Anula alguna o llámanos al ${NEGOCIO.telefono}.`,
      };
  }

  const huecos = await huecosDelDia({
    fechaISO: datos.fechaISO,
    servicioId: datos.servicioId,
    barberoId: datos.barberoId || null,
    saltarAntelacion: desdePanel,
  });
  const hueco = huecos.find((h) => h.minutos === minutos);
  if (!hueco)
    return {
      ok: false,
      codigo: "OCUPADO",
      motivo: "Ese hueco acaba de ocuparse. Elige otra hora, por favor.",
    };

  const barberoElegido = datos.barberoId
    ? hueco.barberoIds.find((id) => id === datos.barberoId)
    : hueco.barberoIds[0];
  if (!barberoElegido)
    return { ok: false, codigo: "OCUPADO", motivo: "Ese barbero ya no tiene ese hueco libre." };

  const [anio, mes, dia] = datos.fechaISO.split("-").map(Number);
  const inicio = desdeLocal(anio, mes, dia, Math.floor(minutos / 60), minutos % 60);
  const fin = new Date(inicio.getTime() + servicio.duracionMin * 60_000);

  try {
    const cita = await prisma.$transaction(
      async (tx) => {
        const choque = await tx.cita.findFirst({
          where: {
            barberoId: barberoElegido,
            estado: { notIn: [EstadoCita.CANCELADA] },
            inicio: { lt: fin },
            fin: { gt: inicio },
          },
          select: { id: true },
        });
        if (choque) throw new ChoqueDeAgenda();

        return tx.cita.create({
          data: {
            codigo: codigoCita(),
            tokenGestion: randomBytes(24).toString("base64url"),
            estado: EstadoCita.CONFIRMADA,
            origen: datos.origen ?? OrigenCita.WEB,
            barberoId: barberoElegido,
            servicioId: servicio.id,
            inicio,
            fin,
            servicioNombre: servicio.nombre,
            duracionMin: servicio.duracionMin,
            precioCent: servicio.precioCent,
            clienteNombre: nombre,
            clienteTelefono: telefono,
            clienteEmail: email,
            notas: datos.notas?.trim() || null,
            revisar: datos.verificacion?.revisar ?? false,
            verifScore: datos.verificacion?.score ?? null,
            verifNota: datos.verificacion?.nota ?? null,
          },
          select: { id: true, codigo: true, tokenGestion: true },
        });
      },
      { isolationLevel: "Serializable" },
    );
    return { ok: true, cita };
  } catch (e) {
    if (e instanceof ChoqueDeAgenda)
      return {
        ok: false,
        codigo: "OCUPADO",
        motivo: "Ese hueco acaba de ocuparse. Elige otra hora, por favor.",
      };
    // 40001 / P2034 = dos transacciones serializables pisándose. Es exactamente
    // el caso de dos clientes pinchando el mismo hueco a la vez.
    const mensaje = e instanceof Error ? e.message : String(e);
    if (/40001|write conflict|could not serialize|P2034/i.test(mensaje))
      return {
        ok: false,
        codigo: "OCUPADO",
        motivo: "Ese hueco acaba de ocuparse. Elige otra hora, por favor.",
      };
    console.error("[RESERVA] fallo al crear la cita:", e);
    return {
      ok: false,
      codigo: "ERROR",
      motivo: "No hemos podido registrar la cita. Inténtalo de nuevo o llámanos.",
    };
  }
}

class ChoqueDeAgenda extends Error {
  constructor() {
    super("hueco ocupado");
    this.name = "ChoqueDeAgenda";
  }
}

export async function anularCita(opciones: {
  tokenGestion?: string;
  citaId?: string;
  motivo?: string;
}): Promise<{ ok: boolean; motivo?: string }> {
  const donde = opciones.tokenGestion
    ? { tokenGestion: opciones.tokenGestion }
    : opciones.citaId
      ? { id: opciones.citaId }
      : null;
  if (!donde) return { ok: false, motivo: "Falta la referencia de la cita." };

  const cita = await prisma.cita.findUnique({ where: donde });
  if (!cita) return { ok: false, motivo: "No encontramos esa cita." };
  if (cita.estado === EstadoCita.CANCELADA) return { ok: true };
  if (cita.inicio.getTime() < Date.now() && opciones.tokenGestion)
    return { ok: false, motivo: "Esa cita ya ha pasado; no se puede anular." };

  await prisma.cita.update({
    where: { id: cita.id },
    data: {
      estado: EstadoCita.CANCELADA,
      canceladaEn: new Date(),
      motivoCancel: opciones.motivo?.trim() || null,
    },
  });
  return { ok: true };
}
