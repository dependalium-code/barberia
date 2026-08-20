"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * reCAPTCHA v3 con permiso pedido DENTRO del formulario.
 *
 * Esta web no lleva analítica ni rastreadores, así que no hay banner de
 * cookies: no habría nada que consentir en la carta, en el equipo o en el
 * local. El único tercero es reCAPTCHA y solo vive en dos formularios, así que
 * el permiso se pide ahí y solo a quien va a enviar. Quien entra a mirar horas
 * no se encuentra un cartel ni recibe una sola petición a Google.
 *
 * Reglas que se cumplen aquí:
 * - Antes del sí NO se inyecta nada. `window.grecaptcha` es `undefined` y no
 *   hay ningún `<script>` de Google en el documento.
 * - Rechazar cuesta exactamente lo mismo que aceptar: los dos botones tienen
 *   el mismo tamaño y el mismo peso, y los dos ENVÍAN el formulario.
 * - Sin aspa de cerrar: cerrar o seguir navegando no es consentir.
 * - La decisión se guarda en localStorage con número de versión, para poder
 *   volver a preguntar si algún día cambia el tercero.
 * - Si el script tarda o falla, se envía igual sin token. El lead nunca se
 *   pierde por culpa de Google.
 */

const CLAVE = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const LLAVE_ALMACEN = "lb_recaptcha_v1";
const ESPERA_MAX_MS = 6_000;

/** Sin clave pública no hay protección que montar y el formulario no cambia. */
export const RECAPTCHA_ACTIVO = CLAVE.length > 0;

type Decision = "cargando" | "sin-decidir" | "si" | "no";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (clave: string, opciones: { action: string }) => Promise<string>;
    };
  }
}

/* ─────────────────────────────────────────── carga del script */

let cargando: Promise<boolean> | null = null;

function cargarScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.grecaptcha) return Promise.resolve(true);
  if (cargando) return cargando;

  cargando = new Promise<boolean>((resolver) => {
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(CLAVE)}`;
    s.async = true;
    s.defer = true;
    const corta = setTimeout(() => resolver(false), ESPERA_MAX_MS);
    s.onload = () => {
      clearTimeout(corta);
      resolver(true);
    };
    s.onerror = () => {
      clearTimeout(corta);
      // Un bloqueador de anuncios acaba aquí. No es un error del sitio.
      cargando = null;
      resolver(false);
    };
    document.head.appendChild(s);
  });
  return cargando;
}

/** Nunca lanza y nunca se cuelga: devuelve null si no hubo token a tiempo. */
async function pedirToken(accion: string): Promise<string | null> {
  const listo = await cargarScript();
  const g = typeof window !== "undefined" ? window.grecaptcha : undefined;
  if (!listo || !g) return null;

  return new Promise<string | null>((resolver) => {
    let resuelto = false;
    const acabar = (t: string | null) => {
      if (resuelto) return;
      resuelto = true;
      resolver(t);
    };
    // Salvavidas: si Google no contesta, se envía igual. Nadie se queda
    // mirando «Comprobando…» eternamente.
    setTimeout(() => acabar(null), ESPERA_MAX_MS);
    try {
      g.ready(() => {
        // El try va DENTRO del `ready`: con una clave de sitio equivocada,
        // `execute` no devuelve una promesa rechazada, LANZA aquí mismo
        // («Invalid site key or not loaded in api.js»). Con el try fuera, la
        // excepción se escapa y el envío se quedaba esperando los seis
        // segundos del salvavidas en vez de salir al momento.
        try {
          g.execute(CLAVE, { action: accion })
            .then((t) => acabar(t || null))
            .catch(() => acabar(null));
        } catch (e) {
          console.error("[RECAPTCHA] no se pudo pedir el token:", e);
          acabar(null);
        }
      });
    } catch {
      acabar(null);
    }
  });
}

/* ─────────────────────────────────────────────────── el gancho */

export type Proteccion = ReturnType<typeof useRecaptcha>;

/**
 * `accion` es la etiqueta que se manda a Google (`reservar`, `lead_barberia`).
 * Sirve para leer las puntuaciones por formulario en su panel.
 */
export function useRecaptcha(accion: string) {
  const [decision, setDecision] = useState<Decision>(RECAPTCHA_ACTIVO ? "cargando" : "no");
  const [pidiendo, setPidiendo] = useState(false);
  const [comprobando, setComprobando] = useState(false);

  const formulario = useRef<HTMLFormElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  /** Bandera de un solo uso: el reenvío programado tiene que pasar de largo. */
  const dejarPasar = useRef(false);

  // El estado se lee en un efecto, nunca al pintar: si saliera del build, las
  // páginas estáticas traerían la petición visible y parpadearía al hidratar
  // en quien ya respondió.
  useEffect(() => {
    if (!RECAPTCHA_ACTIVO) return;
    const leer = () => {
      let guardado: string | null = null;
      try {
        guardado = window.localStorage.getItem(LLAVE_ALMACEN);
      } catch {
        // Modo privado con almacenamiento capado: se pregunta cada vez.
      }
      setDecision(guardado === "si" || guardado === "no" ? guardado : "sin-decidir");
      if (guardado === "si") void cargarScript();
    };
    leer();
    // Decidir en una pestaña vale para las demás.
    window.addEventListener("storage", leer);
    return () => window.removeEventListener("storage", leer);
  }, []);

  const guardar = useCallback((valor: "si" | "no") => {
    try {
      window.localStorage.setItem(LLAVE_ALMACEN, valor);
    } catch {
      // Si no se puede guardar, se vuelve a preguntar. No es motivo para parar.
    }
    setDecision(valor);
  }, []);

  const reenviar = useCallback(() => {
    dejarPasar.current = true;
    formulario.current?.requestSubmit();
  }, []);

  const enviarConToken = useCallback(async () => {
    setComprobando(true);
    const token = await pedirToken(accion);
    setComprobando(false);
    if (campo.current) campo.current.value = token ?? "";
    reenviar();
  }, [accion, reenviar]);

  /**
   * Va en el `onSubmit` del formulario. Sin JavaScript no se ejecuta nunca y
   * el envío llega al servidor sin token: se guarda igual, marcado para
   * revisar. Es exactamente el comportamiento que se quiere.
   */
  const alEnviar = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (!RECAPTCHA_ACTIVO) return;
      if (dejarPasar.current) {
        dejarPasar.current = false;
        return;
      }
      e.preventDefault();
      if (comprobando) return;

      if (decision === "si") {
        void enviarConToken();
      } else if (decision === "no") {
        reenviar();
      } else {
        // "cargando" o "sin-decidir": se pide permiso y el envío espera.
        setPidiendo(true);
      }
    },
    [comprobando, decision, enviarConToken, reenviar],
  );

  const aceptar = useCallback(() => {
    guardar("si");
    setPidiendo(false);
    void enviarConToken();
  }, [enviarConToken, guardar]);

  const rechazar = useCallback(() => {
    guardar("no");
    setPidiendo(false);
    if (campo.current) campo.current.value = "";
    reenviar();
  }, [guardar, reenviar]);

  return {
    activo: RECAPTCHA_ACTIVO,
    decision,
    pidiendo,
    comprobando,
    formulario,
    campo,
    alEnviar,
    aceptar,
    rechazar,
  };
}

/* ────────────────────────────────────────────── piezas visibles */

/** El campo oculto donde viaja el token. Va dentro del `<form>`. */
export function CampoRecaptcha({ proteccion }: { proteccion: Proteccion }) {
  if (!proteccion.activo) return null;
  return <input ref={proteccion.campo} type="hidden" name="recaptcha" defaultValue="" />;
}

/**
 * La petición de permiso. Solo aparece cuando alguien ya ha pulsado enviar y
 * no había respondido antes, así que nadie se la encuentra por leer la web.
 *
 * `tono`: «papel» sobre fondo claro, «tinta» sobre el formulario oscuro.
 */
export function PeticionRecaptcha({
  proteccion,
  tono = "papel",
}: {
  proteccion: Proteccion;
  tono?: "papel" | "tinta";
}) {
  if (!proteccion.activo || !proteccion.pidiendo) return null;

  const oscuro = tono === "tinta";
  const marco = oscuro ? "border-white/25 bg-white/5" : "border-acero-20 bg-acero-00";
  const titulo = oscuro ? "text-acero-00" : "text-tinta";
  const cuerpo = oscuro ? "text-acero-30" : "text-acero-50";
  const enlace = oscuro ? "hover:text-acero-00" : "hover:text-tinta";
  // Los dos botones van macizos y del mismo tamaño a propósito: rechazar tiene
  // que costar exactamente lo mismo que aceptar. Un «aceptar» en color y un
  // «rechazar» en gris fino es infracción, aunque los dos funcionen.
  const aceptarBtn = "bg-bermellon text-white hover:bg-bermellon-hondo";
  const rechazarBtn = oscuro
    ? "bg-acero-05 text-tinta hover:bg-white"
    : "bg-tinta text-white hover:bg-tinta-80";

  return (
    <div
      role="group"
      aria-label="Permiso para comprobar que no eres un robot"
      className={`mt-7 border-2 ${marco} p-5`}
    >
      <p className={`cota ${oscuro ? "text-bermellon-vivo" : "text-bermellon"}`}>
        Antes de enviar
      </p>
      <p className={`titular mt-2 text-[1.25rem] ${titulo}`}>
        ¿Comprobamos que no eres un robot?
      </p>
      <p className={`mt-2 max-w-[62ch] text-[0.9rem] leading-relaxed ${cuerpo}`}>
        Usaríamos reCAPTCHA de Google, que guarda una cookie suya en tu
        navegador y le manda tu dirección IP. Es lo único de terceros que hay en
        esta web.{" "}
        <strong className={oscuro ? "text-acero-00" : "text-tinta"}>
          Digas lo que digas, tu envío sale igual.
        </strong>{" "}
        Si dices que no, lo revisamos a mano.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={proteccion.aceptar}
          disabled={proteccion.comprobando}
          className={`cota grow basis-[13rem] whitespace-nowrap px-6 py-4 text-center transition-colors disabled:opacity-60 ${aceptarBtn}`}
        >
          {proteccion.comprobando ? "Comprobando…" : "Aceptar y enviar"}
        </button>
        <button
          type="button"
          onClick={proteccion.rechazar}
          disabled={proteccion.comprobando}
          className={`cota grow basis-[13rem] whitespace-nowrap px-6 py-4 text-center transition-colors disabled:opacity-60 ${rechazarBtn}`}
        >
          Enviar sin comprobar
        </button>
      </div>

      <p className={`mt-4 text-[0.78rem] leading-relaxed ${cuerpo}`}>
        Puedes cambiar de idea en cualquier momento desde la{" "}
        <a href="/cookies" className={`underline underline-offset-2 ${enlace}`}>
          política de cookies
        </a>
        .
      </p>
    </div>
  );
}

/**
 * Atribución obligatoria de Google. El distintivo flotante se oculta en
 * `globals.css` porque tapa el botón de enviar en el móvil, y Google lo permite
 * SOLO si a cambio se pone este texto dentro del flujo del formulario.
 *
 * Se pinta únicamente cuando el script está cargado de verdad: si nadie ha
 * dado permiso, no hay nada de Google que atribuir.
 */
export function AtribucionRecaptcha({
  proteccion,
  className = "",
}: {
  proteccion: Proteccion;
  className?: string;
}) {
  if (!proteccion.activo || proteccion.decision !== "si") return null;
  return (
    <p className={`mt-4 text-[0.75rem] leading-relaxed ${className}`}>
      Protegido por reCAPTCHA. Se aplican la{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        política de privacidad
      </a>{" "}
      y las{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        condiciones del servicio
      </a>{" "}
      de Google.
    </p>
  );
}

/**
 * Botón para retirar o volver a dar el permiso. Vive en la política de
 * cookies: retirar tiene que costar lo mismo que dar.
 */
export function CambiarPermisoRecaptcha() {
  const [decision, setDecision] = useState<Decision>("cargando");

  useEffect(() => {
    if (!RECAPTCHA_ACTIVO) return;
    try {
      const g = window.localStorage.getItem(LLAVE_ALMACEN);
      setDecision(g === "si" || g === "no" ? g : "sin-decidir");
    } catch {
      setDecision("sin-decidir");
    }
  }, []);

  if (!RECAPTCHA_ACTIVO || decision === "cargando") return null;

  const olvidar = () => {
    try {
      window.localStorage.removeItem(LLAVE_ALMACEN);
    } catch {
      // Nada que hacer; se recarga igual.
    }
    // Hay que recargar: el script de Google ya cargado no se descarga solo y
    // su cookie sigue puesta hasta que el navegador tire la página.
    window.location.reload();
  };

  const texto =
    decision === "si"
      ? "Ahora mismo has dado permiso para cargar reCAPTCHA en los formularios."
      : decision === "no"
        ? "Ahora mismo NO has dado permiso: los formularios se envían sin reCAPTCHA."
        : "Todavía no te lo hemos preguntado: se pregunta al enviar un formulario.";

  return (
    <div className="not-prose mt-4 border-2 border-acero-20 bg-acero-00 p-5">
      <p className="text-[0.95rem] leading-relaxed text-tinta">{texto}</p>
      {decision !== "sin-decidir" && (
        <button
          type="button"
          onClick={olvidar}
          className="cota mt-4 inline-flex bg-tinta px-5 py-3 text-white transition-colors hover:bg-bermellon"
        >
          Olvidar mi respuesta
        </button>
      )}
    </div>
  );
}
