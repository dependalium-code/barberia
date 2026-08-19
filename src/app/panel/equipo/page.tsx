import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { minutosAHora } from "@/lib/tiempo";
import { TituloPanel } from "../piezas";
import { EditorBarbero, EditorHorario, type BarberoPanel } from "./EditorBarbero";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Equipo y horarios", robots: { index: false } };

const NOMBRE_DIA = ["L", "M", "X", "J", "V", "S", "D"];

export default async function PaginaEquipo() {
  const [filas, servicios] = await Promise.all([
    prisma.barbero.findMany({
      orderBy: [{ activo: "desc" }, { orden: "asc" }],
      include: {
        servicios: { select: { servicioId: true } },
        horarios: { orderBy: [{ diaSemana: "asc" }, { inicioMin: "asc" }] },
      },
    }),
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  const barberos: BarberoPanel[] = filas.map((b) => {
    const horario: Record<number, { de: string; a: string }[]> = {};
    for (const h of b.horarios) {
      (horario[h.diaSemana] ??= []).push({
        de: minutosAHora(h.inicioMin),
        a: minutosAHora(h.finMin),
      });
    }
    return {
      id: b.id,
      nombre: b.nombre,
      puesto: b.puesto,
      bio: b.bio,
      color: b.color,
      activo: b.activo,
      orden: b.orden,
      servicios: b.servicios.map((s) => s.servicioId),
      horario,
    };
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel>Equipo y horarios</TituloPanel>
      <p className="mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed text-acero-50">
        El horario de cada barbero es lo que dibuja los huecos en la web. Si hoy
        entra a las tres, cámbialo aquí y la agenda se ajusta sola.
      </p>

      <details className="mt-6 border-2 border-tinta bg-acero-00">
        <summary className="cota cursor-pointer bg-tinta px-5 py-3 text-white">
          Añadir a alguien
        </summary>
        <EditorBarbero servicios={servicios} />
      </details>

      <div className="mt-6 grid gap-5">
        {barberos.map((b) => {
          const dias = Object.keys(b.horario).map(Number).sort();
          return (
            <section
              key={b.id}
              className={`border bg-acero-00 ${b.activo ? "border-acero-20" : "border-dashed border-acero-30"}`}
            >
              <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-acero-20 px-5 py-3.5">
                <span
                  aria-hidden="true"
                  className="h-8 w-2 shrink-0"
                  style={{ background: b.color }}
                />
                <span>
                  <span className="titular block text-[1.35rem]">{b.nombre}</span>
                  <span className="cota text-acero-50">
                    {b.puesto ?? "Barbero"}
                    {!b.activo && " · inactivo"}
                  </span>
                </span>
                <span className="cota ml-auto flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <span
                      key={d}
                      title={
                        b.horario[d]
                          ? b.horario[d].map((t) => `${t.de}–${t.a}`).join(" y ")
                          : "cerrado"
                      }
                      className={`flex h-6 w-6 items-center justify-center ${
                        b.horario[d] ? "bg-tinta text-white" : "bg-acero-10 text-acero-30"
                      }`}
                    >
                      {NOMBRE_DIA[d - 1]}
                    </span>
                  ))}
                </span>
              </header>

              {dias.length === 0 && (
                <p className="border-b border-acero-20 bg-bermellon-humo px-5 py-3 text-[0.9rem]">
                  Sin horario: no aparece ni un hueco suyo en la web.
                </p>
              )}

              <details>
                <summary className="cota cursor-pointer px-5 py-3 text-acero-50 hover:text-tinta">
                  Datos y servicios
                </summary>
                <div className="border-t border-acero-20">
                  <EditorBarbero barbero={b} servicios={servicios} />
                </div>
              </details>

              <details className="border-t border-acero-20">
                <summary className="cota cursor-pointer px-5 py-3 text-acero-50 hover:text-tinta">
                  Horario semanal
                </summary>
                <div className="border-t border-acero-20">
                  <EditorHorario barbero={b} />
                </div>
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
