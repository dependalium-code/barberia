"use client";

import { useActionState } from "react";
import { enviarMensaje, type EstadoContacto } from "./acciones";
import { IconoFlecha } from "@/componentes/Iconos";
import {
  AtribucionRecaptcha,
  CampoRecaptcha,
  PeticionRecaptcha,
  useRecaptcha,
} from "@/componentes/Recaptcha";

const CAMPO =
  "mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] text-tinta transition-colors placeholder:text-acero-30 focus:border-tinta focus:outline-none";

export function FormularioContacto() {
  const [estado, enviar, enviando] = useActionState<EstadoContacto | null, FormData>(
    enviarMensaje,
    null,
  );
  const proteccion = useRecaptcha("contacto");
  const v = estado?.valores ?? {};

  if (estado?.ok) {
    return (
      <div className="border-2 border-tinta bg-acero-00 p-7">
        <p className="titular text-[1.5rem]">Mensaje enviado</p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-tinta-60">{estado.mensaje}</p>
      </div>
    );
  }

  return (
    <form
      ref={proteccion.formulario}
      action={enviar}
      onSubmit={proteccion.alEnviar}
      className="relative border-2 border-tinta bg-acero-00 p-6 sm:p-7"
    >
      {estado && !estado.ok && estado.mensaje && (
        <p role="alert" className="mb-6 bg-bermellon-humo px-4 py-3 text-[0.95rem] leading-relaxed">
          {estado.mensaje}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="cota text-acero-50">
          Nombre <span className="text-bermellon">*</span>
          <input name="nombre" required maxLength={120} defaultValue={v.nombre} className={CAMPO} />
        </label>
        <label className="cota text-acero-50">
          Teléfono
          <input
            name="telefono"
            type="tel"
            inputMode="tel"
            maxLength={30}
            defaultValue={v.telefono}
            className={CAMPO}
          />
        </label>
        <label className="cota text-acero-50 sm:col-span-2">
          Email <span className="text-bermellon">*</span>
          <input
            name="email"
            type="email"
            required
            maxLength={160}
            defaultValue={v.email}
            className={CAMPO}
          />
        </label>
        <label className="cota text-acero-50 sm:col-span-2">
          Tu mensaje <span className="text-bermellon">*</span>
          <textarea
            name="texto"
            required
            rows={5}
            maxLength={2000}
            defaultValue={v.texto}
            className={`${CAMPO} leading-relaxed`}
          />
        </label>
      </div>

      {/* Cebo para robots: oculto para el ojo y para el lector de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Segundo apellido
          <input name="apellido2" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <CampoRecaptcha proteccion={proteccion} />
      <PeticionRecaptcha proteccion={proteccion} />

      <button
        type="submit"
        disabled={enviando || proteccion.comprobando}
        className="group mt-7 inline-flex w-full items-center justify-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-tinta disabled:bg-acero-20 disabled:text-acero-50 sm:w-auto"
      >
        <span className="titular text-lg">
          {enviando ? "Enviando…" : proteccion.comprobando ? "Comprobando…" : "Enviar mensaje"}
        </span>
        {!enviando && !proteccion.comprobando && (
          <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>

      <p className="mt-4 max-w-[58ch] text-[0.82rem] leading-relaxed text-acero-50">
        Solo usamos estos datos para contestarte. No los cedemos a nadie ni te
        vamos a mandar publicidad.
      </p>

      <AtribucionRecaptcha proteccion={proteccion} className="max-w-[58ch] text-acero-50" />
    </form>
  );
}
