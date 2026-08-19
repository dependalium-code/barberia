"use server";

import { prisma } from "@/lib/prisma";
import { avisarLeadBarberia } from "@/lib/correo";

export type EstadoLead = {
  ok: boolean;
  mensaje?: string;
  /** Lo enviado, para repintarlo: React 19 vacía el formulario al terminar. */
  valores?: Record<string, string>;
};

export async function pedirInformacion(
  _previo: EstadoLead | null,
  datos: FormData,
): Promise<EstadoLead> {
  const leer = (c: string) => {
    const v = datos.get(c);
    return typeof v === "string" ? v.trim() : "";
  };

  const valores = {
    negocio: leer("negocio"),
    poblacion: leer("poblacion"),
    nombre: leer("nombre"),
    telefono: leer("telefono"),
    email: leer("email"),
    texto: leer("texto"),
  };

  // Cebo para robots.
  if (leer("apellido2")) return { ok: true, mensaje: "Gracias, te escribimos enseguida." };

  if (valores.nombre.length < 2) {
    return { ok: false, mensaje: "Dinos tu nombre para saber por quién preguntar.", valores };
  }
  if (valores.telefono.replace(/\D/g, "").length < 9) {
    return { ok: false, mensaje: "Ese teléfono no parece válido; revísalo.", valores };
  }
  if (valores.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valores.email)) {
    return { ok: false, mensaje: "Ese correo no parece válido.", valores };
  }

  // Primero se guarda. Un lead que solo existe como correo se pierde entero si
  // el aviso cae en spam, y este es el lead que paga las facturas.
  let guardado;
  try {
    guardado = await prisma.mensaje.create({
      data: {
        tipo: "BARBERIA",
        nombre: valores.nombre.slice(0, 120),
        email: valores.email.slice(0, 160) || "sin-correo@no-facilitado",
        telefono: valores.telefono.slice(0, 30),
        negocio: valores.negocio.slice(0, 120) || null,
        poblacion: valores.poblacion.slice(0, 120) || null,
        texto: valores.texto.slice(0, 2000) || "(sin mensaje)",
      },
    });
  } catch (e) {
    console.error("[LEAD BARBERIA] no se pudo guardar:", e);
    return {
      ok: false,
      mensaje:
        "No hemos podido registrar tu petición. Llámanos o escríbenos por WhatsApp y lo vemos al momento.",
      valores,
    };
  }

  const aviso = await avisarLeadBarberia({ id: guardado.id, ...valores });
  if (!aviso.ok) console.error(`[LEAD ${guardado.id}] el aviso no salió:`, aviso.motivo);
  await prisma.mensaje.update({
    where: { id: guardado.id },
    data: { avisoOk: aviso.ok, avisoError: aviso.ok ? null : (aviso.motivo ?? "").slice(0, 300) },
  });

  return {
    ok: true,
    mensaje: `Recibido, ${valores.nombre.split(" ")[0]}. Te llamamos o te escribimos para enseñártela con calma.`,
  };
}
