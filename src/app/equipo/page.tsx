import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { DiagramaCabeza } from "@/componentes/DiagramaCabeza";
import { IconoFlecha } from "@/componentes/Iconos";
import { minutosAHora } from "@/lib/tiempo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "El equipo",
  description:
    "Quién te va a cortar. Cada barbero con lo que hace y los días que está en el sillón.",
};

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function PaginaEquipo() {
  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    include: {
      horarios: { orderBy: [{ diaSemana: "asc" }, { inicioMin: "asc" }] },
      servicios: { include: { servicio: { select: { nombre: true, activo: true } } } },
    },
  });

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.6rem,10vw,6rem)] text-white">El equipo</h1>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
              Puedes pedir barbero al reservar. Y si te da igual, mejor: te damos
              la hora más pronta que quede libre.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid gap-px bg-acero-20">
            {barberos.map((b, i) => {
              const porDia = new Map<number, string[]>();
              for (const h of b.horarios) {
                const lista = porDia.get(h.diaSemana) ?? [];
                lista.push(`${minutosAHora(h.inicioMin)}–${minutosAHora(h.finMin)}`);
                porDia.set(h.diaSemana, lista);
              }

              return (
                <article
                  key={b.id}
                  className="grid gap-8 bg-acero-05 p-7 sm:p-9 lg:grid-cols-[14rem_minmax(0,1fr)_16rem] lg:gap-12"
                >
                  <DiagramaCabeza
                    variante={((i % 3) + 1) as 1 | 2 | 3}
                    color={b.color}
                    className="h-52 w-auto"
                  />

                  <div className="min-w-0">
                    <h2 className="titular text-[clamp(2rem,6vw,3rem)]">{b.nombre}</h2>
                    {b.puesto && (
                      <p className="cota mt-2" style={{ color: b.color }}>
                        {b.puesto}
                      </p>
                    )}
                    {b.bio && (
                      <p className="mt-4 max-w-[58ch] text-[1rem] leading-relaxed text-acero-50">
                        {b.bio}
                      </p>
                    )}

                    <p className="cota mt-7 text-acero-50">Qué hace</p>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {b.servicios
                        .filter((s) => s.servicio.activo)
                        .map((s) => (
                          <li
                            key={s.servicioId}
                            className="cota border border-acero-20 px-2.5 py-1.5 text-tinta-60"
                          >
                            {s.servicio.nombre}
                          </li>
                        ))}
                    </ul>

                    <Link
                      href={`/reservar?barbero=${b.slug}`}
                      className="cota mt-7 inline-flex items-center gap-2 bg-tinta px-6 py-3.5 text-white transition-colors hover:bg-bermellon"
                    >
                      Reservar con {b.nombre}
                      <IconoFlecha className="h-4 w-4" />
                    </Link>
                  </div>

                  <div>
                    <p className="cota text-acero-50">Cuándo está</p>
                    <dl className="mt-2.5">
                      {DIAS.map((nombre, indice) => {
                        const tramos = porDia.get(indice + 1);
                        return (
                          <div
                            key={nombre}
                            className="flex items-baseline justify-between gap-4 border-b border-acero-20 py-2 last:border-0"
                          >
                            <dt
                              className={`text-[0.9rem] ${tramos ? "text-tinta" : "text-acero-30"}`}
                            >
                              {nombre}
                            </dt>
                            <dd
                              className={`medida text-right text-[0.85rem] ${tramos ? "text-tinta" : "text-acero-30"}`}
                            >
                              {tramos ? tramos.join(" · ") : "libra"}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
