import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { IconoCheck, IconoFlecha, IconoTelefono, IconoWhatsapp } from "@/componentes/Iconos";
import { AGENCIA, DEMO, duracion, precio } from "@/datos/negocio";
import { FormularioBarberia } from "./Formulario";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Web con reservas para tu barbería",
  description:
    "La web que estás viendo, con su agenda y su panel, instalada con tus servicios, tus precios y tu equipo. Reservas propias, sin comisión por cita.",
  // Pisa el `noindex` que el layout pone en modo demostración: la barbería de
  // ejemplo no se indexa, pero esta página es la que tiene que encontrarse.
  robots: { index: true, follow: true },
};

export default async function ParaBarberias() {
  // Esta página es de la agencia, no de la barbería: cuando la web se instala
  // en un negocio real (DEMO = false) deja de existir.
  if (!DEMO) notFound();

  const [servicios, barberos, citas] = await Promise.all([
    prisma.servicio.count({ where: { activo: true } }),
    prisma.barbero.count({ where: { activo: true } }),
    prisma.servicio.findMany({
      where: { activo: true, destacado: true },
      orderBy: { orden: "asc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        {/* Campo tinta: se nota al instante que esto es la trastienda, no la barbería */}
        <section className="campo-tinta bg-tinta text-acero-05">
          <div className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
            <h1 className="titular max-w-[16ch] text-[clamp(2.4rem,8vw,6rem)] text-acero-00">
              Esta web, con tu barbería dentro
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-relaxed text-acero-30">
              Lo que acabas de trastear no es un vídeo ni una imagen: es la web
              funcionando. La agenda que has visto lee huecos de verdad y la
              reserva que hagas se guarda de verdad. Se instala con tus
              servicios, tus precios, tu equipo y tu horario.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#hablamos"
                className="group inline-flex items-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-white hover:text-tinta"
              >
                <span className="titular text-xl">Quiero verla</span>
                <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              {AGENCIA.precioMensual && (
                <a
                  href="#precio"
                  className="cota inline-flex items-center gap-2 border-2 border-white/30 px-6 py-4 text-acero-00 transition-colors hover:border-white"
                >
                  Desde {AGENCIA.precioMensual} al mes
                </a>
              )}
              <a
                href={`tel:${AGENCIA.telefonoE164}`}
                className="cota inline-flex items-center gap-2 border-2 border-white/30 px-6 py-4 text-acero-00 transition-colors hover:border-white"
              >
                <IconoTelefono className="h-4 w-4" />
                {AGENCIA.telefono}
              </a>
            </div>
          </div>
        </section>

        {/* Pruébalo tú mismo: la demostración ES el argumento */}
        <section className="border-b-2 border-tinta bg-acero-10">
          <div className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
            <h2 className="titular text-[clamp(1.9rem,5vw,3rem)]">Pruébalo antes de creerme</h2>
            <p className="mt-4 max-w-[56ch] text-[1rem] leading-relaxed text-acero-50">
              No hace falta que te fíes. Coge hora en la barbería de ejemplo y
              mira qué pasa: verás los huecos reales que quedan, elegirás
              barbero, y al confirmar te saldrá tu resguardo con un enlace para
              anularla tú mismo.
            </p>

            <ol className="mt-8 grid gap-px bg-acero-20 sm:grid-cols-3">
              {[
                ["Elige y reserva", "Servicio, barbero, día y hora. Cuatro toques, sin registrarse."],
                ["Mira el resguardo", "Con su referencia y su enlace privado para anular."],
                ["Anúlala", "Y el hueco vuelve a aparecer libre al momento."],
              ].map(([titulo, texto]) => (
                <li key={titulo} className="bg-acero-05 px-6 py-7">
                  <h3 className="titular text-[1.3rem]">{titulo}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-acero-50">{texto}</p>
                </li>
              ))}
            </ol>

            <Link
              href="/reservar"
              className="group mt-8 inline-flex items-center gap-3 bg-tinta px-8 py-4 text-white transition-colors hover:bg-bermellon"
            >
              <span className="titular text-lg">Probar la reserva</span>
              <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="medida mt-6 text-[0.85rem] text-acero-50">
              Ahora mismo la demostración lleva {servicios} servicios y {barberos}{" "}
              barberos con su horario. Por ejemplo:{" "}
              {citas
                .map((s) => `${s.nombre} · ${duracion(s.duracionMin)} · ${precio(s.precioCent)}`)
                .join(" / ")}
            </p>
          </div>
        </section>

        {/* Qué lleva */}
        <section className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <h2 className="titular border-b-2 border-tinta pb-4 text-[clamp(1.9rem,5vw,3rem)]">
            Qué lleva dentro
          </h2>
          <dl>
            {AGENCIA.incluye.map((x) => (
              <div
                key={x.titulo}
                className="grid gap-x-10 gap-y-2 border-b border-acero-20 py-7 sm:grid-cols-[17rem_minmax(0,1fr)]"
              >
                <dt className="titular text-[1.3rem] leading-[1.1]">{x.titulo}</dt>
                <dd className="max-w-[60ch] text-[1rem] leading-relaxed text-acero-50">
                  {x.texto}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Precio: solo si el titular lo ha puesto. Nada inventado. */}
        {AGENCIA.precioAlta && AGENCIA.precioMensual && (
          <section id="precio" className="scroll-mt-20 border-y-2 border-tinta bg-acero-10">
            <div className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
              <h2 className="titular text-[clamp(1.9rem,5vw,3rem)]">Cuánto cuesta</h2>
              <p className="mt-4 max-w-[56ch] text-[1rem] leading-relaxed text-acero-50">
                Un alta para montarla con lo tuyo y una cuota que cubre el
                funcionamiento. Sin comisión por cita y sin límite de reservas:
                si un mes trabajas el doble, pagas lo mismo.
              </p>

              <div className="mt-9 grid gap-px bg-acero-20 sm:grid-cols-2">
                <div className="bg-acero-05 px-6 py-8 sm:px-8">
                  <p className="cota text-acero-50">Alta, una sola vez</p>
                  <p className="titular mt-3 text-[clamp(2.6rem,8vw,4rem)] leading-none">
                    {AGENCIA.precioAlta}
                  </p>
                  <ul className="mt-6 grid gap-2.5">
                    {AGENCIA.cubreElAlta.map((x) => (
                      <li key={x} className="flex gap-3 text-[0.95rem] leading-relaxed text-tinta-60">
                        <IconoCheck className="mt-0.5 h-4 w-4 shrink-0 text-bermellon" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="campo-tinta bg-tinta px-6 py-8 text-acero-05 sm:px-8">
                  <p className="cota text-acero-30">Después, cada mes</p>
                  <p className="titular mt-3 text-[clamp(2.6rem,8vw,4rem)] leading-none text-acero-00">
                    {AGENCIA.precioMensual}
                    <span className="titular ml-2 text-[1.1rem] text-acero-30">/mes</span>
                  </p>
                  <ul className="mt-6 grid gap-2.5">
                    {AGENCIA.cubreLaCuota.map((x) => (
                      <li key={x} className="flex gap-3 text-[0.95rem] leading-relaxed text-acero-30">
                        <IconoCheck className="mt-0.5 h-4 w-4 shrink-0 text-bermellon-vivo" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* La permanencia se dice aquí y con el mismo cuerpo que el resto:
                  esconderla en las condiciones es lo que hace que la gente se
                  sienta engañada al tercer mes. */}
              <p className="mt-6 max-w-[70ch] text-[0.92rem] leading-relaxed text-acero-50">
                Precios sin IVA. Permanencia mínima de {AGENCIA.permanenciaMeses}{" "}
                meses; a partir de ahí se puede dejar cuando quieras avisando con
                un mes. La web se queda con nosotros: lo que se contrata es
                tenerla funcionando, no comprarla.
              </p>

              <a
                href="#hablamos"
                className="group mt-8 inline-flex items-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-tinta"
              >
                <span className="titular text-lg">Quiero verla</span>
                <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </section>
        )}

        {/* Formulario */}
        <section id="hablamos" className="campo-tinta scroll-mt-20 bg-tinta text-acero-05">
          <div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-16 lg:px-10">
            <div>
              <h2 className="titular text-[clamp(1.9rem,5vw,3rem)] text-acero-00">
                Cuéntanos de tu barbería
              </h2>
              <p className="mt-4 max-w-[52ch] text-[1rem] leading-relaxed text-acero-30">
                {AGENCIA.precioMensual
                  ? "Te la enseñamos con calma, te contamos cómo quedaría con lo tuyo dentro y respondemos lo que quieras. Sin compromiso y sin prisa."
                  : "Te la enseñamos con calma, respondemos lo que quieras y te pasamos presupuesto. Sin compromiso y sin prisa."}
              </p>

              <div className="mt-8 grid gap-3">
                <a
                  href={`tel:${AGENCIA.telefonoE164}`}
                  className="flex items-center gap-3 text-[1.05rem] text-acero-00 transition-colors hover:text-bermellon-vivo"
                >
                  <IconoTelefono className="h-5 w-5 text-bermellon-vivo" />
                  <span className="medida">{AGENCIA.telefono}</span>
                </a>
                <a
                  href={`https://wa.me/${AGENCIA.whatsapp.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-[1.05rem] text-acero-00 transition-colors hover:text-bermellon-vivo"
                >
                  <IconoWhatsapp className="h-5 w-5 text-bermellon-vivo" />
                  WhatsApp
                </a>
                <a
                  href={`mailto:${AGENCIA.email}`}
                  className="flex items-center gap-3 break-all text-[1.05rem] text-acero-00 transition-colors hover:text-bermellon-vivo"
                >
                  <span className="h-5 w-5 shrink-0" />
                  {AGENCIA.email}
                </a>
              </div>

              <p className="mt-10 max-w-[52ch] text-[0.85rem] leading-relaxed text-acero-30">
                Detrás de esto está{" "}
                <a
                  href={AGENCIA.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-acero-00"
                >
                  {AGENCIA.nombre}
                </a>
                , estudio de diseño web en Mataró. La web de ejemplo que estás
                viendo la hicimos nosotros, y es la misma que instalamos.
              </p>
            </div>

            <FormularioBarberia />
          </div>
        </section>
      </main>
      <PieDePagina />
    </>
  );
}
