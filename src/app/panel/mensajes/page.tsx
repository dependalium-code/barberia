import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { borrarMensaje, marcarMensajeLeido } from "../gestion";
import { TituloPanel, Boton } from "../piezas";
import { aFechaISO, fechaLarga, horaLocal } from "@/lib/tiempo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

export default async function PaginaMensajes() {
  const mensajes = await prisma.mensaje.findMany({
    orderBy: { creadoEn: "desc" },
    take: 100,
  });
  const sinLeer = mensajes.filter((m) => !m.leido).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel
        extra={
          sinLeer > 0 ? (
            <span className="cota bg-bermellon px-3 py-1.5 text-white">
              {sinLeer} sin leer
            </span>
          ) : null
        }
      >
        Mensajes
      </TituloPanel>

      {mensajes.length === 0 ? (
        <p className="mt-6 border border-dashed border-acero-20 px-5 py-12 text-center text-acero-50">
          Todavía no ha escrito nadie por el formulario de contacto.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {mensajes.map((m) => (
            <li
              key={m.id}
              className={`border bg-acero-00 p-5 ${m.leido ? "border-acero-20" : "border-tinta"}`}
            >
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <span className="titular text-[1.25rem]">{m.nombre}</span>
                <a
                  href={`mailto:${m.email}`}
                  className="text-[0.9rem] text-bermellon hover:text-tinta"
                >
                  {m.email}
                </a>
                {m.telefono && (
                  <a
                    href={`tel:${m.telefono.replace(/\s/g, "")}`}
                    className="medida text-[0.9rem] text-acero-50 hover:text-tinta"
                  >
                    {m.telefono}
                  </a>
                )}
                <span className="cota ml-auto text-acero-50">
                  {fechaLarga(aFechaISO(m.creadoEn))} · {horaLocal(m.creadoEn)}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                {m.texto}
              </p>

              {m.avisoError && (
                <p className="mt-3 border-t-2 border-bermellon bg-bermellon-humo px-3 py-2 text-[0.82rem]">
                  El aviso por correo de este mensaje no salió: {m.avisoError}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {!m.leido && (
                  <form action={marcarMensajeLeido}>
                    <input type="hidden" name="id" value={m.id} />
                    <Boton tono="borde" type="submit">
                      Marcar leído
                    </Boton>
                  </form>
                )}
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Tu mensaje a La Barbería")}`}
                  className="cota border border-tinta px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
                >
                  Responder
                </a>
                <form action={borrarMensaje} className="ml-auto">
                  <input type="hidden" name="id" value={m.id} />
                  <Boton tono="peligro" type="submit">
                    Borrar
                  </Boton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
