import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { NEGOCIO, duracion, precio } from "@/datos/negocio";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { VideoExplicativo } from "@/componentes/VideoExplicativo";
import { ReglaDelDia } from "@/componentes/ReglaDelDia";
import { DiagramaCabeza } from "@/componentes/DiagramaCabeza";
import { Mapa } from "@/componentes/Mapa";
import { DatosEstructurados } from "@/componentes/DatosEstructurados";
import { IconoFlecha, IconoReloj, IconoSitio } from "@/componentes/Iconos";

export const dynamic = "force-dynamic";

const PEINES = [
  { n: "0", mm: "0,4 mm", texto: "Piel. El degradado arranca aquí." },
  { n: "1", mm: "3 mm", texto: "Nuca y patillas en un fade cerrado." },
  { n: "2", mm: "6 mm", texto: "El número más pedido para los laterales." },
  { n: "3", mm: "10 mm", texto: "Lateral suave, transición corta." },
  { n: "4", mm: "13 mm", texto: "Donde el degradado empieza a desaparecer." },
  { n: "6", mm: "19 mm", texto: "Arriba, para dejar caída sin peso." },
];

export default async function Portada() {
  const [servicios, barberos] = await Promise.all([
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: [{ destacado: "desc" }, { orden: "asc" }],
      take: 6,
    }),
    prisma.barbero.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      include: { horarios: { orderBy: [{ diaSemana: "asc" }, { inicioMin: "asc" }] } },
    }),
  ]);

  const duracionMaxima = Math.max(...servicios.map((s) => s.duracionMin), 1);

  return (
    <>
      <DatosEstructurados servicios={servicios} />
      <Cabecera />
      <main id="contenido" className="relative z-10">
        {/* ── La lámina: campo bermellón a sangre ─────────────────── */}
        <section className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-10 lg:pb-16 lg:pt-14">
            <div className="banda" style={{ ["--retardo" as string]: 0 }}>
              <h1 className="titular text-[clamp(2.9rem,12.8vw,9.5rem)] text-white">
                {NEGOCIO.nombre}
              </h1>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-white/30 pt-4">
                <p className="cota text-bermellon-papel">{NEGOCIO.ciudad}</p>
                <p className="max-w-xl text-[1.02rem] leading-relaxed text-bermellon-papel sm:text-[1.1rem]">
                  {NEGOCIO.reclamo}. Cita previa online: eliges servicio, barbero
                  y hora, y el sillón te está esperando.
                </p>
              </div>
            </div>

            <div className="banda mt-10 sm:mt-14" style={{ ["--retardo" as string]: 2 }}>
              <Suspense
                fallback={
                  <p className="cota text-bermellon-papel">Leyendo la agenda…</p>
                }
              >
                <ReglaDelDia />
              </Suspense>
            </div>

          </div>
        </section>

        {/* ── La carta, medida ────────────────────────────────────── */}
        <section className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-tinta pb-5">
            <h2 className="titular text-[clamp(2.4rem,7vw,4.5rem)]">La carta</h2>
            <p className="cota text-acero-50">Duración · Precio</p>
          </div>

          <ul>
            {servicios.map((s) => (
              <li key={s.id} className="border-b border-acero-20">
                <Link
                  href={`/reservar?servicio=${s.slug}`}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-3 py-6 transition-colors hover:bg-acero-10/60 sm:grid-cols-[minmax(0,1fr)_10rem_6rem] sm:gap-x-10"
                >
                  <div className="min-w-0">
                    <h3 className="titular text-[1.6rem] transition-colors group-hover:text-bermellon sm:text-[2rem]">
                      {s.nombre}
                    </h3>
                    {s.descripcion && (
                      <p className="mt-1.5 max-w-[52ch] text-[0.95rem] leading-relaxed text-acero-50">
                        {s.descripcion}
                      </p>
                    )}
                  </div>

                  {/* La duración, dibujada a escala */}
                  <div className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="h-2.5 bg-bermellon transition-[width] duration-500"
                        style={{ width: `${(s.duracionMin / duracionMaxima) * 100}%`, minWidth: "1.5rem" }}
                      />
                      <span className="medida whitespace-nowrap text-[0.8rem] text-acero-50">
                        {duracion(s.duracionMin)}
                      </span>
                    </div>
                  </div>

                  <p className="medida col-start-2 row-start-1 text-right text-[1.35rem] font-medium tabular-nums sm:col-start-3 sm:text-[1.5rem]">
                    {precio(s.precioCent)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/carta"
            className="cota mt-8 inline-flex items-center gap-2 text-bermellon transition-colors hover:text-tinta"
          >
            Ver la carta entera
            <IconoFlecha className="h-4 w-4" />
          </Link>
        </section>

        {/* ── La escala de peines: la prueba de que aquí se sabe cortar ── */}
        <section className="border-y-2 border-tinta bg-acero-10">
          <div className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-16">
              <div>
                <h2 className="titular text-[clamp(2.2rem,6vw,3.6rem)]">
                  Dinos un número
                </h2>
                <p className="mt-4 max-w-[46ch] text-[1rem] leading-relaxed text-acero-50">
                  Si sabes con qué peine te gusta el lateral, dilo al reservar y
                  te lo clavamos a la primera. Y si no lo sabes, esta es la
                  escala que usamos: es la misma lámina que tenemos colgada
                  junto al espejo.
                </p>
              </div>

              <ol className="grid gap-px bg-acero-20 sm:grid-cols-2">
                {PEINES.map((p) => (
                  <li
                    key={p.n}
                    className="flex items-start gap-5 bg-acero-05 px-5 py-6"
                  >
                    <span className="medida flex h-12 w-12 shrink-0 items-center justify-center bg-tinta text-[1.35rem] font-bold text-white">
                      {p.n}
                    </span>
                    <div className="min-w-0">
                      <p className="medida text-[0.85rem] text-bermellon">{p.mm}</p>
                      <p className="mt-1 text-[0.95rem] leading-relaxed text-tinta-60">
                        {p.texto}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── El equipo ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-[86rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-tinta pb-5">
            <h2 className="titular text-[clamp(2.4rem,7vw,4.5rem)]">El equipo</h2>
            <p className="cota text-acero-50">
              {barberos.length} {barberos.length === 1 ? "sillón" : "sillones"}
            </p>
          </div>

          <div className="grid gap-px bg-acero-20 sm:grid-cols-2 lg:grid-cols-3">
            {barberos.map((b, i) => (
              <article key={b.id} className="bg-acero-05 p-7">
                <DiagramaCabeza
                  variante={((i % 3) + 1) as 1 | 2 | 3}
                  color={b.color}
                  className="h-44 w-auto"
                />
                <h3 className="titular mt-6 text-[2rem]">{b.nombre}</h3>
                {b.puesto && (
                  <p className="cota mt-1.5" style={{ color: b.color }}>
                    {b.puesto}
                  </p>
                )}
                {b.bio && (
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-acero-50">
                    {b.bio}
                  </p>
                )}
                <Link
                  href={`/reservar?barbero=${b.slug}`}
                  className="cota mt-5 inline-flex items-center gap-2 border-b border-tinta pb-1 transition-colors hover:border-bermellon hover:text-bermellon"
                >
                  Reservar con {b.nombre}
                  <IconoFlecha className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── El local ────────────────────────────────────────────── */}
        <section className="campo-tinta bg-tinta text-acero-05">
          <div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-10">
            <div>
              <h2 className="titular text-[clamp(2.4rem,7vw,4.5rem)] text-acero-00">
                El local
              </h2>
              <p className="mt-5 max-w-[50ch] text-[1.02rem] leading-relaxed text-acero-30">
                Estamos en {NEGOCIO.ciudad}. Se entra con cita, así que no hay
                cola ni espera de pie: llegas, te sientas y empezamos.
              </p>

              <dl className="mt-10">
                <div className="flex gap-4 border-t border-tinta-60 py-5">
                  <IconoSitio className="mt-0.5 h-5 w-5 shrink-0 text-bermellon-vivo" />
                  <div>
                    <dt className="cota text-acero-30">
                      {NEGOCIO.direccion ? "Dirección" : "Dónde atendemos"}
                    </dt>
                    <dd className="mt-1.5 text-[1rem] text-acero-00">
                      {NEGOCIO.direccion && (
                        <>
                          {NEGOCIO.direccion}
                          <br />
                        </>
                      )}
                      {NEGOCIO.codigoPostal} {NEGOCIO.ciudad} · {NEGOCIO.provincia}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-tinta-60 py-5">
                  <IconoReloj className="mt-0.5 h-5 w-5 shrink-0 text-bermellon-vivo" />
                  <div className="min-w-0 flex-1">
                    <dt className="cota text-acero-30">Horario</dt>
                    <dd className="mt-2">
                      {NEGOCIO.horarioTexto.map((h) => (
                        <span
                          key={h.dias}
                          className="flex items-baseline justify-between gap-6 border-b border-tinta-80 py-2 last:border-0"
                        >
                          <span className="text-acero-30">{h.dias}</span>
                          <span className="medida text-acero-00">{h.horas}</span>
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <Mapa className="min-h-[20rem] lg:min-h-full" />
          </div>
        </section>

        {/* ── Cierre ──────────────────────────────────────────────── */}
        <section className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto flex max-w-[86rem] flex-col items-start gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <h2 className="titular max-w-[16ch] text-[clamp(2.4rem,8vw,5.5rem)] text-white">
              Coge hora y ya está
            </h2>
            <Link
              href="/reservar"
              className="group inline-flex shrink-0 items-center gap-3 bg-white px-8 py-4 text-tinta transition-colors hover:bg-tinta hover:text-white"
            >
              <span className="titular text-xl">Ver huecos libres</span>
              <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
      <PieDePagina />
      {/* Solo aquí: ni en /reservar, que cortaría una reserva a medias, ni en
          /para-barberias, que es la única indexada y un diálogo encima cuenta
          como intersticial intrusivo para Google. */}
      <VideoExplicativo />
    </>
  );
}
