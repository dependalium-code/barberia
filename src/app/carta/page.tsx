import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { IconoFlecha } from "@/componentes/Iconos";
import { NEGOCIO, duracion, precio } from "@/datos/negocio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La carta",
  description:
    "Corte, degradado, barba, afeitado a navaja y color. Precio y duración de cada servicio, sin sorpresas al pagar.",
};

export default async function PaginaCarta() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  const categorias = [...new Set(servicios.map((s) => s.categoria))];
  const maxima = Math.max(...servicios.map((s) => s.duracionMin), 1);

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.6rem,10vw,6rem)] text-white">La carta</h1>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
              El precio que ves es el que pagas. La barra de al lado dice cuánto
              ocupa cada servicio en el sillón, que es lo que de verdad marca la
              hora que te podemos dar.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          {categorias.map((cat) => (
            <section key={cat} className="mt-14 first:mt-0">
              <h2 className="titular border-b-2 border-tinta pb-4 text-[clamp(1.8rem,5vw,2.6rem)]">
                {cat}
              </h2>
              <ul>
                {servicios
                  .filter((s) => s.categoria === cat)
                  .map((s) => (
                    <li key={s.id} className="border-b border-acero-20">
                      <Link
                        href={`/reservar?servicio=${s.slug}`}
                        className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-3 py-6 transition-colors hover:bg-acero-10/60 sm:grid-cols-[minmax(0,1fr)_10rem_6rem] sm:gap-x-10"
                      >
                        <div className="min-w-0">
                          <h3 className="titular text-[1.5rem] transition-colors group-hover:text-bermellon sm:text-[1.9rem]">
                            {s.nombre}
                          </h3>
                          {s.descripcion && (
                            <p className="mt-1.5 max-w-[56ch] text-[0.95rem] leading-relaxed text-acero-50">
                              {s.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="col-start-1 row-start-2 flex items-center gap-3 sm:col-start-2 sm:row-start-1">
                          <span
                            aria-hidden="true"
                            className="h-2.5 bg-bermellon"
                            style={{
                              width: `${(s.duracionMin / maxima) * 100}%`,
                              minWidth: "1.5rem",
                            }}
                          />
                          <span className="medida whitespace-nowrap text-[0.8rem] text-acero-50">
                            {duracion(s.duracionMin)}
                          </span>
                        </div>
                        <p className="medida col-start-2 row-start-1 text-right text-[1.35rem] font-medium sm:col-start-3 sm:text-[1.5rem]">
                          {precio(s.precioCent)}
                        </p>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}

          <div className="mt-16 border-t-2 border-tinta pt-8">
            <p className="max-w-[60ch] text-[0.95rem] leading-relaxed text-acero-50">
              Se paga en el local, en efectivo o con tarjeta. Si no sabes qué
              pedir, ven con tiempo y lo miramos juntos: no cobramos por
              aconsejar.
            </p>
            <Link
              href="/reservar"
              className="group mt-6 inline-flex items-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-tinta"
            >
              <span className="titular text-xl">Coger hora</span>
              <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-[0.9rem] text-acero-50">
              O llámanos al{" "}
              <a href={`tel:${NEGOCIO.telefonoE164}`} className="medida underline underline-offset-2 hover:text-tinta">
                {NEGOCIO.telefono}
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
