"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirUsuario } from "@/lib/auth";
import { desdeLocal, horaAMinutos } from "@/lib/tiempo";

export type Respuesta = { ok: boolean; mensaje?: string };

function texto(d: FormData, c: string) {
  const v = d.get(c);
  return typeof v === "string" ? v.trim() : "";
}
function numero(d: FormData, c: string, porDefecto = 0) {
  const n = Number(texto(d, c));
  return Number.isFinite(n) ? n : porDefecto;
}
function marcado(d: FormData, c: string) {
  return d.get(c) === "on" || d.get(c) === "true";
}

/** «Corte de Pelo» -> «corte-de-pelo». */
function aSlug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function slugLibre(base: string, tabla: "servicio" | "barbero", idPropio?: string) {
  let slug = base || "sin-nombre";
  for (let i = 2; i < 99; i++) {
    const existe =
      tabla === "servicio"
        ? await prisma.servicio.findUnique({ where: { slug }, select: { id: true } })
        : await prisma.barbero.findUnique({ where: { slug }, select: { id: true } });
    if (!existe || existe.id === idPropio) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/* ────────────────────────────────────────────────────── Servicios */

export async function guardarServicio(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const id = texto(datos, "id");
  const nombre = texto(datos, "nombre");
  if (nombre.length < 2) return { ok: false, mensaje: "El servicio necesita un nombre." };

  const duracionMin = numero(datos, "duracionMin", 30);
  if (duracionMin < 5 || duracionMin > 480) {
    return { ok: false, mensaje: "La duración tiene que estar entre 5 y 480 minutos." };
  }

  const euros = texto(datos, "precio").replace(",", ".");
  const precioCent = Math.round(Number(euros) * 100);
  if (!Number.isFinite(precioCent) || precioCent < 0) {
    return { ok: false, mensaje: "El precio no es válido." };
  }

  const comun = {
    nombre,
    descripcion: texto(datos, "descripcion") || null,
    categoria: texto(datos, "categoria") || "Barbería",
    duracionMin,
    precioCent,
    destacado: marcado(datos, "destacado"),
    activo: marcado(datos, "activo"),
    orden: numero(datos, "orden", 0),
  };

  if (id) {
    await prisma.servicio.update({
      where: { id },
      data: { ...comun, slug: await slugLibre(aSlug(nombre), "servicio", id) },
    });
  } else {
    const creado = await prisma.servicio.create({
      data: { ...comun, slug: await slugLibre(aSlug(nombre), "servicio") },
    });
    // Un servicio que no hace nadie no aparece nunca: se asigna a todo el
    // equipo y ya lo quitarán de quien no lo haga.
    const barberos = await prisma.barbero.findMany({ select: { id: true } });
    await prisma.barberoServicio.createMany({
      data: barberos.map((b) => ({ barberoId: b.id, servicioId: creado.id })),
    });
  }

  revalidatePath("/panel/servicios");
  revalidatePath("/");
  return { ok: true, mensaje: id ? "Servicio guardado." : "Servicio creado y asignado a todo el equipo." };
}

export async function borrarServicio(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  if (!id) return;

  const citas = await prisma.cita.count({ where: { servicioId: id } });
  if (citas > 0) {
    // Con citas colgando no se borra: se apaga, para no romper el histórico.
    await prisma.servicio.update({ where: { id }, data: { activo: false } });
  } else {
    await prisma.servicio.delete({ where: { id } });
  }
  revalidatePath("/panel/servicios");
  revalidatePath("/");
}

/* ──────────────────────────────────────────────────────── Equipo */

export async function guardarBarbero(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const id = texto(datos, "id");
  const nombre = texto(datos, "nombre");
  if (nombre.length < 2) return { ok: false, mensaje: "El barbero necesita un nombre." };

  const color = texto(datos, "color") || "#c22e10";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { ok: false, mensaje: "El color tiene que ser un hexadecimal tipo #c22e10." };
  }

  const comun = {
    nombre,
    puesto: texto(datos, "puesto") || null,
    bio: texto(datos, "bio") || null,
    color,
    activo: marcado(datos, "activo"),
    orden: numero(datos, "orden", 0),
  };

  const barbero = id
    ? await prisma.barbero.update({
        where: { id },
        data: { ...comun, slug: await slugLibre(aSlug(nombre), "barbero", id) },
      })
    : await prisma.barbero.create({
        data: { ...comun, slug: await slugLibre(aSlug(nombre), "barbero") },
      });

  const servicios = datos.getAll("servicios").filter((x): x is string => typeof x === "string");
  await prisma.barberoServicio.deleteMany({ where: { barberoId: barbero.id } });
  if (servicios.length > 0) {
    await prisma.barberoServicio.createMany({
      data: servicios.map((servicioId) => ({ barberoId: barbero.id, servicioId })),
    });
  }

  revalidatePath("/panel/equipo");
  revalidatePath("/");
  return { ok: true, mensaje: id ? "Barbero guardado." : "Barbero creado." };
}

export async function guardarHorario(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const barberoId = texto(datos, "barberoId");
  if (!barberoId) return { ok: false, mensaje: "Falta el barbero." };

  type Tramo = { diaSemana: number; inicioMin: number; finMin: number };
  const tramos: Tramo[] = [];

  for (let dia = 1; dia <= 7; dia++) {
    for (const turno of ["m", "t"]) {
      const de = texto(datos, `d${dia}${turno}de`);
      const a = texto(datos, `d${dia}${turno}a`);
      if (!de && !a) continue;
      const inicioMin = horaAMinutos(de);
      const finMin = horaAMinutos(a);
      if (inicioMin === null || finMin === null) {
        return { ok: false, mensaje: `Hay una hora mal escrita en el día ${dia}.` };
      }
      if (finMin <= inicioMin) {
        return { ok: false, mensaje: `En el día ${dia} el cierre no puede ir antes de la apertura.` };
      }
      tramos.push({ diaSemana: dia, inicioMin, finMin });
    }
  }

  // Dos turnos del mismo día no se pueden pisar: si no, el mismo hueco sale
  // dos veces y se puede reservar dos veces.
  for (let dia = 1; dia <= 7; dia++) {
    const delDia = tramos.filter((t) => t.diaSemana === dia).sort((a, b) => a.inicioMin - b.inicioMin);
    for (let i = 1; i < delDia.length; i++) {
      if (delDia[i].inicioMin < delDia[i - 1].finMin) {
        return { ok: false, mensaje: `Los dos turnos del día ${dia} se solapan.` };
      }
    }
  }

  await prisma.horario.deleteMany({ where: { barberoId } });
  if (tramos.length > 0) {
    await prisma.horario.createMany({ data: tramos.map((t) => ({ ...t, barberoId })) });
  }

  revalidatePath("/panel/equipo");
  revalidatePath("/panel/agenda");
  revalidatePath("/");
  return { ok: true, mensaje: "Horario guardado." };
}

/* ───────────────────────────────────────── Cierres y vacaciones */

export async function crearBloqueo(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const desdeF = texto(datos, "desdeFecha");
  const hastaF = texto(datos, "hastaFecha") || desdeF;
  const desdeH = texto(datos, "desdeHora") || "00:00";
  const hastaH = texto(datos, "hastaHora") || "23:59";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(desdeF) || !/^\d{4}-\d{2}-\d{2}$/.test(hastaF)) {
    return { ok: false, mensaje: "Pon la fecha de inicio y la de fin." };
  }
  const mi = horaAMinutos(desdeH);
  const mf = horaAMinutos(hastaH);
  if (mi === null || mf === null) return { ok: false, mensaje: "Las horas no son válidas." };

  const [a1, m1, d1] = desdeF.split("-").map(Number);
  const [a2, m2, d2] = hastaF.split("-").map(Number);
  const inicio = desdeLocal(a1, m1, d1, Math.floor(mi / 60), mi % 60);
  const fin = desdeLocal(a2, m2, d2, Math.floor(mf / 60), mf % 60);

  if (fin <= inicio) return { ok: false, mensaje: "El fin tiene que ir después del inicio." };

  const barberoId = texto(datos, "barberoId") || null;

  const afectadas = await prisma.cita.count({
    where: {
      estado: { notIn: ["CANCELADA"] },
      inicio: { lt: fin },
      fin: { gt: inicio },
      ...(barberoId ? { barberoId } : {}),
    },
  });

  await prisma.bloqueo.create({
    data: { barberoId, inicio, fin, motivo: texto(datos, "motivo") || null },
  });

  revalidatePath("/panel/cierres");
  revalidatePath("/panel/agenda");
  revalidatePath("/");

  return {
    ok: true,
    mensaje:
      afectadas > 0
        ? `Cierre guardado. Ojo: ya hay ${afectadas} ${afectadas === 1 ? "cita cogida" : "citas cogidas"} dentro de esas fechas; el cierre no las anula, hay que llamar.`
        : "Cierre guardado.",
  };
}

