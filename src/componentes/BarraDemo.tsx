import Link from "next/link";
import { DEMO, NEGOCIO } from "@/datos/negocio";
import { IconoFlecha } from "@/componentes/Iconos";

/**
 * Aviso de demostración, en lo más alto de todas las páginas públicas.
 *
 * Va aquí y no en el pie a propósito: esta web tiene un motor de citas vivo y
 * un teléfono real. Quien llegue buscando barbero tiene que enterarse ANTES de
 * reservar de que este local no existe, no después.
 *
 * Y de paso hace su trabajo comercial: quien llega es, casi siempre, alguien
 * que quiere una web así.
 */
export function BarraDemo() {
  if (!DEMO) return null;

  return (
    <div className="campo-tinta relative z-50 bg-tinta text-acero-05">
      <div className="mx-auto flex max-w-[86rem] flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2.5 sm:px-6 lg:px-10">
        <p className="cota shrink-0 bg-bermellon px-2 py-1 text-white">Demostración</p>
        <p className="min-w-0 text-[0.86rem] leading-snug text-acero-30">
          Esta barbería no existe.
          <span className="hidden sm:inline">
            {" "}
            Es un ejemplo de web con reservas propias: puedes reservar y
            trastear, no molestas a nadie.
          </span>
        </p>
        <Link
          href="/para-barberias"
          className="cota group ml-auto inline-flex shrink-0 items-center gap-2 text-bermellon-vivo transition-colors hover:text-white"
        >
          <span className="sm:hidden">La quiero</span>
          <span className="hidden sm:inline">La quiero para mi barbería</span>
          <IconoFlecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

/** Variante corta para el resguardo de la cita. */
export function AvisoDemoCita() {
  if (!DEMO) return null;
  return (
    <p className="mt-5 border-t-2 border-bermellon bg-bermellon-humo px-4 py-3 text-[0.88rem] leading-relaxed">
      <strong>Esto es una demostración.</strong> Tu cita se ha guardado de verdad
      —así funciona el sistema— pero {NEGOCIO.nombreLargo} no es un local real y
      no te espera nadie. Si tienes una barbería y quieres esta web,{" "}
      <Link href="/para-barberias" className="underline underline-offset-2">
        aquí te la contamos
      </Link>
      .
    </p>
  );
}
