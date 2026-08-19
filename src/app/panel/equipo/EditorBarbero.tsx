"use client";

import { useActionState } from "react";
import { guardarBarbero, guardarHorario, type Respuesta } from "../gestion";
import { Aviso, Boton, Campo, Area, Casilla, CLASE_CAMPO } from "../piezas";
import { tintaSobre } from "@/lib/color";

export type BarberoPanel = {
  id: string;
  nombre: string;
  puesto: string | null;
  bio: string | null;
  color: string;
  activo: boolean;
  orden: number;
  servicios: string[];
  /** Hasta dos tramos por día: mañana y tarde. */
  horario: Record<number, { de: string; a: string }[]>;
};

const DIAS = [
  [1, "Lunes"],
  [2, "Martes"],
  [3, "Miércoles"],
  [4, "Jueves"],
  [5, "Viernes"],
  [6, "Sábado"],
  [7, "Domingo"],
] as const;

export function EditorBarbero({
  barbero,
  servicios,
}: {
  barbero?: BarberoPanel;
  servicios: { id: string; nombre: string }[];
}) {
  const [estado, enviar, enviando] = useActionState<Respuesta | null, FormData>(
    guardarBarbero,
    null,
  );

  return (
    <form action={enviar} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
      {barbero && <input type="hidden" name="id" value={barbero.id} />}

      <Campo etiqueta="Nombre" name="nombre" required maxLength={60} defaultValue={barbero?.nombre} />
      <Campo
        etiqueta="Puesto"
        name="puesto"
        maxLength={60}
        placeholder="Barbero"
        defaultValue={barbero?.puesto ?? ""}
      />
      <Campo etiqueta="Color en la agenda">
        <span className="mt-1.5 flex items-center gap-2">
          <input
            name="color"
            type="color"
            defaultValue={barbero?.color ?? "#c22e10"}
            className="h-10 w-14 cursor-pointer border border-acero-20 bg-acero-00 p-1"
          />
          <span
            className="cota flex h-10 flex-1 items-center justify-center"
            style={{
              background: barbero?.color ?? "#c22e10",
              color: tintaSobre(barbero?.color ?? "#c22e10"),
            }}
          >
            Muestra
          </span>
        </span>
      </Campo>
      <Campo
        etiqueta="Orden"
        name="orden"
        type="number"
        min={0}
        max={999}
        defaultValue={barbero?.orden ?? 0}
      />

      <div className="sm:col-span-2 lg:col-span-4">
        <Area
          etiqueta="Presentación (sale en la web)"
          name="bio"
          rows={2}
          maxLength={400}
          defaultValue={barbero?.bio ?? ""}
        />
      </div>

      <fieldset className="sm:col-span-2 lg:col-span-4">
        <legend className="cota text-acero-50">Qué servicios hace</legend>
        <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <Casilla
              key={s.id}
              etiqueta={s.nombre}
              name="servicios"
              value={s.id}
              defaultChecked={barbero ? barbero.servicios.includes(s.id) : true}
            />
          ))}
        </div>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-acero-50">
          Un servicio sin nadie marcado no se puede reservar por la web.
        </p>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-4">
        <Casilla etiqueta="Activo" name="activo" defaultChecked={barbero?.activo ?? true} />
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : barbero ? "Guardar" : "Crear barbero"}
        </Boton>
      </div>

      <div className="sm:col-span-2 lg:col-span-4">
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

export function EditorHorario({ barbero }: { barbero: BarberoPanel }) {
  const [estado, enviar, enviando] = useActionState<Respuesta | null, FormData>(
    guardarHorario,
    null,
  );

  return (
    <form action={enviar} className="p-5">
      <input type="hidden" name="barberoId" value={barbero.id} />

      <p className="max-w-[62ch] text-[0.9rem] leading-relaxed text-acero-50">
        Deja los dos huecos vacíos para cerrar ese día. Si hay turno partido,
        rellena la mañana y la tarde; si es jornada seguida, usa solo la mañana.
      </p>

      <table className="mt-4 w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="cota py-2 font-medium text-acero-50">Día</th>
            <th className="cota py-2 font-medium text-acero-50" colSpan={2}>
              Turno de mañana
            </th>
            <th className="cota py-2 font-medium text-acero-50" colSpan={2}>
              Turno de tarde
            </th>
          </tr>
        </thead>
        <tbody>
          {DIAS.map(([n, nombre]) => {
            const tramos = barbero.horario[n] ?? [];
            return (
              <tr key={n} className="border-t border-acero-20">
                <td className="py-2 pr-3 text-[0.9rem]">{nombre}</td>
                {[0, 1].map((i) => (
                  <Turno key={i} dia={n} indice={i} tramo={tramos[i]} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5">
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar el horario"}
        </Boton>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}

function Turno({
  dia,
  indice,
  tramo,
}: {
  dia: number;
  indice: number;
  tramo?: { de: string; a: string };
}) {
  const sufijo = indice === 0 ? "m" : "t";
  return (
    <>
      <td className="py-2 pr-2">
        <input
          type="time"
          step={300}
          name={`d${dia}${sufijo}de`}
          defaultValue={tramo?.de ?? ""}
          aria-label={`Apertura, día ${dia}, turno ${indice + 1}`}
          className={`${CLASE_CAMPO} mt-0 w-[7.5rem]`}
        />
      </td>
      <td className="py-2 pr-4">
        <input
          type="time"
          step={300}
          name={`d${dia}${sufijo}a`}
          defaultValue={tramo?.a ?? ""}
          aria-label={`Cierre, día ${dia}, turno ${indice + 1}`}
          className={`${CLASE_CAMPO} mt-0 w-[7.5rem]`}
        />
      </td>
    </>
  );
}
