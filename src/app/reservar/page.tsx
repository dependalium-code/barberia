import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { leerAjustes } from "@/lib/agenda";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { MotorDeReserva, type BarberoUI, type ServicioUI } from "./MotorDeReserva";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservar hora",
  description:
    "Elige servicio, barbero, día y hora. Confirmación al momento, sin registro y sin pagar por adelantado.",
};

export default async function PaginaReservar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const uno = (clave: string) => {
    const v = parametros[clave];
    return typeof v === "string" ? v : undefined;
  };

  const [serviciosBd, barberosBd, ajustes] = await Promise.all([
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }],
    }),
    prisma.barbero.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      include: { servicios: { include: { servicio: { select: { slug: true } } } } },
    }),
    leerAjustes(),
  ]);

  const servicios: ServicioUI[] = serviciosBd.map((s) => ({
    slug: s.slug,
    nombre: s.nombre,
    descripcion: s.descripcion,
    categoria: s.categoria,
    duracionMin: s.duracionMin,
    precioCent: s.precioCent,
  }));

  const barberos: BarberoUI[] = barberosBd.map((b) => ({
    slug: b.slug,
    nombre: b.nombre,
    puesto: b.puesto,
    color: b.color,
    servicios: b.servicios.map((x) => x.servicio.slug),
  }));

  const servicioPedido = uno("servicio");
  const barberoPedido = uno("barbero");

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="campo-bermellon bg-bermellon text-white">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
            <h1 className="titular text-[clamp(2.6rem,10vw,6rem)] text-white">
              Reservar
            </h1>
            <p className="mt-4 max-w-[52ch] text-[1.02rem] leading-relaxed text-bermellon-papel">
              Cuatro pasos y ya está. No hace falta registrarse ni dejar la
              tarjeta: se paga en el local.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[86rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          {servicios.length === 0 || barberos.length === 0 ? (
            <p className="border-2 border-acero-20 px-6 py-10 text-center text-[1rem] text-acero-50">
              Todavía no hay agenda publicada. Llámanos y te damos hora.
            </p>
          ) : (
            <MotorDeReserva
              servicios={servicios}
              barberos={barberos}
              aviso={ajustes.avisoReservas}
              inicial={{
                servicio: servicios.some((s) => s.slug === servicioPedido)
                  ? servicioPedido
                  : undefined,
                barbero: barberos.some((b) => b.slug === barberoPedido)
                  ? barberoPedido
                  : undefined,
                fecha: /^\d{4}-\d{2}-\d{2}$/.test(uno("fecha") ?? "") ? uno("fecha") : undefined,
                hora: /^\d{2}:\d{2}$/.test(uno("hora") ?? "") ? uno("hora") : undefined,
              }}
            />
          )}
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
