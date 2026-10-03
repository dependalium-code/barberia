"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconoCruz, IconoFlecha } from "@/componentes/Iconos";
import { EVENTO_DECIDIDO, avisoCookiesPendiente } from "@/componentes/AvisoCookies";

/**
 * El aviso de bienvenida: el reel de Instagram y la pregunta de venta.
 *
 * Quien entra por la portada llega casi siempre desde el reel o desde la
 * biografía de Instagram, así que el diálogo dice a la cara para qué sirve
 * esto —una web de barbería con la agenda dentro— y deja el vídeo debajo.
 *
 * Solo vive en la PORTADA y solo se enseña UNA VEZ por navegador. Ni en
 * `/reservar` —cortarle una reserva a alguien a mitad es la peor idea posible—
 * ni en `/para-barberias`, que es la única página indexada: un diálogo que
 * tapa el contenido a quien llega desde Google es justo lo que Google cuenta
 * como intersticial intrusivo.
 *
 * El vídeo NO se reproduce solo: lleva voz en off, y el sonido automático lo
 * bloquean los navegadores y lo odia todo el mundo. Se pinta el cartel y quien
 * quiera, lo pone. Con `preload="none"` no se descarga ni un byte hasta
 * entonces.
 *
 * La maqueta sigue la receta de la casa: el scroll lo hace el ENVOLTORIO y la
 * caja se centra con `margin:auto`. Con `align-items:center`, lo que no cabe se
 * recorta por arriba y no hay forma de alcanzarlo.
 */

const LLAVE = "lb_video_v2";

export function VideoExplicativo() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const focoPrevio = useRef<Element | null>(null);

  // Se decide en un efecto, nunca al pintar: si saliera del build, la portada
  // estática traería el diálogo visible y parpadearía a quien ya lo vio.
  useEffect(() => {
    let visto = null;
    try {
      visto = window.localStorage.getItem(LLAVE);
    } catch {
      // Modo privado con el almacenamiento capado: se enseña y punto.
    }
    if (visto) return;
    // Con el aviso de cookies esperando respuesta, el vídeo espera: dos
    // diálogos a la vez y este tapaba los botones de Aceptar y Rechazar.
    if (!avisoCookiesPendiente()) {
      setAbierto(true);
      return;
    }
    const abrir = () => setAbierto(true);
    window.addEventListener(EVENTO_DECIDIDO, abrir, { once: true });
    return () => window.removeEventListener(EVENTO_DECIDIDO, abrir);
  }, []);

  const cerrar = useCallback(() => {
    try {
      window.localStorage.setItem(LLAVE, "visto");
    } catch {
      // Si no se puede guardar, volverá a salir. No es motivo para no cerrar.
    }
    video.current?.pause();
    setAbierto(false);
  }, []);

  useEffect(() => {
    if (!abierto) {
      (focoPrevio.current as HTMLElement | null)?.focus?.();
      return;
    }
    focoPrevio.current = document.activeElement;
    caja.current?.focus();

    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";

    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", tecla);
    return () => {
      raiz.style.overflow = antes;
      window.removeEventListener("keydown", tecla);
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex overflow-y-auto overscroll-contain p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      {/* Fijo, no absoluto: si el envoltorio se desplaza, un fondo absoluto
          deja una franja sin oscurecer al bajar. */}
      <div aria-hidden="true" className="fixed inset-0 bg-tinta/80" />

      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-video"
        tabIndex={-1}
        className="sombra-alzada relative z-10 m-auto w-full max-w-[26rem] border-2 border-tinta bg-acero-00 outline-none"
      >
        <div className="campo-tinta flex items-center justify-between gap-4 bg-tinta px-5 py-3 text-white">
          <p className="cota text-bermellon-vivo">Webs para barberías</p>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar el aviso"
            className="-mr-2 p-2 text-acero-30 transition-colors hover:text-white"
          >
            <IconoCruz className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="titulo-video" className="titular text-[clamp(1.75rem,min(7.4vw,7.5svh),2.5rem)]">
            ¿A qué esperas para contratar tu web{" "}
            <span className="text-bermellon">con gestión de visitas</span>?
          </h2>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-tinta-60">
            Míralo funcionando en minuto y medio. La barbería del ejemplo no
            existe; la agenda y el panel, sí: trastéalos sin molestar a nadie.
          </p>

          <video
            ref={video}
            controls
            playsInline
            preload="none"
            poster="/video/explicativo-cartel.jpg"
            className="mx-auto mt-4 block max-h-[40svh] w-auto max-w-full border-2 border-tinta bg-tinta"
          >
            <source src="/video/explicativo.mp4" type="video/mp4" />
            Tu navegador no puede reproducir el vídeo.{" "}
            <a href="/video/explicativo.mp4">Descárgalo aquí</a>.
          </video>

          <div className="mt-4 grid gap-2.5">
            <Link
              href="/para-barberias"
              onClick={cerrar}
              className="group inline-flex items-center justify-center gap-2.5 bg-bermellon px-6 py-3.5 text-white transition-colors hover:bg-tinta"
            >
              <span className="cota">Quiero mi web con agenda</span>
              <IconoFlecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={cerrar}
              className="cota min-h-11 border-2 border-tinta px-6 py-3.5 text-tinta transition-colors hover:bg-tinta hover:text-white"
            >
              Prefiero trastear yo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
