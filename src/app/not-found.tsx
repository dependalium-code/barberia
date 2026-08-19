import Link from "next/link";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { IconoFlecha } from "@/componentes/Iconos";
import { NEGOCIO } from "@/datos/negocio";

export default function NoEncontrada() {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="mx-auto max-w-[46rem] px-4 py-20 sm:px-6 sm:py-28">
          <p className="medida text-[3rem] font-bold leading-none text-bermellon">404</p>
          <h1 className="titular mt-4 text-[clamp(2.2rem,8vw,4rem)]">
            Aquí no hay nada
          </h1>
          <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-acero-50">
            La página que buscabas no existe o ha cambiado de sitio. Si venías a
            coger hora, se hace desde aquí en un minuto.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservar"
              className="group inline-flex items-center gap-3 bg-bermellon px-7 py-4 text-white transition-colors hover:bg-tinta"
            >
              <span className="titular text-lg">Reservar hora</span>
              <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="cota inline-flex items-center border-2 border-tinta px-7 py-4 transition-colors hover:bg-tinta hover:text-white"
            >
              Ir a la portada
            </Link>
          </div>
          <p className="mt-8 text-[0.95rem] text-acero-50">
            O llámanos al{" "}
            <a
              href={`tel:${NEGOCIO.telefonoE164}`}
              className="medida underline underline-offset-2 hover:text-tinta"
            >
              {NEGOCIO.telefono}
            </a>
            .
          </p>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
