"use client";

import { useActionState, useEffect, useState } from "react";
import { crearCitaDesdePanel } from "../acciones";
import { duracion, precio } from "@/datos/negocio";

type Servicio = { id: string; nombre: string; duracionMin: number; precioCent: number };
type Barbero = { id: string; nombre: string };

/**
 * Apuntar la cita del que entra por la puerta.
 *
 * A diferencia de la web, aquí no se filtran huecos: el mostrador escribe la
 * hora que quiere. Lo único que no se le deja hacer es pisar otra cita, y eso
 * lo comprueba el servidor.
 */
export function NuevaCita({
  servicios,
  barberos,
  fecha,
}: {
  servicios: Servicio[];
  barberos: Barbero[];
  fecha: string;
}) {
  const [estado, enviar, enviando] = useActionState(crearCitaDesdePanel, null);
  const [abierto, setAbierto] = useState(false);
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "");

  const elegido = servicios.find((s) => s.id === servicioId);

  // Al guardar bien, se cierra el desplegable: si no, se queda el formulario
  // abierto con los datos del cliente anterior a la vista.
  useEffect(() => {
    if (estado?.ok) setAbierto(false);
  }, [estado]);

  if (servicios.length === 0 || barberos.length === 0) return null;

  return (
    <div className="mt-5">
      {estado?.mensaje && (
        <p
          role="status"
          className={`mb-3 px-4 py-3 text-[0.9rem] ${estado.ok ? "bg-acero-10" : "border-t-2 border-bermellon bg-bermellon-humo"}`}
        >
          {estado.mensaje}
        </p>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="cota bg-tinta px-5 py-3 text-white transition-colors hover:bg-bermellon"
      >
        {abierto ? "Cerrar" : "Apuntar una cita"}
      </button>

      {abierto && (
        <form
          action={enviar}
          className="mt-3 grid gap-4 border-2 border-tinta bg-acero-00 p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="cota text-acero-50 sm:col-span-2">
            Servicio
            <select
              name="servicioId"
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} · {duracion(s.duracionMin)} · {precio(s.precioCent)}
                </option>
              ))}
            </select>
          </label>

          <label className="cota text-acero-50">
            Barbero
            <select
              name="barberoId"
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            >
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="cota text-acero-50">
              Día
              <input
                name="fecha"
                type="date"
                defaultValue={fecha}
                required
                className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.9rem] focus:border-tinta focus:outline-none"
              />
            </label>
            <label className="cota text-acero-50">
              Hora
              <input
                name="hora"
                type="time"
                step={300}
                required
                className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.9rem] focus:border-tinta focus:outline-none"
              />
            </label>
          </div>

          <label className="cota text-acero-50">
            Nombre
            <input
              name="nombre"
              required
              maxLength={120}
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            />
          </label>

          <label className="cota text-acero-50">
            Teléfono
            <input
              name="telefono"
              type="tel"
              required
              maxLength={30}
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            />
          </label>

          <label className="cota text-acero-50">
            Email (opcional)
            <input
              name="email"
              type="email"
              maxLength={120}
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            />
          </label>

          <label className="cota text-acero-50">
            Nota (opcional)
            <input
              name="notas"
              maxLength={300}
              className="mt-1.5 w-full border border-acero-20 bg-acero-00 px-3 py-2.5 text-[0.95rem] focus:border-tinta focus:outline-none"
            />
          </label>

          <div className="flex items-end gap-4 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={enviando}
              className="cota bg-bermellon px-6 py-3 text-white transition-colors hover:bg-tinta disabled:bg-acero-20 disabled:text-acero-50"
            >
              {enviando ? "Apuntando…" : "Apuntar la cita"}
            </button>
            {elegido && (
              <p className="medida text-[0.85rem] text-acero-50">
                Ocupa {duracion(elegido.duracionMin)} · {precio(elegido.precioCent)}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
