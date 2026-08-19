"use client";

import { useActionState } from "react";
import { guardarServicio, borrarServicio, type Respuesta } from "../gestion";
import { Aviso, Boton, Campo, Area, Casilla, CLASE_CAMPO } from "../piezas";

export type ServicioPanel = {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  duracionMin: number;
  precioCent: number;
  destacado: boolean;
  activo: boolean;
  orden: number;
  citas: number;
};

export function EditorServicio({
  servicio,
  categorias,
}: {
  servicio?: ServicioPanel;
  categorias: string[];
}) {
  const [estado, enviar, enviando] = useActionState<Respuesta | null, FormData>(
    guardarServicio,
    null,
  );
  const nuevo = !servicio;

  // El borrado va en su PROPIO formulario, hermano del de edición y no dentro:
  // un <form> anidado es HTML inválido, React no lo hidrata y el botón se queda
  // muerto sin decir nada.
  return (
    <>
      <form action={enviar} className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {servicio && <input type="hidden" name="id" value={servicio.id} />}

        <Campo
          etiqueta="Nombre"
          name="nombre"
          required
          maxLength={80}
          defaultValue={servicio?.nombre}
          ancho="sm:col-span-2"
        />

        <Campo etiqueta="Categoría">
          <input
            name="categoria"
            list="categorias-servicio"
            defaultValue={servicio?.categoria ?? "Barbería"}
            maxLength={40}
            className={CLASE_CAMPO}
          />
        </Campo>
        <datalist id="categorias-servicio">
          {categorias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <Campo
          etiqueta="Orden"
          name="orden"
          type="number"
          min={0}
          max={999}
          defaultValue={servicio?.orden ?? 0}
        />

        <div className="sm:col-span-2 lg:col-span-4">
          <Area
            etiqueta="Descripción (sale en la carta)"
            name="descripcion"
            rows={2}
            maxLength={300}
            defaultValue={servicio?.descripcion ?? ""}
          />
        </div>

        <Campo
          etiqueta="Duración en minutos"
          name="duracionMin"
          type="number"
          min={5}
          max={480}
          step={5}
          required
          defaultValue={servicio?.duracionMin ?? 30}
        />

        <Campo
          etiqueta="Precio en euros"
          name="precio"
          type="text"
          inputMode="decimal"
          required
          defaultValue={servicio ? (servicio.precioCent / 100).toFixed(2) : "0.00"}
        />

        <div className="flex flex-wrap items-end gap-5 sm:col-span-2">
          <Casilla etiqueta="Activo" name="activo" defaultChecked={servicio?.activo ?? true} />
          <Casilla
            etiqueta="Destacado en portada"
            name="destacado"
            defaultChecked={servicio?.destacado ?? false}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando…" : nuevo ? "Crear servicio" : "Guardar"}
          </Boton>
          <Aviso estado={estado} />
        </div>
      </form>

      {servicio && (
        <BotonBorrar id={servicio.id} citas={servicio.citas} nombre={servicio.nombre} />
      )}
    </>
  );
}

function BotonBorrar({ id, citas, nombre }: { id: string; citas: number; nombre: string }) {
  return (
    <form
      action={borrarServicio}
      className="flex flex-wrap items-center gap-4 border-t border-acero-20 px-5 py-4"
    >
      <input type="hidden" name="id" value={id} />
      <Boton tono="peligro" type="submit">
        {citas > 0 ? "Retirar de la carta" : "Borrar"}
      </Boton>
      <span className="max-w-[52ch] text-[0.8rem] leading-relaxed text-acero-50">
        {citas > 0
          ? `«${nombre}» tiene ${citas} ${citas === 1 ? "cita" : "citas"} en el histórico, así que se apaga en vez de borrarse: si desapareciera, esas citas se quedarían sin servicio.`
          : "Nadie lo ha reservado nunca, así que se borra del todo."}
      </span>
    </form>
  );
}
