"use client";

import { useActionState } from "react";
import type { Respuesta } from "../acciones";

export function FormularioMover({
  accion,
  id,
  fecha,
  hora,
  barberoId,
  barberos,
}: {
  accion: (previo: Respuesta | null, datos: FormData) => Promise<Respuesta>;
  id: string;
  fecha: string;
  hora: string;
  barberoId: string;
  barberos: { id: string; nombre: string }[];
}) {
  const [estado, enviar, enviando] = useActionState(accion, null);

  return (
    <details className="mt-5 border-t border-acero-20 pt-4">
      <summary className="cota cursor-pointer text-acero-50 hover:text-tinta">
        Cambiar de hora o de barbero
      </summary>

      <form action={enviar} className="mt-3 grid gap-3">
        <input type="hidden" name="id" value={id} />

        <label className="cota text-acero-50">
          Día
          <input
            name="fecha"
            type="date"
            defaultValue={fecha}
            required
            className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2 font-[var(--font-medida)] text-[0.9rem] focus:border-tinta focus:outline-none"
          />
        </label>

        <label className="cota text-acero-50">
          Hora
          <input
            name="hora"
            type="time"
            step={300}
            defaultValue={hora}
            required
            className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2 font-[var(--font-medida)] text-[0.9rem] focus:border-tinta focus:outline-none"
          />
        </label>

        <label className="cota text-acero-50">
          Barbero
          <select
            name="barberoId"
            defaultValue={barberoId}
            className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2 text-[0.9rem] focus:border-tinta focus:outline-none"
          >
            {barberos.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="cota bg-tinta px-4 py-2.5 text-white transition-colors hover:bg-bermellon disabled:bg-acero-20 disabled:text-acero-50"
        >
          {enviando ? "Moviendo…" : "Mover la cita"}
        </button>

        {estado?.mensaje && (
          <p
            role="status"
            className={`px-3 py-2 text-[0.85rem] leading-relaxed ${
              estado.ok ? "bg-acero-10" : "bg-bermellon-humo"
            }`}
          >
            {estado.mensaje}
          </p>
        )}
      </form>
    </details>
  );
}
