import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { precio } from "@/datos/negocio";
import { aFechaISO, fechaLarga, horaLocal } from "@/lib/tiempo";
import { EstadoCita } from "@/generated/prisma/enums";
import { TituloPanel } from "../piezas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Citas", robots: { index: false } };

const FILTROS = [
  { clave: "proximas", texto: "Próximas" },
  { clave: "pasadas", texto: "Pasadas" },
  { clave: "anuladas", texto: "Anuladas" },
  { clave: "todas", texto: "Todas" },
] as const;

const ETIQUETA: Record<EstadoCita, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Atendida",
  CANCELADA: "Anulada",
  NO_PRESENTADO: "No vino",
};

export default async function PaginaCitas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const filtro = typeof p.f === "string" ? p.f : "proximas";
  const busca = typeof p.q === "string" ? p.q.trim() : "";
  const ahora = new Date();

  const donde =
    filtro === "pasadas"
      ? { inicio: { lt: ahora }, estado: { not: EstadoCita.CANCELADA } }
      : filtro === "anuladas"
        ? { estado: EstadoCita.CANCELADA }
        : filtro === "todas"
          ? {}
          : { inicio: { gte: ahora }, estado: { not: EstadoCita.CANCELADA } };

  const citas = await prisma.cita.findMany({
    where: {
      ...donde,
      ...(busca
        ? {
            OR: [
              { clienteNombre: { contains: busca, mode: "insensitive" as const } },
              { clienteTelefono: { contains: busca } },
              { codigo: { contains: busca.toUpperCase() } },
            ],
          }
        : {}),
    },
    include: { barbero: { select: { nombre: true, color: true } } },
    orderBy: { inicio: filtro === "proximas" ? "asc" : "desc" },
    take: 120,
  });

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel
        extra={
          <form method="get" className="flex w-full items-center gap-px bg-acero-20 sm:w-auto">
            <input type="hidden" name="f" value={filtro} />
            <input
              name="q"
              defaultValue={busca}
              placeholder="Nombre, teléfono o referencia"
              aria-label="Buscar citas"
              className="w-full min-w-0 bg-acero-00 px-3 py-2.5 text-[0.9rem] placeholder:text-acero-30 focus:outline-none sm:w-56"
            />
            <button type="submit" className="cota bg-tinta px-4 py-2.5 text-white">
              Buscar
            </button>
          </form>
        }
      >
        Citas
      </TituloPanel>

      <nav className="mt-4 flex flex-wrap gap-px bg-acero-20">
        {FILTROS.map((f) => (
          <Link
            key={f.clave}
            href={`/panel/citas?f=${f.clave}${busca ? `&q=${encodeURIComponent(busca)}` : ""}`}
            className={`cota px-4 py-2.5 transition-colors ${
              filtro === f.clave ? "bg-tinta text-white" : "bg-acero-05 hover:bg-acero-10"
            }`}
          >
            {f.texto}
          </Link>
        ))}
      </nav>

      {citas.length === 0 ? (
        <p className="mt-8 border border-dashed border-acero-20 px-5 py-12 text-center text-acero-50">
          {busca ? `No hay ninguna cita que case con «${busca}».` : "Aquí no hay ninguna cita."}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto border border-acero-20">
          <table className="w-full min-w-[52rem] border-collapse bg-acero-00 text-left">
            <thead>
              <tr className="border-b border-acero-20">
                {["Cuándo", "Cliente", "Servicio", "Barbero", "Estado", "Precio", ""].map((h) => (
                  <th key={h} className="cota px-3 py-2.5 font-medium text-acero-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const anulada = c.estado === EstadoCita.CANCELADA;
                return (
                  <tr
                    key={c.id}
                    className={`border-b border-acero-20 last:border-0 ${anulada ? "text-acero-50" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <span className="medida block text-[0.88rem]">
                        {horaLocal(c.inicio)}
                      </span>
                      <span className="block text-[0.78rem] text-acero-50">
                        {fechaLarga(aFechaISO(c.inicio)).replace(/ de \d{4}$/, "")}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`block font-medium ${anulada ? "line-through" : ""}`}>
                        {c.clienteNombre}
                      </span>
                      <a
                        href={`tel:${c.clienteTelefono.replace(/\s/g, "")}`}
                        className="medida block text-[0.8rem] text-acero-50 hover:text-bermellon"
                      >
                        {c.clienteTelefono}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-[0.9rem]">{c.servicioNombre}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 text-[0.9rem]">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0"
                          style={{ background: c.barbero.color }}
                        />
                        {c.barbero.nombre}
                      </span>
                    </td>
                    <td className="cota px-3 py-3">{ETIQUETA[c.estado]}</td>
                    <td className="medida px-3 py-3 text-[0.9rem]">{precio(c.precioCent)}</td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/panel/agenda?dia=${aFechaISO(c.inicio)}&cita=${c.id}#ficha`}
                        className="cota text-bermellon hover:text-tinta"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {citas.length === 120 && (
        <p className="mt-3 text-[0.85rem] text-acero-50">
          Se enseñan las 120 más recientes. Afina con el buscador para ver el resto.
        </p>
      )}
    </div>
  );
}
