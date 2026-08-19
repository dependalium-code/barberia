"use client";

import { useActionState } from "react";
import { guardarAjustes, type Respuesta } from "../gestion";
import { Aviso, Boton, Campo, Area, CLASE_CAMPO } from "../piezas";

export function FormularioAjustes({
  ajustes,
}: {
  ajustes: {
    intervaloSlotMin: number;
    antelacionMinHoras: number;
    ventanaDiasMax: number;
    maxCitasPorEmail: number;
    avisoReservas: string;
  };
}) {
  const [estado, enviar, enviando] = useActionState<Respuesta | null, FormData>(
    guardarAjustes,
    null,
  );

  return (
    <form action={enviar} className="mt-6 grid max-w-3xl gap-6">
      <Bloque
        titulo="Cada cuánto empieza una cita"
        explica="Con 15 minutos las horas salen a y cuarto, y media, menos cuarto… Bajarlo a 5 llena la web de opciones; subirlo a 30 deja la agenda más ordenada pero pierdes huecos."
      >
        <Campo etiqueta="Paso de la agenda">
          <select
            name="intervaloSlotMin"
            defaultValue={ajustes.intervaloSlotMin}
            className={CLASE_CAMPO}
          >
            {[5, 10, 15, 20, 30, 60].map((n) => (
              <option key={n} value={n}>
                {n} minutos
              </option>
            ))}
          </select>
        </Campo>
      </Bloque>

      <Bloque
        titulo="Con cuánta antelación como mínimo"
        explica="Horas que tienen que faltar para que la web deje coger esa hora. En 0 alguien puede reservar para dentro de cinco minutos y plantarse sin que os dé tiempo a verlo."
      >
        <Campo
          etiqueta="Horas"
          name="antelacionMinHoras"
          type="number"
          min={0}
          max={72}
          defaultValue={ajustes.antelacionMinHoras}
        />
      </Bloque>

      <Bloque
        titulo="Con cuánto tiempo se puede reservar"
        explica="Cuántos días hacia delante enseña la web. Más de dos meses suele traer citas que nadie recuerda."
      >
        <Campo
          etiqueta="Días"
          name="ventanaDiasMax"
          type="number"
          min={1}
          max={365}
          defaultValue={ajustes.ventanaDiasMax}
        />
      </Bloque>

      <Bloque
        titulo="Tope de citas abiertas por cliente"
        explica="Solo se aplica a quien deja correo, y evita que alguien bloquee media agenda. En el mostrador no hay tope."
      >
        <Campo
          etiqueta="Citas"
          name="maxCitasPorEmail"
          type="number"
          min={1}
          max={20}
          defaultValue={ajustes.maxCitasPorEmail}
        />
      </Bloque>

      <Bloque
        titulo="Aviso en el formulario de reserva"
        explica="Sale justo encima del botón de confirmar. Sirve para cosas del momento: «el jueves cerramos a las 18 h». Vacío no sale nada."
      >
        <Area
          etiqueta="Texto"
          name="avisoReservas"
          rows={2}
          maxLength={300}
          defaultValue={ajustes.avisoReservas}
        />
      </Bloque>

      <div>
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar los ajustes"}
        </Boton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

function Bloque({
  titulo,
  explica,
  children,
}: {
  titulo: string;
  explica: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border border-acero-20 bg-acero-00 p-5 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-start">
      <div>
        <h2 className="titular text-[1.2rem]">{titulo}</h2>
        <p className="mt-1.5 max-w-[58ch] text-[0.88rem] leading-relaxed text-acero-50">
          {explica}
        </p>
      </div>
      <div className="sm:pt-1">{children}</div>
    </section>
  );
}
