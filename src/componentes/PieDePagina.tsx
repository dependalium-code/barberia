import Link from "next/link";
import { AGENCIA, DEMO, NEGOCIO } from "@/datos/negocio";
import { IconoInstagram, IconoSitio, IconoTelefono, IconoWhatsapp } from "@/componentes/Iconos";

export function PieDePagina() {
  const anio = new Date().getFullYear();

  return (
    <footer className="campo-tinta relative z-10 bg-tinta text-acero-05">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 border-b border-tinta-60 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div>
            <p className="titular text-4xl text-acero-00 sm:text-5xl">
              {NEGOCIO.nombre}
            </p>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-acero-30">
              {NEGOCIO.descripcion}
            </p>
            <Link
              href="/reservar"
              className="cota mt-7 inline-flex items-center bg-bermellon px-6 py-3.5 text-white transition-colors hover:bg-bermellon-vivo"
            >
              Reservar hora
            </Link>
          </div>

          <div>
            <p className="cota text-acero-30">Dónde</p>
            <address className="mt-4 not-italic text-[0.95rem] leading-relaxed text-acero-05">
              <span className="flex items-start gap-2.5">
                <IconoSitio className="mt-0.5 h-4 w-4 text-bermellon-vivo" />
                <span>
                  {NEGOCIO.direccion && (
                    <>
                      {NEGOCIO.direccion}
                      <br />
                    </>
                  )}
                  {NEGOCIO.codigoPostal} {NEGOCIO.ciudad} · {NEGOCIO.provincia}
                </span>
              </span>
              <a
                href={`tel:${NEGOCIO.telefonoE164}`}
                className="mt-4 flex items-center gap-2.5 transition-colors hover:text-bermellon-vivo"
              >
                <IconoTelefono className="h-4 w-4 text-bermellon-vivo" />
                <span className="medida">{NEGOCIO.telefono}</span>
              </a>
              <a
                href={`https://wa.me/${NEGOCIO.whatsapp.replace(/\D/g, "")}`}
                className="mt-3 flex items-center gap-2.5 transition-colors hover:text-bermellon-vivo"
              >
                <IconoWhatsapp className="h-4 w-4 text-bermellon-vivo" />
                WhatsApp
              </a>
              {NEGOCIO.instagram && (
                <a
                  href={NEGOCIO.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2.5 transition-colors hover:text-bermellon-vivo"
                >
                  <IconoInstagram className="h-4 w-4 text-bermellon-vivo" />
                  Instagram
                </a>
              )}
              <a
                href={`mailto:${NEGOCIO.email}`}
                className="mt-3 block transition-colors hover:text-bermellon-vivo"
              >
                {NEGOCIO.email}
              </a>
            </address>
          </div>

          <div>
            <p className="cota text-acero-30">Horario</p>
            <dl className="mt-4 text-[0.95rem]">
              {NEGOCIO.horarioTexto.map((h) => (
                <div
                  key={h.dias}
                  className="flex items-baseline justify-between gap-4 border-b border-tinta-80 py-2.5 last:border-0"
                >
                  <dt className="text-acero-30">{h.dias}</dt>
                  <dd className="medida text-acero-05">{h.horas}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="cota text-acero-30">
            © {anio} {NEGOCIO.nombreLargo}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/aviso-legal" className="cota text-acero-30 transition-colors hover:text-acero-00">
              Aviso legal
            </Link>
            <Link href="/privacidad" className="cota text-acero-30 transition-colors hover:text-acero-00">
              Privacidad
            </Link>
            <Link href="/cookies" className="cota text-acero-30 transition-colors hover:text-acero-00">
              Cookies
            </Link>
            <Link href="/panel" className="cota text-acero-30 transition-colors hover:text-acero-00">
              Panel
            </Link>
          </nav>
        </div>

        {DEMO && (
          <p className="border-t border-tinta-80 py-5 text-[0.8rem] leading-relaxed text-acero-30">
            Demostración de {AGENCIA.nombre}. Los servicios, los precios y el
            equipo son de ejemplo: no corresponden a ningún local real.{" "}
            <Link
              href="/para-barberias"
              className="underline underline-offset-2 hover:text-acero-00"
            >
              Si tienes una barbería, esta web puede ser la tuya
            </Link>
            .
          </p>
        )}
      </div>
    </footer>
  );
}
