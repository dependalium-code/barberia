"use client";

import { useActionState } from "react";
import { pedirInformacion, type EstadoLead } from "./acciones";
import { IconoCheck, IconoFlecha } from "@/componentes/Iconos";

const CAMPO =
  "mt-2 w-full border-2 border-white/25 bg-white/5 px-4 py-3 text-[1rem] text-acero-00 transition-colors placeholder:text-acero-30 focus:border-bermellon-vivo focus:outline-none";

export function FormularioBarberia() {
  const [estado, enviar, enviando] = useActionState<EstadoLead | null, FormData>(
    pedirInformacion,
    null,
  );
  const v = estado?.valores ?? {};

  if (estado?.ok) {
    return (
      <div className="border-2 border-bermellon-vivo p-7">
        <p className="titular flex items-center gap-3 text-[1.5rem] text-acero-00">
          <IconoCheck className="h-6 w-6 text-bermellon-vivo" />
          Recibido
        </p>
        <p className="mt-3 text-[1rem] leading-relaxed text-acero-30">{estado.mensaje}</p>
      </div>
    );
  }

  return (
    <form action={enviar} className="campo-tinta border-2 border-white/25 p-6 sm:p-7">
      {estado && !estado.ok && estado.mensaje && (
        <p
          role="alert"
          className="mb-6 border-t-2 border-bermellon-vivo bg-white/10 px-4 py-3 text-[0.95rem] leading-relaxed text-acero-00"
        >
          {estado.mensaje}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="cota text-acero-30">
          Nombre de la barbería
          <input name="negocio" maxLength={120} defaultValue={v.negocio} className={CAMPO} />
        </label>
        <label className="cota text-acero-30">
          Población
          <input name="poblacion" maxLength={120} defaultValue={v.poblacion} className={CAMPO} />
        </label>
        <label className="cota text-acero-30">
          Tu nombre <span className="text-bermellon-vivo">*</span>
          <input name="nombre" required maxLength={120} defaultValue={v.nombre} className={CAMPO} />
        </label>
        <label className="cota text-acero-30">
          Teléfono <span className="text-bermellon-vivo">*</span>
          <input
            name="telefono"
            type="tel"
            inputMode="tel"
            required
            maxLength={30}
            defaultValue={v.telefono}
            className={CAMPO}
          />
        </label>
        <label className="cota text-acero-30 sm:col-span-2">
          Email
          <input
            name="email"
            type="email"
            maxLength={160}
            defaultValue={v.email}
            className={CAMPO}
          />
        </label>
        <label className="cota text-acero-30 sm:col-span-2">
          ¿Qué necesitas?
          <textarea
            name="texto"
            rows={4}
            maxLength={2000}
            defaultValue={v.texto}
            placeholder="Cuántos barberos sois, si ya tenéis web, si usáis alguna aplicación de reservas…"
            className={`${CAMPO} leading-relaxed`}
          />
        </label>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Segundo apellido
          <input name="apellido2" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="group mt-7 inline-flex w-full items-center justify-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-white hover:text-tinta disabled:bg-white/20 disabled:text-acero-30 sm:w-auto"
      >
        <span className="titular text-lg">{enviando ? "Enviando…" : "Que me la enseñen"}</span>
        {!enviando && (
          <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>

      <p className="mt-4 max-w-[58ch] text-[0.82rem] leading-relaxed text-acero-30">
        Te contestamos para enseñártela y pasarte presupuesto. No te apuntamos a
        ninguna lista ni te mandamos publicidad.
      </p>
    </form>
  );
}
