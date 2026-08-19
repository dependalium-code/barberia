import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";

/** Armazón de las páginas de leer: legales y avisos. Medida corta y respiro. */
export function PaginaTexto({
  titulo,
  entradilla,
  children,
}: {
  titulo: string;
  entradilla?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.2rem,8vw,4.5rem)] text-white">{titulo}</h1>
            {entradilla && (
              <p className="mt-4 max-w-[54ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
                {entradilla}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-[46rem] px-4 py-12 sm:px-6 sm:py-16">
          <div className="texto-legal">{children}</div>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}

export function Apartado({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="titular border-b border-acero-20 pb-3 text-[1.45rem]">{titulo}</h2>
      <div className="mt-4 grid gap-4 text-[1rem] leading-[1.75] text-tinta-60">{children}</div>
    </section>
  );
}
