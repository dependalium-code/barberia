import nodemailer from "nodemailer";
import { NEGOCIO, SITE_URL, direccionCompleta, precio } from "@/datos/negocio";
import { fechaLarga, horaLocal, aFechaISO } from "@/lib/tiempo";

export type ResultadoAviso = { ok: boolean; motivo?: string };

function transporte() {
  const host = process.env.SMTP_HOST;
  const usuario = process.env.SMTP_USUARIO;
  const clave = process.env.SMTP_CLAVE;
  if (!host || !usuario || !clave) return null;
  const puerto = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host,
    port: puerto,
    secure: puerto === 465,
    auth: { user: usuario, pass: clave },
  });
}

function remitente() {
  return process.env.SMTP_REMITENTE || `${NEGOCIO.nombreLargo} <${process.env.SMTP_USUARIO}>`;
}

/**
 * Nunca lanza. Devuelve el motivo del fallo para poder guardarlo junto a la
 * cita: así un correo que no sale queda VISIBLE en el panel en vez de
 * desaparecer en silencio.
 */
async function enviar(opciones: {
  para: string;
  asunto: string;
  html: string;
  texto: string;
  responderA?: string;
}): Promise<ResultadoAviso> {
  const t = transporte();
  if (!t) return { ok: false, motivo: "faltan SMTP_HOST, SMTP_USUARIO o SMTP_CLAVE" };
  try {
    await t.sendMail({
      from: remitente(),
      to: opciones.para,
      subject: opciones.asunto,
      html: opciones.html,
      text: opciones.texto,
      replyTo: opciones.responderA,
    });
    return { ok: true };
  } catch (e) {
    const motivo = e instanceof Error ? e.message : String(e);
    console.error("[CORREO] no se pudo enviar:", motivo);
    return { ok: false, motivo: motivo.slice(0, 300) };
  }
}

const ORO = "#c8a45c";

