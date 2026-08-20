import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { borrarMensaje, marcarMensajeLeido } from "../gestion";
import { TituloPanel, Boton } from "../piezas";
import { aFechaISO, fechaLarga, horaLocal } from "@/lib/tiempo";
import { AGENCIA } from "@/datos/negocio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

const FILTROS = [
  { clave: "barberias", texto: "Barberías interesadas", tipo: "BARBERIA" as const },
  { clave: "clientes", texto: "Clientes", tipo: "CONTACTO" as const },
  { clave: "todos", texto: "Todos", tipo: null },
];

export default async function PaginaMensajes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const filtro = typeof p.f === "string" ? p.f : "barberias";
  const tipo = FILTROS.find((x) => x.clave === filtro)?.tipo ?? null;

  const [mensajes, sinLeerBarberias, sinLeerClientes] = await Promise.all([
    prisma.mensaje.findMany({
      where: tipo ? { tipo } : {},
      orderBy: { creadoEn: "desc" },
      take: 100,
    }),
    prisma.mensaje.count({ where: { tipo: "BARBERIA", leido: false } }),
    prisma.mensaje.count({ where: { tipo: "CONTACTO", leido: false } }),
  ]);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel
        extra={
          sinLeerBarberias > 0 ? (
            <span className="cota bg-bermellon px-3 py-1.5 text-white">
              {sinLeerBarberias} {sinLeerBarberias === 1 ? "barbería" : "barberías"} sin leer
            </span>
          ) : null
        }
      >
        Mensajes
      </TituloPanel>

      <nav className="mt-4 flex w-fit max-w-full flex-wrap gap-px bg-acero-20">
        {FILTROS.map((f) => {
          const pendientes =
            f.clave === "barberias"
              ? sinLeerBarberias
              : f.clave === "clientes"
                ? sinLeerClientes
                : sinLeerBarberias + sinLeerClientes;
          return (
            <Link
              key={f.clave}
              href={`/panel/mensajes?f=${f.clave}`}
              className={`cota flex items-center gap-2 px-4 py-2.5 transition-colors ${
                filtro === f.clave ? "bg-tinta text-white" : "bg-acero-05 hover:bg-acero-10"
              }`}
            >
              {f.texto}
              {pendientes > 0 && (
                <span
                  className={`px-1.5 py-0.5 ${filtro === f.clave ? "bg-bermellon text-white" : "bg-bermellon-humo text-bermellon-hondo"}`}
                >
                  {pendientes}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {filtro === "barberias" && (
        <p className="mt-4 max-w-[62ch] text-[0.9rem] leading-relaxed text-acero-50">
          Quien rellena el formulario de{" "}
          <Link href="/para-barberias" className="underline underline-offset-2 hover:text-tinta">
            /para-barberias
          </Link>{" "}
          cae aquí. Estos son los leads de {AGENCIA.nombre}, no clientes de la
          barbería.
        </p>
      )}

      {mensajes.length === 0 ? (
        <p className="mt-6 border border-dashed border-acero-20 px-5 py-12 text-center text-acero-50">
          {filtro === "barberias"
            ? "Todavía no ha escrito ninguna barbería."
            : "Todavía no ha escrito nadie por el formulario de contacto."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {mensajes.map((m) => {
            const esLead = m.tipo === "BARBERIA";
            return (
              <li
                key={m.id}
                className={`border bg-acero-00 p-5 ${m.leido ? "border-acero-20" : "border-tinta"}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  {esLead && (
                    <span className="cota bg-bermellon px-2 py-1 text-white">Barbería</span>
                  )}
                  {m.revisar && (
                    <span
                      className="cota border border-tinta px-2 py-1"
                      title={m.verifNota ?? undefined}
                    >
                      Sin comprobar
                    </span>
                  )}
                  <span className="titular text-[1.25rem]">
                    {esLead && m.negocio ? m.negocio : m.nombre}
                  </span>
                  {esLead && m.poblacion && (
                    <span className="cota text-acero-50">{m.poblacion}</span>
                  )}
                  <span className="cota ml-auto text-acero-50">
                    {fechaLarga(aFechaISO(m.creadoEn))} · {horaLocal(m.creadoEn)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  {esLead && m.negocio && (
                    <span className="text-[0.92rem] text-acero-50">Contacto: {m.nombre}</span>
                  )}
                  {m.telefono && (
                    <a
                      href={`tel:${m.telefono.replace(/\s/g, "")}`}
                      className="medida text-[0.92rem] text-bermellon hover:text-tinta"
                    >
                      {m.telefono}
                    </a>
                  )}
                  {!m.email.includes("@no-facilitado") && (
                    <a
                      href={`mailto:${m.email}`}
                      className="text-[0.92rem] text-acero-50 hover:text-tinta"
                    >
                      {m.email}
                    </a>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed">
                  {m.texto}
                </p>

                {m.revisar && (
                  <p className="mt-3 border-l-4 border-tinta bg-acero-10 px-3 py-2 text-[0.82rem] leading-relaxed">
                    <strong>Míralo antes de contar con él.</strong> No se pudo
                    comprobar que lo mandara una persona
                    {m.verifNota ? `: ${m.verifNota}` : ""}
                    {m.verifScore !== null ? ` · puntuación ${m.verifScore.toFixed(2)}` : ""}.
                    Se guarda igual: rechazar por esto costaría clientes de
                    verdad.
                  </p>
                )}

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
                  {m.telefono && (
                    <a
                      href={`https://wa.me/34${m.telefono.replace(/\D/g, "").slice(-9)}`}
                      className="cota border border-tinta px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
                    >
                      WhatsApp
                    </a>
                  )}
                  {!m.email.includes("@no-facilitado") && (
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(esLead ? "La web para tu barbería" : "Tu mensaje")}`}
                      className="cota border border-tinta px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
                    >
                      Responder
                    </a>
                  )}
                  <form action={borrarMensaje} className="ml-auto">
                    <input type="hidden" name="id" value={m.id} />
                    <Boton tono="peligro" type="submit">
                      Borrar
                    </Boton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
