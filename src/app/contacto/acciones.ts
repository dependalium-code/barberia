"use server";

import { prisma } from "@/lib/prisma";
import { avisarMensajeContacto } from "@/lib/correo";
import { verificarRecaptcha } from "@/lib/recaptcha";

export type EstadoContacto = {
  ok: boolean;
  mensaje?: string;
  /** Lo enviado, para repintarlo: React 19 vacía el formulario al terminar. */
  valores?: Record<string, string>;
};

export async function enviarMensaje(
  _previo: EstadoContacto | null,
  datos: FormData,
): Promise<EstadoContacto> {
  const leer = (c: string) => {
    const v = datos.get(c);
    return typeof v === "string" ? v.trim() : "";
  };

  const valores = {
    nombre: leer("nombre"),
    email: leer("email"),
    telefono: leer("telefono"),
    texto: leer("texto"),
  };

  // Trampa para robots: un campo que un humano nunca ve ni rellena.
  if (leer("apellido2")) return { ok: true, mensaje: "Gracias, lo hemos recibido." };

  if (valores.nombre.length < 2) {
    return { ok: false, mensaje: "Pon tu nombre, aunque sea el de pila.", valores };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valores.email)) {
    return { ok: false, mensaje: "Ese correo no parece válido; revísalo.", valores };
  }
  if (valores.texto.length < 5) {
    return { ok: false, mensaje: "Escribe un poco más para que sepamos qué necesitas.", valores };
  }

  // reCAPTCHA se consulta pero no decide: solo marca. Un mensaje descartado por
  // una puntuación es un cliente que se queda sin respuesta y no aparece en
  // ningún panel.
  const verificacion = await verificarRecaptcha(leer("recaptcha") || null);

  // Primero se guarda. Si esto falla, sí hay que decírselo al usuario y
  // mandarlo al teléfono: su mensaje no ha llegado a ninguna parte.
  let guardado;
  try {
    guardado = await prisma.mensaje.create({
      data: {
        nombre: valores.nombre.slice(0, 120),
        email: valores.email.slice(0, 160),
        telefono: valores.telefono.slice(0, 30) || null,
        texto: valores.texto.slice(0, 2000),
        revisar: verificacion.revisar,
        verifScore: verificacion.score,
        verifNota: verificacion.nota,
      },
    });
  } catch (e) {
    console.error("[CONTACTO] no se pudo guardar el mensaje:", e);
    return {
      ok: false,
      mensaje:
        "No hemos podido registrar tu mensaje. Llámanos o escríbenos por WhatsApp y lo vemos al momento.",
      valores,
    };
  }

  // El aviso puede fallar sin que el usuario se entere: su mensaje YA está
  // guardado y sale en el panel marcado como «sin avisar».
  const aviso = await avisarMensajeContacto({
    id: guardado.id,
    ...valores,
    telefono: valores.telefono || null,
    verificacion,
  });
  if (!aviso.ok) {
    console.error(`[MENSAJE ${guardado.id}] el aviso no salió:`, aviso.motivo);
  }
  await prisma.mensaje.update({
    where: { id: guardado.id },
    data: { avisoOk: aviso.ok, avisoError: aviso.ok ? null : (aviso.motivo ?? "").slice(0, 300) },
  });

  return {
    ok: true,
    mensaje: `Gracias, ${valores.nombre.split(" ")[0]}. Lo hemos recibido y te contestamos en cuanto podamos.`,
  };
}