function plantilla(titulo: string, cuerpo: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#0e0e10;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#17171a;border:1px solid #26262b;border-radius:14px;overflow:hidden">
      <tr><td style="padding:26px 28px 18px;border-bottom:1px solid #26262b">
        <div style="color:${ORO};font-size:12px;letter-spacing:.18em;text-transform:uppercase">${NEGOCIO.nombreLargo}</div>
        <h1 style="margin:8px 0 0;color:#f5f3ef;font-size:21px;font-weight:600">${titulo}</h1>
      </td></tr>
      <tr><td style="padding:24px 28px;color:#cfcbc4;font-size:15px;line-height:1.65">${cuerpo}</td></tr>
      <tr><td style="padding:18px 28px 24px;border-top:1px solid #26262b;color:#8d8880;font-size:12.5px;line-height:1.6">
        ${direccionCompleta()}<br>
        <a href="tel:${NEGOCIO.telefonoE164}" style="color:${ORO};text-decoration:none">${NEGOCIO.telefono}</a>
        &nbsp;·&nbsp;<a href="${SITE_URL}" style="color:${ORO};text-decoration:none">${SITE_URL.replace(/^https?:\/\//, "")}</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function fila(clave: string, valor: string) {
  return `<tr><td style="padding:5px 14px 5px 0;color:#8d8880;white-space:nowrap">${clave}</td><td style="padding:5px 0;color:#f5f3ef;font-weight:600">${valor}</td></tr>`;
}

export type CitaParaCorreo = {
  codigo: string;
  tokenGestion: string;
  inicio: Date;
  servicioNombre: string;
  duracionMin: number;
  precioCent: number;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  notas: string | null;
  barberoNombre: string;
};

export async function avisarClienteCitaConfirmada(cita: CitaParaCorreo): Promise<ResultadoAviso> {
  if (!cita.clienteEmail) return { ok: false, motivo: "el cliente no dejó email" };
  const fecha = fechaLarga(aFechaISO(cita.inicio));
  const hora = horaLocal(cita.inicio);
  const enlace = `${SITE_URL}/cita/${cita.tokenGestion}`;

  const cuerpo = `
    <p style="margin:0 0 16px">Hola ${escapar(cita.clienteNombre)}, tu cita está confirmada.</p>
    <table role="presentation" style="font-size:15px;margin:0 0 20px">
      ${fila("Fecha", fecha)}
      ${fila("Hora", hora)}
      ${fila("Servicio", escapar(cita.servicioNombre))}
      ${fila("Barbero", escapar(cita.barberoNombre))}
      ${fila("Precio", precio(cita.precioCent))}
      ${fila("Referencia", cita.codigo)}
    </table>
    <p style="margin:0 0 20px">Si no puedes venir, anúlala desde aquí y el hueco queda libre para otra persona:</p>
    <p style="margin:0 0 22px"><a href="${enlace}" style="display:inline-block;background:${ORO};color:#141416;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:9px">Ver o anular mi cita</a></p>
    <p style="margin:0;color:#8d8880;font-size:13px">Te esperamos en ${direccionCompleta()}.</p>`;

  return enviar({
    para: cita.clienteEmail,
    asunto: `Cita confirmada · ${fecha} a las ${hora} · ${NEGOCIO.nombreLargo}`,
    html: plantilla("Cita confirmada", cuerpo),
    texto: `Cita confirmada en ${NEGOCIO.nombreLargo}
${fecha} a las ${hora}
Servicio: ${cita.servicioNombre} (${cita.duracionMin} min)
Barbero: ${cita.barberoNombre}
Referencia: ${cita.codigo}
Ver o anular: ${enlace}`,
  });
}

export async function avisarNegocioCitaNueva(cita: CitaParaCorreo): Promise<ResultadoAviso> {
  const para = process.env.AVISOS_EMAIL || process.env.SMTP_USUARIO;
  if (!para) return { ok: false, motivo: "falta AVISOS_EMAIL" };
  const fecha = fechaLarga(aFechaISO(cita.inicio));
  const hora = horaLocal(cita.inicio);

  const cuerpo = `
    <table role="presentation" style="font-size:15px;margin:0 0 18px">
      ${fila("Cuándo", `${fecha} · ${hora}`)}
      ${fila("Servicio", escapar(cita.servicioNombre))}
      ${fila("Barbero", escapar(cita.barberoNombre))}
      ${fila("Cliente", escapar(cita.clienteNombre))}
      ${fila("Teléfono", escapar(cita.clienteTelefono))}
      ${fila("Email", escapar(cita.clienteEmail ?? "—"))}
      ${fila("Referencia", cita.codigo)}
    </table>
    ${cita.notas ? `<p style="margin:0 0 18px;color:#cfcbc4"><strong style="color:#8d8880">Nota:</strong> ${escapar(cita.notas)}</p>` : ""}
    <p style="margin:0"><a href="${SITE_URL}/panel/agenda" style="color:${ORO}">Abrir la agenda</a></p>`;

  return enviar({
    para,
    asunto: `Nueva cita · ${fecha} ${hora} · ${cita.clienteNombre}`,
    html: plantilla("Nueva cita reservada", cuerpo),
    texto: `Nueva cita\n${fecha} ${hora}\n${cita.servicioNombre} con ${cita.barberoNombre}\n${cita.clienteNombre} · ${cita.clienteTelefono}\nRef ${cita.codigo}`,
    responderA: cita.clienteEmail ?? undefined,
  });
}

export async function avisarCitaAnulada(cita: CitaParaCorreo, porElCliente: boolean): Promise<ResultadoAviso> {
  const para = process.env.AVISOS_EMAIL || process.env.SMTP_USUARIO;
  if (!para) return { ok: false, motivo: "falta AVISOS_EMAIL" };
  const fecha = fechaLarga(aFechaISO(cita.inicio));
  const hora = horaLocal(cita.inicio);
  return enviar({
    para,
    asunto: `Cita anulada · ${fecha} ${hora} · ${cita.clienteNombre}`,
    html: plantilla(
      "Cita anulada",
      `<p style="margin:0 0 14px">${porElCliente ? "El cliente ha anulado su cita desde la web." : "Se ha anulado la cita desde el panel."}</p>
       <table role="presentation" style="font-size:15px">
         ${fila("Cuándo", `${fecha} · ${hora}`)}
         ${fila("Servicio", escapar(cita.servicioNombre))}
         ${fila("Cliente", escapar(cita.clienteNombre))}
         ${fila("Teléfono", escapar(cita.clienteTelefono))}
         ${fila("Referencia", cita.codigo)}
       </table>`,
    ),
    texto: `Cita anulada: ${fecha} ${hora} — ${cita.clienteNombre} (${cita.codigo})`,
  });
}

export async function avisarMensajeContacto(m: {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  texto: string;
}): Promise<ResultadoAviso> {
  const para = process.env.AVISOS_EMAIL || process.env.SMTP_USUARIO;
  if (!para) return { ok: false, motivo: "falta AVISOS_EMAIL" };
  return enviar({
    para,
    asunto: `Mensaje web · ${m.nombre}`,
    html: plantilla(
      "Mensaje desde la web",
      `<table role="presentation" style="font-size:15px;margin:0 0 16px">
         ${fila("Nombre", escapar(m.nombre))}
         ${fila("Email", escapar(m.email))}
         ${fila("Teléfono", escapar(m.telefono ?? "—"))}
       </table>
       <p style="margin:0;white-space:pre-wrap">${escapar(m.texto)}</p>`,
    ),
    texto: `${m.nombre} <${m.email}> ${m.telefono ?? ""}\n\n${m.texto}`,
    responderA: m.email,
  });
}

export async function avisarLeadBarberia(m: {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  negocio: string;
  poblacion: string;
  texto: string;
}): Promise<ResultadoAviso> {
  const para = process.env.AVISOS_EMAIL || process.env.SMTP_USUARIO;
  if (!para) return { ok: false, motivo: "falta AVISOS_EMAIL" };

  return enviar({
    para,
    asunto: `Barbería interesada · ${m.negocio || m.nombre}${m.poblacion ? ` · ${m.poblacion}` : ""}`,
    html: plantilla(
      "Una barbería quiere la web",
      `<table role="presentation" style="font-size:15px;margin:0 0 16px">
         ${fila("Negocio", escapar(m.negocio || "—"))}
         ${fila("Población", escapar(m.poblacion || "—"))}
         ${fila("Contacto", escapar(m.nombre))}
         ${fila("Teléfono", escapar(m.telefono))}
         ${fila("Email", escapar(m.email))}
       </table>
       <p style="margin:0;white-space:pre-wrap">${escapar(m.texto)}</p>`,
    ),
    texto: `Barbería interesada\n${m.negocio} · ${m.poblacion}\n${m.nombre} · ${m.telefono} · ${m.email}\n\n${m.texto}`,
    responderA: m.email.includes("@no-facilitado") ? undefined : m.email,
  });
}

function escapar(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
