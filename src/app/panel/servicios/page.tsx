import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { duracion, precio } from "@/datos/negocio";
import { TituloPanel } from "../piezas";
import { EditorServicio, type ServicioPanel } from "./EditorServicio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Servicios", robots: { index: false } };

export default async function PaginaServicios() {
  const filas = await prisma.servicio.findMany({
    orderBy: [{ activo: "desc" }, { orden: "asc" }],
    include: { _count: { select: { citas: true } } },
  });

  const servicios: ServicioPanel[] = filas.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    categoria: s.categoria,
    duracionMin: s.duracionMin,
    precioCent: s.precioCent,
    destacado: s.destacado,
    activo: s.activo,
    orden: s.orden,
    citas: s._count.citas,
  }));

  const categorias = [...new Set(servicios.map((s) => s.categoria))];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel>Servicios</TituloPanel>
      <p className="mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed text-acero-50">
        La duración es lo que ocupa en la agenda: si un corte tarda 30 minutos de
        verdad, ponlo en 30 y no en 20, o el día se descuadra a media tarde.
      </p>

      <details className="mt-6 border-2 border-tinta bg-acero-00">
        <summary className="cota cursor-pointer bg-tinta px-5 py-3 text-white">
          Añadir un servicio
        </summary>
        <EditorServicio categorias={categorias} />
      </details>

      <div className="mt-6 grid gap-4">
        {servicios.map((s) => (
          <details
            key={s.id}
            className={`border bg-acero-00 ${s.activo ? "border-acero-20" : "border-dashed border-acero-30"}`}
          >
            <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_8rem_7rem_6rem]">
              <span className="min-w-0">
                <span className="titular block truncate text-[1.25rem]">{s.nombre}</span>
                <span className="cota text-acero-50">
                  {s.categoria}
                  {!s.activo && " · retirado"}
                  {s.destacado && " · en portada"}
                </span>
              </span>
              <span className="medida hidden text-[0.85rem] text-acero-50 sm:block">
                {duracion(s.duracionMin)}
              </span>
              <span className="medida text-right text-[1rem] font-medium sm:text-left">
                {precio(s.precioCent)}
              </span>
              <span className="cota hidden text-right text-acero-50 sm:block">
                {s.citas} {s.citas === 1 ? "cita" : "citas"}
              </span>
            </summary>
            <div className="border-t border-acero-20">
              <EditorServicio servicio={s} categorias={categorias} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
