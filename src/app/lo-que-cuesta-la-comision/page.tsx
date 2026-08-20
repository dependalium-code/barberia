import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { IconoFlecha } from "@/componentes/Iconos";
import { AGENCIA, DEMO } from "@/datos/negocio";
import { Calculadora } from "./Calculadora";

/** «299 €» → 299. Una sola fuente de verdad: los importes viven en AGENCIA. */
function cifra(texto: string): number {
  const n = Number(String(texto).replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export const metadata: Metadata = {
  title: "Lo que cuesta pagar comisión por cada cita",
  description:
    "Pon tus citas al mes y lo que pagas hoy, y mira lo que suma al cabo de un año. Sin cifras inventadas: los números los pones tú.",
  // Pisa el `noindex` del layout: esta página es de la agencia y sí se indexa.
  robots: { index: true, follow: true },
};

export default function LoQueCuestaLaComision() {
  // Igual que la página de venta: cuando la web se instala en una barbería de
  // verdad (DEMO = false), esto deja de existir.
  if (!DEMO) notFound();

  const alta = cifra(AGENCIA.precioAlta);
  const mensual = cifra(AGENCIA.precioMensual);
  const hayPrecio = alta > 0 && mensual > 0;

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <section className="campo-tinta bg-tinta text-acero-05">
          <div className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
            <p className="cota text-bermellon-vivo">Para barberías</p>
            <h1 className="titular mt-4 max-w-[17ch] text-[clamp(2.2rem,7vw,5rem)] text-acero-00">
              Lo que cuesta pagar por cada cita
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-relaxed text-acero-30">
              Una comisión del tres o del cuatro por ciento no suena a nada
              cuando la miras cita a cita. La gracia está en mirarla al final
              del año, cuando ya han pasado dos mil clientes por el sillón.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
            <div className="min-w-0">
              <h2 className="titular text-[clamp(1.8rem,5vw,2.8rem)]">
                No sé lo que pagas. Ponlo tú
              </h2>
              <div className="texto-legal mt-5 max-w-[62ch] text-[1rem] leading-relaxed text-tinta-60">
                <p>
                  En esta página no vas a encontrar lo que cobra tal o cual
                  aplicación. No lo sé, cambia cada temporada y según el plan, y
                  ponerlo aquí a ojo sería justo lo que critico. Así que la
                  cuenta la haces con tus cifras: las citas que haces al mes, lo
                  que cobras de media y lo que te descuentan hoy.
                </p>
                <p>
                  Lo único que pongo yo es <strong>lo que cuesta esta web</strong>,
                  que sí lo sé porque lo cobro yo: {AGENCIA.precioAlta} de alta y{" "}
                  {AGENCIA.precioMensual} al mes, sin IVA, con permanencia de{" "}
                  {AGENCIA.permanenciaMeses} meses. Sin comisión por cita y sin
                  límite de citas: da igual que hagas cien al mes o mil.
                </p>
              </div>

              <h2 className="titular mt-12 text-[clamp(1.6rem,4.5vw,2.2rem)]">
                Lo que esta cuenta no te dice
              </h2>
              <div className="texto-legal mt-4 max-w-[62ch] text-[1rem] leading-relaxed text-tinta-60">
                <p>
                  Sería tramposo enseñarte solo la resta, así que va lo otro:
                  <strong> un directorio te trae gente que no te conocía</strong>.
                  Alguien que busca barbería en tu barrio y aparece tu ficha. Tu
                  propia web no hace eso: la encuentra quien ya te busca a ti, o
                  quien llega desde tu Instagram o desde el cartel de la puerta.
                </p>
                <p>
                  Así que la pregunta de verdad no es cuánto pagas, sino{" "}
                  <strong>cuántos de tus clientes son tuyos ya</strong>. Si la
                  mayoría son de siempre y reservan por costumbre, estás pagando
                  una comisión por gente que iba a venir igual. Si de verdad te
                  llegan clientes nuevos cada semana por ahí, entonces esa
                  comisión es publicidad y quizá salga a cuenta.
                </p>
                <p>
                  Eso lo sabes tú mirando la agenda de este mes. Yo solo pongo la
                  calculadora.
                </p>
              </div>

              <div className="mt-10 border-t-2 border-tinta pt-7">
                <p className="titular text-[1.5rem]">¿Lo vemos con tu agenda delante?</p>
                <p className="mt-2 max-w-[54ch] text-[0.98rem] leading-relaxed text-tinta-60">
                  Te la enseño funcionando con el nombre de tu barbería, sin
                  compromiso y sin instalarte nada.
                </p>
                <Link
                  href="/para-barberias"
                  className="group mt-6 inline-flex items-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-tinta"
                >
                  <span className="titular text-lg">Ver la web por dentro</span>
                  <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              {hayPrecio ? (
                <Calculadora
                  alta={alta}
                  mensual={mensual}
                  meses={AGENCIA.permanenciaMeses}
                />
              ) : (
                <div className="border-2 border-tinta bg-acero-00 p-6">
                  <p className="titular text-[1.3rem]">Pídeme presupuesto</p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-tinta-60">
                    Dime cuántas citas haces al mes y te digo lo que cuesta.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
      <PieDePagina />
    </>
  );
}
