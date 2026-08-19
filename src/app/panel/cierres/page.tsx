import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { borrarBloqueo } from "../gestion";
import { TituloPanel, Boton } from "../piezas";
import { FormularioCierre } from "./Formulario";
import { aFechaISO, fechaLarga, hoyISO, horaLocal } from "@/lib/tiempo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cierres y vacaciones", robots: { index: false } };

export default async function PaginaCierres() {
  const ahora = new Date();
  const [barberos, bloqueos] = await Promise.all([
    prisma.barbero.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.bloqueo.findMany({
      orderBy: { inicio: "asc" },
      include: { barbero: { select: { nombre: true } } },
    }),
  ]);

  const vigentes = bloqueos.filter((b) => b.fin >= ahora);
  const pasados = bloqueos.filter((b) => b.fin < ahora);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel>Cierres y vacaciones</TituloPanel>
      <p className="mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed text-acero-50">
        Lo que marques aquí desaparece de la web al momento. Ojo: un cierre no
        anula las citas que ya estuvieran cogidas dentro de esas fechas; si las
        hay, te lo decimos al guardar para que puedas llamar.
      </p>

      <div className="mt-6">
        <FormularioCierre barberos={barberos} hoy={hoyISO()} />
      </div>

      <h2 className="titular mt-10 border-b-2 border-tinta pb-3 text-[1.5rem]">
        Cierres en pie
      </h2>
      {vigentes.length === 0 ? (
        <p className="mt-4 border border-dashed border-acero-20 px-5 py-8 text-center text-[0.95rem] text-acero-50">
          No hay ningún cierre puesto. La agenda va según el horario de cada barbero.
        </p>
      ) : (
        <ul className="mt-4 grid gap-px bg-acero-20">
          {vigentes.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-acero-00 px-5 py-4"
            >
              <span className="min-w-0">
                <span className="block text-[1rem] font-medium">
                  {b.motivo ?? "Cerrado"}
                </span>
                <span className="cota text-acero-50">
                  {b.barbero ? `Solo ${b.barbero.nombre}` : "Todo el local"}
                </span>
              </span>
              <span className="medida text-[0.9rem] text-acero-50">
                {fechaLarga(aFechaISO(b.inicio))} · {horaLocal(b.inicio)}
                {" → "}
                {fechaLarga(aFechaISO(b.fin))} · {horaLocal(b.fin)}
              </span>
              <form action={borrarBloqueo} className="ml-auto">
                <input type="hidden" name="id" value={b.id} />
                <Boton tono="peligro" type="submit">
                  Quitar
                </Boton>
              </form>
            </li>
          ))}
        </ul>
      )}

      {pasados.length > 0 && (
        <details className="mt-8">
          <summary className="cota cursor-pointer text-acero-50 hover:text-tinta">
            {pasados.length} {pasados.length === 1 ? "cierre pasado" : "cierres pasados"}
          </summary>
          <ul className="mt-3 grid gap-px bg-acero-20">
            {pasados.map((b) => (
              <li key={b.id} className="flex items-center gap-4 bg-acero-00 px-5 py-3">
                <span className="text-[0.9rem] text-acero-50">
                  {b.motivo ?? "Cerrado"} · {fechaLarga(aFechaISO(b.inicio))}
                </span>
                <form action={borrarBloqueo} className="ml-auto">
                  <input type="hidden" name="id" value={b.id} />
                  <Boton tono="borde" type="submit">
                    Borrar
                  </Boton>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