export async function borrarBloqueo(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  if (!id) return;
  await prisma.bloqueo.delete({ where: { id } });
  revalidatePath("/panel/cierres");
  revalidatePath("/panel/agenda");
}

/* ─────────────────────────────────────────────────────── Ajustes */

export async function guardarAjustes(
  _previo: Respuesta | null,
  datos: FormData,
): Promise<Respuesta> {
  await exigirUsuario();

  const intervaloSlotMin = numero(datos, "intervaloSlotMin", 15);
  if (![5, 10, 15, 20, 30, 60].includes(intervaloSlotMin)) {
    return { ok: false, mensaje: "El paso de la agenda tiene que ser 5, 10, 15, 20, 30 o 60 minutos." };
  }
  const antelacionMinHoras = numero(datos, "antelacionMinHoras", 2);
  if (antelacionMinHoras < 0 || antelacionMinHoras > 72) {
    return { ok: false, mensaje: "La antelación mínima va de 0 a 72 horas." };
  }
  const ventanaDiasMax = numero(datos, "ventanaDiasMax", 60);
  if (ventanaDiasMax < 1 || ventanaDiasMax > 365) {
    return { ok: false, mensaje: "La ventana de reserva va de 1 a 365 días." };
  }
  const maxCitasPorEmail = numero(datos, "maxCitasPorEmail", 3);
  if (maxCitasPorEmail < 1 || maxCitasPorEmail > 20) {
    return { ok: false, mensaje: "El tope de citas por cliente va de 1 a 20." };
  }

  await prisma.ajustes.upsert({
    where: { id: "ajustes" },
    update: {
      intervaloSlotMin,
      antelacionMinHoras,
      ventanaDiasMax,
      maxCitasPorEmail,
      avisoReservas: texto(datos, "avisoReservas").slice(0, 300),
    },
    create: {
      id: "ajustes",
      intervaloSlotMin,
      antelacionMinHoras,
      ventanaDiasMax,
      maxCitasPorEmail,
      avisoReservas: texto(datos, "avisoReservas").slice(0, 300),
    },
  });

  revalidatePath("/panel/ajustes");
  revalidatePath("/reservar");
  return { ok: true, mensaje: "Ajustes guardados." };
}

/* ─────────────────────────────────────────────────────── Mensajes */

export async function marcarMensajeLeido(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  if (!id) return;
  await prisma.mensaje.update({ where: { id }, data: { leido: true } });
  revalidatePath("/panel/mensajes");
}

export async function borrarMensaje(datos: FormData): Promise<void> {
  await exigirUsuario();
  const id = texto(datos, "id");
  if (!id) return;
  await prisma.mensaje.delete({ where: { id } });
  revalidatePath("/panel/mensajes");
}
