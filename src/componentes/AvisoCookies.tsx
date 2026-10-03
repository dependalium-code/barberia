"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GA_ID } from "@/lib/ga";

/**
 * Estadísticas con consentimiento y el aviso que lo pide (guía de la AEPD):
 *  1. Nada de Google existe en la página hasta pulsar «Aceptar»: ni el script
 *     ni `window.gtag`. No vale cargarlo «desactivado».
 *  2. Aceptar y rechazar cuestan lo mismo: dos botones iguales.
 *  3. Sin aspa: cerrar o seguir navegando no es consentir.
 *  4. Retirar el consentimiento es un botón (`BotonPreferencias`, en el pie y
 *     en /cookies); al retirarlo se borran las cookies de Google y se recarga.
 * Sin GA_ID no hay nada que consentir y el aviso no aparece.
 *
 * Es independiente del permiso de reCAPTCHA (`lb_recaptcha_v1`), que se sigue
 * pidiendo dentro del formulario y solo a quien va a enviar.
 */

const GA = GA_ID;
const CLAVE = "lb_estadisticas_v1";
const VERSION = 1;
export const EVENTO_REABRIR = "lb:preferencias-cookies";

type Eleccion = "si" | "no" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function leer(): Eleccion {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    return d?.v === VERSION && (d.e === "si" || d.e === "no") ? d.e : null;
  } catch {
    return null; // almacenamiento bloqueado: «sin decidir», nunca «sí»
  }
}

function guardar(e: "si" | "no") {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, e, f: new Date().toISOString() }));
  } catch {}
}

function borrarCookiesDeGoogle() {
  const nombres = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid");
  const partes = location.hostname.split(".");
  for (const n of nombres) {
    for (const d of ["", location.hostname, `.${partes.slice(-2).join(".")}`]) {
      document.cookie = `${n}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

/** Inyecta gtag. `arguments` y no un array: con array carga pero no mide. */
function cargarGoogle() {
  if (!GA || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA, { anonymize_ip: true, send_page_view: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA}`;
  document.head.appendChild(s);
  window.gtag("event", "page_view", { page_location: location.href, page_title: document.title });
}

export default function AvisoCookies() {
  const ruta = usePathname();
  const [eleccion, setEleccion] = useState<Eleccion | "sin-leer">("sin-leer");
  const primeraRuta = useRef(true);

  useEffect(() => {
    if (!GA) return;
    const e = leer();
    setEleccion(e);
    if (e === "si") cargarGoogle();
    if (e === "no") borrarCookiesDeGoogle(); // Google reescribe _ga_* al salir: se barre también al cargar
    const reabrir = () => setEleccion(null);
    const otraPestana = (ev: StorageEvent) => ev.key === CLAVE && setEleccion(leer());
    window.addEventListener(EVENTO_REABRIR, reabrir);
    window.addEventListener("storage", otraPestana);
    return () => {
      window.removeEventListener(EVENTO_REABRIR, reabrir);
      window.removeEventListener("storage", otraPestana);
    };
  }, []);

  // Vista por cada cambio de página (la primera la manda cargarGoogle).
  useEffect(() => {
    if (primeraRuta.current) {
      primeraRuta.current = false;
      return;
    }
    if (window.gtag) window.gtag("event", "page_view", { page_location: location.href, page_title: document.title });
  }, [ruta]);

  if (!GA || eleccion !== null) return null;

  const decidir = (valor: "si" | "no") => {
    const antes = leer();
    guardar(valor);
    if (antes === "si" && valor === "no") {
      borrarCookiesDeGoogle();
      location.reload();
      return;
    }
    if (valor === "si") cargarGoogle();
    setEleccion(valor);
  };

  // Los dos botones comparten clase: rechazar cuesta exactamente lo mismo.
  const boton =
    "cota grow basis-[9rem] border-2 border-acero-30 px-5 py-3.5 text-center text-acero-00 transition-colors hover:border-acero-00 hover:bg-tinta-80";

  return (
    <div
      role="dialog"
      aria-labelledby="cookies-titulo"
      aria-describedby="cookies-texto"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl border-2 border-tinta-60 bg-tinta p-5 text-acero-05 shadow-[0_-8px_40px_rgba(0,0,0,0.25)] sm:inset-x-auto sm:bottom-6 sm:left-6 md:p-6"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <p id="cookies-titulo" className="cota text-bermellon-vivo">
        Cookies
      </p>
      <p id="cookies-texto" className="mt-2 text-[0.92rem] leading-relaxed text-acero-30">
        ¿Nos dejas contar las visitas con Google Analytics? Sirve para saber cuánta gente entra y qué
        páginas mira. Solo se instala si aceptas. Más en la{" "}
        <Link href="/cookies" className="text-acero-00 underline underline-offset-2">
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => decidir("no")} className={boton}>
          Rechazar
        </button>
        <button type="button" onClick={() => decidir("si")} className={boton}>
          Aceptar
        </button>
      </div>
    </div>
  );
}

/** «Preferencias de cookies»: solo existe si hay algo que configurar. */
export function BotonPreferencias({ className = "" }: { className?: string }) {
  if (!GA) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_REABRIR))} className={className}>
      Preferencias de cookies
    </button>
  );
}
