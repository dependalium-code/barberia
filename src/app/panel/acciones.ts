"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { crearCita, anularCita } from "@/lib/reservas";
import { avisarCitaAnulada } from "@/lib/correo";
import { EstadoCita, OrigenCita } from "@/generated/prisma/enums";
import { desdeLocal, horaAMinutos } from "@/lib/tiempo";

export type Respuesta = { ok: boolean; mensaje?: string };

function texto(datos: FormData, campo: string): string {
  const v = datos.get(campo);
  return typeof v === "string" ? v.trim() : "";
}

/* ─────────────────────────────────────────────────────────── Citas */

export async function marcarEstadoCita(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  const estado = texto(datos, "estado") as EstadoCita;
  if (!id || !Object.values(EstadoCita).includes(estado)) return;

  await prisma.cita.update({
    where: { id },
    data: {
      estado,
      ...(estado === EstadoCita.CANCELADA
        ? { canceladaEn: new Date(), motivoCancel: "Anulada desde el panel" }
        : { canceladaEn: null, motivoCancel: null }),
    },
  });
  revalidatePath("/panel/agenda");
  revalidatePath("/panel/citas");
}

export async function anularDesdePanel(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  if (!id) return;

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: { barbero: { select: { nombre: true } } },
  });
  if (!cita) return;

  const r = await anularCita({ citaId: id, motivo: texto(datos, "motivo") || "Anulada desde el panel" });
  if (r.ok && cita.estado !== EstadoCita.CANCELADA && cita.clienteEmail) {
    const aviso = await avisarCitaAnulada({ ...cita, barberoNombre: cita.barbero.nombre }, false);
    if (!aviso.ok) console.error(`[CITA ${cita.codigo}] no se avisó de la anulación:`, aviso.motivo);
  }
  revalidatePath("/panel/agenda");
  revalidatePath("/panel/citas");
}

export async function crearCitaDesdePanel(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const servicioId = texto(datos, "servicioId");
  const barberoId = texto(datos, "barberoId");
  const fecha = texto(datos, "fecha");
  const hora = texto(datos, "hora");

  if (!servicioId || !barberoId || !fecha || !hora) {
    return { ok: false, mensaje: "Faltan servicio, barbero, día u hora." };
  }

  const r = await crearCita({
    servicioId,
    barberoId,
    fechaISO: fecha,
    hora,
    clienteNombre: texto(datos, "nombre"),
    clienteTelefono: texto(datos, "telefono"),
    clienteEmail: texto(datos, "email") || null,
    notas: texto(datos, "notas") || null,
    origen: OrigenCita.PANEL,
  });

  if (!r.ok) return { ok: false, mensaje: r.motivo };

  revalidatePath("/panel/agenda");
  revalidatePath("/panel/citas");
  return { ok: true, mensaje: `Cita ${r.cita.codigo} apuntada.` };
}

/**
 * Mueve una cita a otra hora, otro día u otro barbero, comprobando el solape
 * igual que una reserva nueva pero sin la antelación mínima: en el mostrador
 * se apuntan citas para dentro de diez minutos.
 */
export async function moverCita(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const id = texto(datos, "id");
  const fecha = texto(datos, "fecha");
  const hora = texto(datos, "hora");
  const barberoId = texto(datos, "barberoId");
  if (!id || !fecha || !hora || !barberoId) {
    return { ok: false, mensaje: "Faltan datos para mover la cita." };
  }

  const cita = await prisma.cita.findUnique({ where: { id } });
  if (!cita) return { ok: false, mensaje: "Esa cita ya no existe." };

  const minutos = horaAMinutos(hora);
  if (minutos === null) return { ok: false, mensaje: "La hora no es válida." };

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const inicio = desdeLocal(anio, mes, dia, Math.floor(minutos / 60), minutos % 60);
  const fin = new Date(inicio.getTime() + cita.duracionMin * 60_000);

  const choque = await prisma.cita.findFirst({
    where: {
      id: { not: id },
      barberoId,
      estado: { notIn: [EstadoCita.CANCELADA] },
      inicio: { lt: fin },
      fin: { gt: inicio },
    },
    select: { codigo: true },
  });
  if (choque) {
    return { ok: false, mensaje: `Ahí ya está la cita ${choque.codigo}.` };
  }

  await prisma.cita.update({ where: { id }, data: { barberoId, inicio, fin } });
  revalidatePath("/panel/agenda");
  revalidatePath("/panel/citas");
  return { ok: true, mensaje: "Cita movida." };
}
