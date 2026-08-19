"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { reservar, type EstadoReserva } from "./acciones";
import { DiagramaCabeza } from "@/componentes/DiagramaCabeza";
import { IconoCheck, IconoFlecha, IconoReloj } from "@/componentes/Iconos";
import { duracion, precio, NEGOCIO } from "@/datos/negocio";
import { fechaCorta, fechaLarga, hoyISO, nombreDia, sumarDias } from "@/lib/tiempo";

export type ServicioUI = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  duracionMin: number;
  precioCent: number;
};

export type BarberoUI = {
  slug: string;
  nombre: string;
  puesto: string | null;
  color: string;
  servicios: string[]; // slugs
};

type DiaApi = { fecha: string; huecos: { hora: string; barberos: string[] }[] };

const PASOS = ["Servicio", "Barbero", "Día y hora", "Tus datos"] as const;

export function MotorDeReserva({
  servicios,
  barberos,
  inicial,
  aviso,
}: {
  servicios: ServicioUI[];
  barberos: BarberoUI[];
  inicial: { servicio?: string; barbero?: string; fecha?: string; hora?: string };
  aviso: string;
}) {
  const [servicio, setServicio] = useState<string | null>(inicial.servicio ?? null);
  const [barbero, setBarbero] = useState<string | null>(inicial.barbero ?? null);
  const [barberoElegido, setBarberoElegido] = useState(Boolean(inicial.barbero));
  const [fecha, setFecha] = useState<string | null>(inicial.fecha ?? null);
  const [hora, setHora] = useState<string | null>(inicial.hora ?? null);

  const primerPaso = servicio ? (barberoElegido ? (fecha && hora ? 3 : 2) : 1) : 0;
  const [paso, setPaso] = useState(primerPaso);

  const [dias, setDias] = useState<DiaApi[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const [semana, setSemana] = useState(0);

  const [estado, accion, enviando] = useActionState<EstadoReserva | null, FormData>(
    reservar,
    null,
  );

  const zonaPaso = useRef<HTMLDivElement>(null);
  const pasoPintado = useRef(paso);

  const servicioActual = servicios.find((s) => s.slug === servicio) ?? null;
  const barberosPosibles = useMemo(
    () => (servicio ? barberos.filter((b) => b.servicios.includes(servicio)) : barberos),
    [barberos, servicio],
  );

  // Si el barbero elegido no hace el servicio elegido, se suelta solo.
  useEffect(() => {
    if (barbero && servicio && !barberosPosibles.some((b) => b.slug === barbero)) {
      setBarbero(null);
      setBarberoElegido(false);
    }
  }, [barbero, servicio, barberosPosibles]);

  const desde = sumarDias(hoyISO(), semana * 7);

  useEffect(() => {
    if (!servicio) return;
    let vivo = true;
    setCargando(true);
    setFallo(null);
    const parametros = new URLSearchParams({ servicio, desde, dias: "14" });
    if (barbero) parametros.set("barbero", barbero);

    fetch(`/api/huecos?${parametros}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { dias: DiaApi[] }) => {
        if (!vivo) return;
        setDias(d.dias);
      })
      .catch(() => {
        if (vivo) setFallo("No hemos podido leer la agenda. Vuelve a intentarlo.");
      })
      .finally(() => vivo && setCargando(false));

    return () => {
      vivo = false;
    };
  }, [servicio, barbero, desde]);

  // Al cambiar de paso se lleva el foco y la vista al bloque nuevo.
  // Se compara contra el paso ya pintado en vez de usar un «es la primera
  // vez»: en modo estricto React monta el efecto dos veces y esa bandera se
  // gastaba en la primera, con lo que la página arrancaba desplazada.
  useEffect(() => {
    if (pasoPintado.current === paso) return;
    pasoPintado.current = paso;
    zonaPaso.current?.focus({ preventScroll: true });
    zonaPaso.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [paso]);

  const diaActual = dias?.find((d) => d.fecha === fecha) ?? null;
  const huecosDelDia = diaActual?.huecos ?? [];

  // Si el hueco elegido deja de estar libre (otro lo ha cogido), se suelta.
  useEffect(() => {
    if (!hora || !diaActual) return;
    if (!diaActual.huecos.some((h) => h.hora === hora)) setHora(null);
  }, [hora, diaActual]);

  if (estado?.ok && estado.cita) {
    return <Resguardo codigo={estado.cita.codigo} token={estado.cita.token} />;
  }

  const listo = Boolean(servicio && fecha && hora);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <div>
        {/* La regla de progreso */}
        <ol className="mb-10 grid grid-cols-4 gap-px bg-acero-20">
          {PASOS.map((p, i) => {
            const hecho =
              (i === 0 && servicio) ||
              (i === 1 && barberoElegido) ||
              (i === 2 && fecha && hora) ||
              (i === 3 && estado?.ok);
            const puedeIr =
              i === 0 ||
              (i === 1 && servicio) ||
              (i === 2 && servicio && barberoElegido) ||
              (i === 3 && listo);
            return (
              <li key={p} className="bg-acero-05">
                <button
                  type="button"
                  disabled={!puedeIr}
                  onClick={() => setPaso(i)}
                  className={`flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                    paso === i ? "bg-tinta text-white" : "hover:bg-acero-10"
                  } ${!puedeIr ? "opacity-40" : ""}`}
                >
                  <span
                    className={`h-1 w-full ${
                      hecho ? "bg-bermellon" : paso === i ? "bg-white" : "bg-acero-20"
                    }`}
                  />
                  <span className="cota flex items-center gap-1.5">
                    {hecho && <IconoCheck className="h-3 w-3 text-bermellon" />}
                    <span className="truncate">{p}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div ref={zonaPaso} tabIndex={-1} className="outline-none">
          {paso === 0 && (
            <PasoServicio
              servicios={servicios}
              elegido={servicio}
              alElegir={(slug) => {
                setServicio(slug);
                setHora(null);
                setPaso(1);
              }}
            />
          )}

          {paso === 1 && (
            <PasoBarbero
              barberos={barberosPosibles}
              elegido={barbero}
              alElegir={(slug) => {
                setBarbero(slug);
                setBarberoElegido(true);
                setHora(null);
                setPaso(2);
              }}
            />
          )}

          {paso === 2 && (
            <PasoDiaYHora
              dias={dias}
              cargando={cargando}
              fallo={fallo}
              fecha={fecha}
              hora={hora}
              semana={semana}
              alCambiarSemana={setSemana}
              alElegirDia={(f) => {
                setFecha(f);
                setHora(null);
              }}
              alElegirHora={(h) => {
                setHora(h);
                setPaso(3);
              }}
              huecos={huecosDelDia}
            />
          )}

          {paso === 3 && (
            <PasoDatos
              accion={accion}
              enviando={enviando}
              estado={estado}
              servicio={servicio}
              barbero={barbero}
              fecha={fecha}
              hora={hora}
              listo={listo}
              aviso={aviso}
              alVolverAHoras={() => setPaso(2)}
            />
          )}
        </div>
      </div>

      <Ficha
        servicio={servicioActual}
        barbero={barberos.find((b) => b.slug === barbero) ?? null}
        barberoElegido={barberoElegido}
        fecha={fecha}
        hora={hora}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────── Paso 1 */

function PasoServicio({
  servicios,
  elegido,
  alElegir,
}: {
  servicios: ServicioUI[];
  elegido: string | null;
  alElegir: (slug: string) => void;
}) {
  const maxima = Math.max(...servicios.map((s) => s.duracionMin), 1);
  const categorias = [...new Set(servicios.map((s) => s.categoria))];

  return (
    <section>
      <h2 className="titular text-[clamp(1.9rem,5vw,2.8rem)]">¿Qué te hacemos?</h2>
      {categorias.map((cat) => (
        <div key={cat} className="mt-8 first:mt-6">
          {categorias.length > 1 && (
            <p className="cota border-b border-acero-20 pb-2 text-acero-50">{cat}</p>
          )}
          <ul>
            {servicios
              .filter((s) => s.categoria === cat)
              .map((s) => (
                <li key={s.slug} className="border-b border-acero-20">
                  <button
                    type="button"
                    onClick={() => alElegir(s.slug)}
                    aria-pressed={elegido === s.slug}
                    className={`group grid w-full grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-2.5 px-3 py-5 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_9rem_5.5rem] sm:gap-x-8 ${
                      elegido === s.slug ? "bg-tinta text-white" : "hover:bg-acero-10"
                    }`}
                  >
                    <div className="min-w-0">
                      <span
                        className={`titular block text-[1.3rem] sm:text-[1.55rem] ${elegido === s.slug ? "" : "group-hover:text-bermellon"}`}
                      >
                        {s.nombre}
                      </span>
                      {s.descripcion && (
                        <span
                          className={`mt-1 block max-w-[52ch] text-[0.9rem] leading-relaxed ${elegido === s.slug ? "text-acero-30" : "text-acero-50"}`}
                        >
                          {s.descripcion}
                        </span>
                      )}
                    </div>
                    <span className="col-start-1 row-start-2 flex items-center gap-2.5 sm:col-start-2 sm:row-start-1">
                      <span
                        aria-hidden="true"
                        className="h-2 bg-bermellon"
                        style={{
                          width: `${(s.duracionMin / maxima) * 100}%`,
                          minWidth: "1.25rem",
                        }}
                      />
                      <span
                        className={`medida whitespace-nowrap text-[0.75rem] ${elegido === s.slug ? "text-acero-30" : "text-acero-50"}`}
                      >
                        {duracion(s.duracionMin)}
                      </span>
                    </span>
                    <span className="medida col-start-2 row-start-1 text-right text-[1.2rem] font-medium sm:col-start-3">
                      {precio(s.precioCent)}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ─────────────────────────────────────────────────────── Paso 2 */

function PasoBarbero({
  barberos,
  elegido,
  alElegir,
}: {
  barberos: BarberoUI[];
  elegido: string | null;
  alElegir: (slug: string | null) => void;
}) {
  return (
    <section>
      <h2 className="titular text-[clamp(1.9rem,5vw,2.8rem)]">¿Con quién?</h2>
      <p className="mt-3 max-w-[54ch] text-[0.98rem] leading-relaxed text-acero-50">
        Si te da igual, elige la primera opción: te damos la hora más pronta que
        haya libre en cualquier sillón.
      </p>

      <button
        type="button"
        onClick={() => alElegir(null)}
        aria-pressed={elegido === null}
        className={`mt-7 flex w-full items-center justify-between gap-4 border-2 px-6 py-5 text-left transition-colors ${
          elegido === null
            ? "border-tinta bg-tinta text-white"
            : "border-acero-20 hover:border-tinta"
        }`}
      >
        <span>
          <span className="titular block text-[1.5rem]">El primero que esté libre</span>
          <span
            className={`mt-1 block text-[0.9rem] ${elegido === null ? "text-acero-30" : "text-acero-50"}`}
          >
            Más huecos donde elegir
          </span>
        </span>
        <IconoFlecha className="h-5 w-5 shrink-0" />
      </button>

      <div className="mt-4 grid gap-px bg-acero-20 sm:grid-cols-2">
        {barberos.map((b, i) => (
          <button
            key={b.slug}
            type="button"
            onClick={() => alElegir(b.slug)}
            aria-pressed={elegido === b.slug}
            className={`flex items-center gap-5 p-5 text-left transition-colors ${
              elegido === b.slug ? "bg-tinta text-white" : "bg-acero-05 hover:bg-acero-10"
            }`}
          >
            <DiagramaCabeza
              variante={((i % 3) + 1) as 1 | 2 | 3}
              color={b.color}
              conCotas={false}
              className="h-20 w-auto shrink-0"
            />
            <span className="min-w-0">
              <span className="titular block text-[1.4rem]">{b.nombre}</span>
              {b.puesto && (
                <span
                  className="cota mt-1 block truncate"
                  style={{ color: elegido === b.slug ? b.color : undefined }}
                >
                  <span className={elegido === b.slug ? "" : "text-acero-50"}>{b.puesto}</span>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────── Paso 3 */

function PasoDiaYHora({
  dias,
  cargando,
  fallo,
  fecha,
  hora,
  semana,
  alCambiarSemana,
  alElegirDia,
  alElegirHora,
  huecos,
}: {
  dias: DiaApi[] | null;
  cargando: boolean;
  fallo: string | null;
  fecha: string | null;
  hora: string | null;
  semana: number;
  alCambiarSemana: (n: number) => void;
  alElegirDia: (f: string) => void;
  alElegirHora: (h: string) => void;
  huecos: { hora: string; barberos: string[] }[];
}) {
  const catorce = dias ?? [];
  const maximo = Math.max(...catorce.map((d) => d.huecos.length), 1);

  const manana = huecos.filter((h) => Number(h.hora.slice(0, 2)) < 14);
  const tarde = huecos.filter((h) => Number(h.hora.slice(0, 2)) >= 14);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="titular text-[clamp(1.9rem,5vw,2.8rem)]">¿Cuándo?</h2>
        <div className="flex items-center gap-px bg-acero-20">
          <button
            type="button"
            disabled={semana === 0}
            onClick={() => alCambiarSemana(Math.max(0, semana - 1))}
            className="cota bg-acero-05 px-4 py-2.5 transition-colors hover:bg-acero-10 disabled:opacity-35 disabled:hover:bg-acero-05"
          >
            Antes
          </button>
          <button
            type="button"
            onClick={() => alCambiarSemana(semana + 1)}
            className="cota bg-acero-05 px-4 py-2.5 transition-colors hover:bg-acero-10"
          >
            Después
          </button>
        </div>
      </div>

      {fallo && (
        <p className="mt-6 border-t-2 border-bermellon bg-bermellon-humo px-4 py-3 text-[0.95rem] text-tinta">
          {fallo}
        </p>
      )}

      {/* Los días, con la carga del día dibujada a escala */}
      <div className="mt-7 overflow-x-auto pb-2">
        <ul className="flex min-w-max gap-px bg-acero-20">
          {(cargando && !dias ? Array.from({ length: 14 }) : catorce).map((d, i) => {
            const dia = d as DiaApi | undefined;
            if (!dia) {
              return (
                <li key={i} className="w-[4.6rem] shrink-0 animate-pulse bg-acero-10 p-3">
                  <span className="block h-16" />
                </li>
              );
            }
            const libre = dia.huecos.length;
            const activo = dia.fecha === fecha;
            return (
              <li key={dia.fecha} className="shrink-0">
                <button
                  type="button"
                  disabled={libre === 0}
                  onClick={() => alElegirDia(dia.fecha)}
                  aria-pressed={activo}
                  className={`flex w-[4.6rem] flex-col items-center gap-1.5 px-2 py-3 transition-colors ${
                    activo
                      ? "bg-tinta text-white"
                      : libre === 0
                        ? "cursor-not-allowed bg-acero-10 text-acero-30"
                        : "bg-acero-05 hover:bg-acero-10"
                  }`}
                >
                  <span className="cota">{nombreDia(dia.fecha).slice(0, 3)}</span>
                  <span className="medida text-[1.15rem] font-medium leading-none">
                    {fechaCorta(dia.fecha).split(" ")[0]}
                  </span>
                  <span className="cota opacity-70">{fechaCorta(dia.fecha).split(" ")[1]}</span>
                  <span
                    aria-hidden="true"
                    className={`mt-1 h-1.5 w-full ${activo ? "bg-white" : libre === 0 ? "bg-acero-20" : "bg-bermellon"}`}
                    style={{ opacity: libre === 0 ? 1 : 0.35 + (libre / maximo) * 0.65 }}
                  />
                  <span className="cota text-[0.62rem] opacity-70">
                    {libre === 0 ? "cerrado" : `${libre} h.`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Las horas */}
      {!fecha ? (
        <p className="mt-8 border border-dashed border-acero-20 px-5 py-8 text-center text-[0.95rem] text-acero-50">
          Elige primero un día y aquí salen las horas libres.
        </p>
      ) : huecos.length === 0 ? (
        <p className="mt-8 border border-dashed border-acero-20 px-5 py-8 text-center text-[0.95rem] text-acero-50">
          {cargando ? "Leyendo la agenda…" : "Ese día se ha llenado. Prueba con otro."}
        </p>
      ) : (
        <div className="mt-8">
          <p className="cota text-acero-50">{fechaLarga(fecha)}</p>
          {[
            ["Mañana", manana],
            ["Tarde", tarde],
          ]
            .filter(([, lista]) => (lista as typeof huecos).length > 0)
            .map(([titulo, lista]) => (
              <div key={titulo as string} className="mt-6">
                <p className="cota text-bermellon">{titulo as string}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(lista as typeof huecos).map((h) => (
                    <li key={h.hora}>
                      <button
                        type="button"
                        onClick={() => alElegirHora(h.hora)}
                        aria-pressed={hora === h.hora}
                        className={`medida min-w-[4.6rem] px-4 py-3 text-[0.95rem] font-medium transition-colors ${
                          hora === h.hora
                            ? "bg-bermellon text-white"
                            : "bg-acero-10 hover:bg-tinta hover:text-white"
                        }`}
                      >
                        {h.hora}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────── Paso 4 */

function PasoDatos({
  accion,
  enviando,
  estado,
  servicio,
  barbero,
  fecha,
  hora,
  listo,
  aviso,
  alVolverAHoras,
}: {
  accion: (datos: FormData) => void;
  enviando: boolean;
  estado: EstadoReserva | null;
  servicio: string | null;
  barbero: string | null;
  fecha: string | null;
  hora: string | null;
  listo: boolean;
  aviso: string;
  alVolverAHoras: () => void;
}) {
  const v = estado?.valores ?? {};

  return (
    <section>
      <h2 className="titular text-[clamp(1.9rem,5vw,2.8rem)]">Tus datos</h2>
      <p className="mt-3 max-w-[54ch] text-[0.98rem] leading-relaxed text-acero-50">
        Con el nombre y el teléfono basta. El correo es opcional: solo sirve para
        mandarte el resguardo y que puedas anular tú mismo.
      </p>

      {aviso && (
        <p className="mt-6 bg-acero-10 px-4 py-3 text-[0.95rem] leading-relaxed text-tinta">
          {aviso}
        </p>
      )}

      {estado && !estado.ok && estado.motivo && (
        <div
          role="alert"
          className="mt-6 border-2 border-bermellon bg-bermellon-humo px-5 py-4"
        >
          <p className="titular text-[1.15rem] text-bermellon-hondo">
            {estado.codigo === "OCUPADO" ? "Ese hueco ya no está" : "No hemos podido reservar"}
          </p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-tinta">{estado.motivo}</p>
          {estado.codigo === "OCUPADO" && (
            <button
              type="button"
              onClick={alVolverAHoras}
              className="cota mt-3 inline-flex items-center gap-2 border-b border-bermellon pb-0.5 text-bermellon"
            >
              Elegir otra hora
              <IconoFlecha className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <form action={accion} className="mt-8">
        <input type="hidden" name="servicio" value={servicio ?? ""} />
        <input type="hidden" name="barbero" value={barbero ?? ""} />
        <input type="hidden" name="fecha" value={fecha ?? ""} />
        <input type="hidden" name="hora" value={hora ?? ""} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            nombre="nombre"
            etiqueta="Nombre"
            requerido
            autoComplete="given-name"
            defecto={v.nombre}
          />
          <Campo
            nombre="telefono"
            etiqueta="Teléfono"
            tipo="tel"
            requerido
            autoComplete="tel"
            inputMode="tel"
            defecto={v.telefono}
          />
          <div className="sm:col-span-2">
            <Campo
              nombre="email"
              etiqueta="Email (opcional)"
              tipo="email"
              autoComplete="email"
              inputMode="email"
              defecto={v.email}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="notas" className="cota block text-acero-50">
              Alguna cosa que debamos saber (opcional)
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              maxLength={500}
              defaultValue={v.notas}
              placeholder="Por ejemplo: laterales del 2, arriba con tijera."
              className="mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] text-tinta transition-colors placeholder:text-acero-30 focus:border-tinta focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!listo || enviando}
          className="group mt-8 inline-flex w-full items-center justify-center gap-3 bg-bermellon px-8 py-5 text-white transition-colors hover:bg-tinta disabled:cursor-not-allowed disabled:bg-acero-20 disabled:text-acero-50 sm:w-auto"
        >
          <span className="titular text-xl">
            {enviando ? "Cogiendo la hora…" : "Confirmar la cita"}
          </span>
          {!enviando && (
            <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>

        <p className="mt-5 max-w-[60ch] text-[0.82rem] leading-relaxed text-acero-50">
          Al confirmar aceptas que guardemos estos datos para gestionar tu cita.
          Puedes anularla cuando quieras.{" "}
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-tinta">
            Cómo tratamos tus datos
          </Link>
          .
        </p>
      </form>
    </section>
  );
}

function Campo({
  nombre,
  etiqueta,
  tipo = "text",
  requerido,
  defecto,
  ...resto
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  defecto?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={nombre} className="cota block text-acero-50">
        {etiqueta}
        {requerido && <span className="text-bermellon"> *</span>}
      </label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        required={requerido}
        defaultValue={defecto}
        maxLength={120}
        className="mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] text-tinta transition-colors placeholder:text-acero-30 focus:border-tinta focus:outline-none"
        {...resto}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────── La ficha lateral */

function Ficha({
  servicio,
  barbero,
  barberoElegido,
  fecha,
  hora,
}: {
  servicio: ServicioUI | null;
  barbero: BarberoUI | null;
  barberoElegido: boolean;
  fecha: string | null;
  hora: string | null;
}) {
  const lineas: [string, string | null][] = [
    ["Servicio", servicio?.nombre ?? null],
    ["Duración", servicio ? duracion(servicio.duracionMin) : null],
    ["Barbero", barbero ? barbero.nombre : barberoElegido ? "El primero libre" : null],
    ["Día", fecha ? fechaLarga(fecha) : null],
    ["Hora", hora],
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="sombra-carta border-2 border-tinta bg-acero-00">
        <p className="cota border-b-2 border-tinta px-5 py-3">Tu cita</p>
        <dl className="px-5 py-2">
          {lineas.map(([clave, valor]) => (
            <div
              key={clave}
              className="flex items-baseline justify-between gap-4 border-b border-acero-20 py-3 last:border-0"
            >
              <dt className="cota text-acero-50">{clave}</dt>
              <dd
                className={`text-right text-[0.95rem] ${valor ? "font-medium text-tinta" : "text-acero-30"}`}
              >
                {valor ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-tinta bg-tinta px-5 py-4 text-white">
          <span className="cota">Total</span>
          <span className="medida text-[1.5rem] font-medium">
            {servicio ? precio(servicio.precioCent) : "—"}
          </span>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2.5 text-[0.85rem] leading-relaxed text-acero-50">
        <IconoReloj className="mt-0.5 h-4 w-4 shrink-0 text-bermellon" />
        Se paga en el local. No hace falta tarjeta ni registrarse.
      </p>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-acero-50">
        ¿Prefieres llamar?{" "}
        <a
          href={`tel:${NEGOCIO.telefonoE164}`}
          className="medida underline underline-offset-2 hover:text-tinta"
        >
          {NEGOCIO.telefono}
        </a>
      </p>
    </aside>
  );
}

/* ───────────────────────────────────────────────── Confirmación */

function Resguardo({ codigo, token }: { codigo: string; token: string }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="sombra-alzada border-2 border-tinta bg-acero-00">
        <div className="campo-bermellon flex items-center gap-3 bg-bermellon px-6 py-4 text-white">
          <IconoCheck className="h-6 w-6" />
          <p className="titular text-[1.4rem]">Hora cogida</p>
        </div>
        <div className="px-6 py-7">
          <p className="cota text-acero-50">Tu referencia</p>
          <p className="medida mt-2 text-[2.4rem] font-bold leading-none tracking-tight">
            {codigo}
          </p>
          <p className="mt-5 text-[0.98rem] leading-relaxed text-tinta-60">
            Apúntala o haz una captura. Con ella te localizamos si llamas, y desde
            el enlace de abajo puedes ver o anular la cita cuando quieras.
          </p>
          <Link
            href={`/cita/${token}`}
            className="cota mt-6 inline-flex items-center gap-2 bg-tinta px-6 py-4 text-white transition-colors hover:bg-bermellon"
          >
            Ver mi cita
            <IconoFlecha className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <Link
        href="/"
        className="cota mt-6 inline-flex items-center gap-2 text-acero-50 transition-colors hover:text-tinta"
      >
        Volver a la portada
      </Link>
    </div>
  );
}
