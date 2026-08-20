import { headers } from "next/headers";

/**
 * reCAPTCHA v3, del lado del servidor.
 *
 * REGLA DE LA CASA: un envío NO se descarta nunca por reCAPTCHA. Se guarda
 * siempre y, si no se pudo comprobar o la puntuación es mala, se marca para
 * revisar y el aviso sale con «⚠ REVISAR» en el asunto.
 *
 * El token falta por muchas razones que no son un robot: un bloqueador de
 * anuncios, una extensión de privacidad, el script de Google que no carga,
 * navegar sin JavaScript, o —en esta web— haber dicho que no al permiso.
 * Bloquear esos envíos sería perder clientes reales en silencio, que no
 * aparecen en ningún panel porque nunca llegaron a existir.
 */

export type Verificacion = {
  /** Enciende el aviso «⚠ REVISAR». Nunca impide guardar. */
  revisar: boolean;
  /** 0.0 (robot) a 1.0 (persona). null si no hubo puntuación. */
  score: number | null;
  /** Por qué hay que revisarlo, en corto y en cristiano. null = nada que decir. */
  nota: string | null;
};

const LIMPIA: Verificacion = { revisar: false, score: null, nota: null };

/** Por debajo de esto se marca. Personas reales con VPN o navegador raro bajan de 0.5. */
function umbral(): number {
  const n = Number(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(n) && n > 0 && n < 1 ? n : 0.5;
}

/**
 * La IP ayuda a Google a puntuar, pero no es imprescindible. Si el proxy no la
 * manda, se verifica igual.
 */
async function ipDelCliente(): Promise<string | undefined> {
  try {
    const h = await headers();
    const cadena = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "";
    return cadena.split(",")[0].trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function verificarRecaptcha(token: string | null | undefined): Promise<Verificacion> {
  const secreto = process.env.RECAPTCHA_SECRET_KEY;

  // Sin clave secreta la protección no está puesta. No se marca nada: sería
  // teñir de sospechoso el 100% de los leads por una variable que falta.
  if (!secreto) return LIMPIA;

  if (!token) {
    return {
      revisar: true,
      score: null,
      nota: "sin token: no dio permiso, no tenía JavaScript o un bloqueador paró el script",
    };
  }

  const cuerpo = new URLSearchParams({ secret: secreto, response: token });
  const ip = await ipDelCliente();
  if (ip) cuerpo.set("remoteip", ip);

  let datos: {
    success?: boolean;
    score?: number;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
  };

  try {
    // Sin tope de espera, una API de Google lenta se lleva por delante la
    // función entera y con ella el lead.
    const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: cuerpo,
      signal: AbortSignal.timeout(6_000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    datos = await r.json();
  } catch (e) {
    // Google no contesta: se deja pasar y se marca. Lo contrario sería tirar
    // los leads de toda una tarde porque a Google le dio un aire.
    console.error("[RECAPTCHA] siteverify no respondió:", e);
    return { revisar: true, score: null, nota: "Google no respondió a la comprobación" };
  }

  if (!datos.success) {
    const errores = (datos["error-codes"] ?? []).join(", ") || "sin detalle";
    // Estos dos son fallo MÍO, no del visitante: conviene que salten a la vista
    // en los registros en vez de confundirse con spam.
    if (/invalid-input-secret|bad-request/.test(errores)) {
      console.error("[RECAPTCHA] la clave secreta no vale:", errores);
    }
    return { revisar: true, score: null, nota: `Google lo rechazó (${errores})` };
  }

  const score = typeof datos.score === "number" ? datos.score : null;

  // El hostname declarado por Google es la única forma de saber que el token
  // no viene de otro sitio que haya copiado la clave pública.
  const permitidos = (process.env.RECAPTCHA_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (permitidos.length && datos.hostname && !permitidos.includes(datos.hostname)) {
    return { revisar: true, score, nota: `token emitido en otro dominio (${datos.hostname})` };
  }

  if (score !== null && score < umbral()) {
    // La cifra NO va en la nota: vive en `verifScore` y la pintan el panel y el
    // correo por su cuenta. Metiéndola aquí salía duplicada («puntuación baja
    // (0.20) · puntuación 0.20»).
    return { revisar: true, score, nota: "Google lo puntúa como probable robot" };
  }

  return { revisar: false, score, nota: null };
}

/** Prefijo del asunto del correo. Vacío cuando no hay nada que mirar. */
export function marcaDeAsunto(v: Verificacion): string {
  return v.revisar ? "⚠ REVISAR · " : "";
}

/** Una línea legible para el cuerpo del correo y para el panel. */
export function textoVerificacion(v: Verificacion): string | null {
  if (!v.revisar) return null;
  return v.score !== null ? `${v.nota} · puntuación ${v.score.toFixed(2)}` : v.nota;
}
