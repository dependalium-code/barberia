import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { Mapa } from "@/componentes/Mapa";
import { IconoFlecha, IconoReloj, IconoSitio, IconoTelefono } from "@/componentes/Iconos";
import { NEGOCIO } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "El local",
  description: `Dónde estamos, a qué hora abrimos y cómo funciona la visita. ${NEGOCIO.ciudad}, ${NEGOCIO.provincia}.`,
};

const COMO_VA = [
  {
    titulo: "Se entra con hora",
    texto:
      "No hay lista de espera ni turnos de pie. Coges tu hora en la web y el sillón está reservado a tu nombre a esa hora exacta.",
  },
  {
    titulo: "Ven cinco minutos antes",
    texto:
      "Con eso basta. Si llegas más de diez minutos tarde puede que haya que acortar el servicio, porque detrás hay otra cita.",
  },
  {
    titulo: "Si no puedes venir, anúlala",
    texto:
      "Desde el enlace del correo o llamando. Un hueco liberado es alguien que sí puede venir; una ausencia sin avisar es un sillón parado.",
  },
  {
    titulo: "Se paga al terminar",
    texto:
      "En efectivo o con tarjeta, en el local. Reservar no cuesta nada y no se pide tarjeta por adelantado.",
  },
];

export default function PaginaLocal() {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.6rem,10vw,6rem)] text-white">El local</h1>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
              Barbería de barrio en {NEGOCIO.ciudad}, con cita previa y sin
              esperas de pie.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
            <div>
              <h2 className="titular border-b-2 border-tinta pb-4 text-[clamp(1.8rem,5vw,2.6rem)]">
                Cómo funciona la visita
              </h2>
              <dl>
                {COMO_VA.map((c) => (
                  <div
                    key={c.titulo}
                    className="grid gap-x-8 gap-y-1.5 border-b border-acero-20 py-6 sm:grid-cols-[14rem_minmax(0,1fr)]"
                  >
                    <dt className="titular text-[1.35rem]">{c.titulo}</dt>
                    <dd className="max-w-[56ch] text-[0.98rem] leading-relaxed text-acero-50">
                      {c.texto}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-12 border-t-2 border-tinta pt-8">
                <h2 className="titular text-[clamp(1.6rem,4vw,2.2rem)]">
                  ¿Vienes por primera vez?
                </h2>
                <p className="mt-3 max-w-[58ch] text-[1rem] leading-relaxed text-acero-50">
                  Coge un corte a secas la primera vez y cuéntanos cómo lo llevas
                  normalmente. Si sabes el número de peine que usas en los
                  laterales, dilo al reservar en la casilla de la nota y vamos
                  directos.
                </p>
                <Link
                  href="/reservar"
                  className="group mt-6 inline-flex items-center gap-3 bg-bermellon px-8 py-4 text-white transition-colors hover:bg-tinta"
                >
                  <span className="titular text-lg">Coger hora</span>
                  <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <aside>
              <dl className="border-2 border-tinta bg-acero-00">
                <div className="flex gap-4 border-b border-acero-20 px-5 py-5">
                  <IconoSitio className="mt-0.5 h-5 w-5 shrink-0 text-bermellon" />
                  <div>
                    <dt className="cota text-acero-50">Dónde</dt>
                    <dd className="mt-1.5 text-[1rem] leading-relaxed">
                      {NEGOCIO.direccion}
                      <br />
                      {NEGOCIO.codigoPostal} {NEGOCIO.ciudad} · {NEGOCIO.provincia}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4 border-b border-acero-20 px-5 py-5">
                  <IconoReloj className="mt-0.5 h-5 w-5 shrink-0 text-bermellon" />
                  <div className="min-w-0 flex-1">
                    <dt className="cota text-acero-50">Horario</dt>
                    <dd className="mt-2">
                      {NEGOCIO.horarioTexto.map((h) => (
                        <span
                          key={h.dias}
                          className="flex items-baseline justify-between gap-5 border-b border-acero-20 py-2 last:border-0"
                        >
                          <span className="text-[0.95rem]">{h.dias}</span>
                          <span className="medida text-[0.9rem]">{h.horas}</span>
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-4 px-5 py-5">
                  <IconoTelefono className="mt-0.5 h-5 w-5 shrink-0 text-bermellon" />
                  <div>
                    <dt className="cota text-acero-50">Teléfono</dt>
                    <dd className="mt-1.5">
                      <a
                        href={`tel:${NEGOCIO.telefonoE164}`}
                        className="medida text-[1.05rem] hover:text-bermellon"
                      >
                        {NEGOCIO.telefono}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-6">
                <Mapa className="min-h-[18rem] border-acero-20" />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
