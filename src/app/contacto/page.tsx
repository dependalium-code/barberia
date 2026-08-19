import type { Metadata } from "next";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { Mapa } from "@/componentes/Mapa";
import { FormularioContacto } from "./Formulario";
import { IconoSitio, IconoTelefono, IconoWhatsapp, IconoReloj } from "@/componentes/Iconos";
import { NEGOCIO } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Dónde estamos, a qué horas abrimos y cómo llegar. ${NEGOCIO.ciudad}, ${NEGOCIO.provincia}.`,
};

export default function PaginaContacto() {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.6rem,10vw,6rem)] text-white">Contacto</h1>
            <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
              Para coger hora no hace falta escribir: se reserva en la web en un
              minuto. Esto es para todo lo demás.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:px-10">
          <FormularioContacto />

          <aside>
            <dl>
              <Dato icono={<IconoSitio className="h-5 w-5" />} clave="Dónde">
                {NEGOCIO.direccion}
                <br />
                {NEGOCIO.codigoPostal} {NEGOCIO.ciudad} · {NEGOCIO.provincia}
              </Dato>

              <Dato icono={<IconoTelefono className="h-5 w-5" />} clave="Teléfono">
                <a href={`tel:${NEGOCIO.telefonoE164}`} className="medida hover:text-bermellon">
                  {NEGOCIO.telefono}
                </a>
              </Dato>

              <Dato icono={<IconoWhatsapp className="h-5 w-5" />} clave="WhatsApp">
                <a
                  href={`https://wa.me/${NEGOCIO.whatsapp.replace(/\D/g, "")}`}
                  className="hover:text-bermellon"
                >
                  Escribir por WhatsApp
                </a>
              </Dato>

              <Dato icono={<IconoReloj className="h-5 w-5" />} clave="Horario">
                {NEGOCIO.horarioTexto.map((h) => (
                  <span
                    key={h.dias}
                    className="flex items-baseline justify-between gap-5 border-b border-acero-20 py-1.5 last:border-0"
                  >
                    <span>{h.dias}</span>
                    <span className="medida text-[0.9rem]">{h.horas}</span>
                  </span>
                ))}
              </Dato>
            </dl>

            <a
              href={`mailto:${NEGOCIO.email}`}
              className="mt-6 block break-all text-[0.95rem] text-bermellon hover:text-tinta"
            >
              {NEGOCIO.email}
            </a>

            <div className="mt-8">
              <Mapa className="min-h-[16rem] border-acero-20" />
            </div>
          </aside>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}

function Dato({
  icono,
  clave,
  children,
}: {
  icono: React.ReactNode;
  clave: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-t-2 border-tinta py-5 first:border-t-0 first:pt-0">
      <span className="mt-0.5 shrink-0 text-bermellon">{icono}</span>
      <div className="min-w-0 flex-1">
        <dt className="cota text-acero-50">{clave}</dt>
        <dd className="mt-1.5 text-[1rem] leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}
