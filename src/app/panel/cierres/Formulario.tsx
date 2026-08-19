"use client";

import { useActionState } from "react";
import { crearBloqueo, type Respuesta } from "../gestion";
import { Aviso, Boton, Campo, CLASE_CAMPO } from "../piezas";

export function FormularioCierre({
  barberos,
  hoy,
}: {
  barberos: { id: string; nombre: string }[];
  hoy: string;
}) {
  const [estado, enviar, enviando] = useActionState<Respuesta | null, FormData>(
    crearBloqueo,
    null,
  );

  return (
    <form action={enviar} className="grid gap-4 border-2 border-tinta bg-acero-00 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <Campo etiqueta="A quién afecta" ancho="sm:col-span-2">
        <select name="barberoId" className={CLASE_CAMPO} defaultValue="">
          <option value="">Todo el local</option>
          {barberos.map((b) => (
            <option key={b.id} value={b.id}>
              Solo {b.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta="Motivo" name="motivo" maxLength={80} placeholder="Vacaciones, festivo, formación…" ancho="sm:col-span-2" />

      <Campo etiqueta="Desde el día" name="desdeFecha" type="date" required defaultValue={hoy} />
      <Campo etiqueta="A las" name="desdeHora" type="time" step={300} defaultValue="00:00" />
      <Campo etiqueta="Hasta el día" name="hastaFecha" type="date" required defaultValue={hoy} />
      <Campo etiqueta="A las" name="hastaHora" type="time" step={300} defaultValue="23:59" />

      <div className="sm:col-span-2 lg:col-span-4">
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Cerrar esas fechas"}
        </Boton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}
