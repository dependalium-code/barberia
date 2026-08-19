"use server";

import { prisma } from "@/lib/prisma";
import { crearCita } from "@/lib/reservas";
import { avisarClienteCitaConfirmada, avisarNegocioCitaNueva } from "@/lib/correo";

export type EstadoReserva = {
  ok: boolean;
  motivo?: string;
  codigo?: "OCUPADO" | "DATOS" | "LIMITE" | "ERROR";
  /** Lo enviado, para repintar el formulario: React 19 lo vacía al terminar la acción. */
  valores?: Record<string, string>;
  cita?: { codigo: string; token: string };
};

function capturar(datos: FormData): Record<string, string> {
  const v: Record<string, string> = {};
  for (const campo of ["servicio", "barbero", "fecha", "hora", "nombre", "telefono", "email", "notas"]) {
    const valor = datos.get(campo);
    if (typeof valor === "string") v[campo] = valor;
  }
  return v;
}

export async function reservar(
  _anterior: EstadoReserva | null,
  datos: FormData,
): Promise<EstadoReserva> {
  const valores = capturar(datos);

  const servicio = await prisma.servicio.findUnique({
    where: { slug: valores.servicio ?? "" },
    select: { id: true },
  });
  if (!servicio) {
    return { ok: false, codigo: "DATOS", motivo: "Elige un servicio.", valores };
  }

  let barberoId: string | null = null;
  if (valores.barbero) {
    const b = await prisma.barbero.findUnique({
      where: { slug: valores.barbero },
      select: { id: true },
    });
    if (!b) {
      return { ok: false, codigo: "DATOS", motivo: "Ese barbero ya no está.", valores };
    }
    barberoId = b.id;
  }

  const resultado = await crearCita({
    servicioId: servicio.id,
    barberoId,
    fechaISO: valores.fecha ?? "",
    hora: valores.hora ?? "",
    clienteNombre: valores.nombre ?? "",
    clienteTelefono: valores.telefono ?? "",
    clienteEmail: valores.email || null,
    notas: valores.notas || null,
  });

  if (!resultado.ok) {
    return { ok: false, codigo: resultado.codigo, motivo: resultado.motivo, valores };
  }

  // La cita YA está guardada. A partir de aquí, un correo que falle se anota
  // en la ficha y se ve en el panel, pero no se le cuenta al cliente: su hora
  // está cogida.
  const completa = await prisma.cita.findUnique({
    where: { id: resultado.cita.id },
    include: { barbero: { select: { nombre: true } } },
  });

  if (completa) {
    const paraCorreo = { ...completa, barberoNombre: completa.barbero.nombre };
    const [alCliente, alNegocio] = await Promise.all([
      avisarClienteCitaConfirmada(paraCorreo),
      avisarNegocioCitaNueva(paraCorreo),
    ]);
    const fallos = [
      alCliente.ok ? null : `cliente: ${alCliente.motivo}`,
      alNegocio.ok ? null : `negocio: ${alNegocio.motivo}`,
    ].filter(Boolean);
    if (fallos.length > 0) {
      console.error(`[CITA ${completa.codigo}] aviso no enviado —`, fallos.join(" · "));
    }
    await prisma.cita.update({
      where: { id: completa.id },
      data: {
        avisoOk: alNegocio.ok,
        avisoError: fallos.length > 0 ? fallos.join(" · ").slice(0, 300) : null,
      },
    });
  }

  return {
    ok: true,
    cita: { codigo: resultado.cita.codigo, token: resultado.cita.tokenGestion },
  };
}
