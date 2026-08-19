import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { anularCita } from "@/lib/reservas";
import { avisarCitaAnulada } from "@/lib/correo";
import { Cabecera } from "@/componentes/Cabecera";
import { PieDePagina } from "@/componentes/PieDePagina";
import { IconoCheck, IconoCruz, IconoTelefono } from "@/componentes/Iconos";
import { NEGOCIO, duracion, precio } from "@/datos/negocio";
import { aFechaISO, fechaLarga, horaLocal } from "@/lib/tiempo";
import { EstadoCita } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu cita",
  robots: { index: false, follow: false },
};

async function anular(datos: FormData) {
  "use server";
  const token = String(datos.get("token") ?? "");
  if (!token) return;

  const cita = await prisma.cita.findUnique({
    where: { tokenGestion: token },
    include: { barbero: { select: { nombre: true } } },
  });
  if (!cita) return;

  const resultado = await anularCita({ tokenGestion: token, motivo: "Anulada por el cliente" });
  if (resultado.ok && cita.estado !== EstadoCita.CANCELADA) {
    const aviso = await avisarCitaAnulada(
      { ...cita, barberoNombre: cita.barbero.nombre },
      true,
    );
    if (!aviso.ok) {
      console.error(`[CITA ${cita.codigo}] no se avisó de la anulación:`, aviso.motivo);
    }
  }
  revalidatePath(`/cita/${token}`);
}

export default async function PaginaCita({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const cita = await prisma.cita.findUnique({
    where: { tokenGestion: token },
    include: { barbero: { select: { nombre: true, color: true } } },
  });
  if (!cita) notFound();

  const fechaISO = aFechaISO(cita.inicio);
  const anulada = cita.estado === EstadoCita.CANCELADA;
  const pasada = cita.inicio.getTime() < Date.now();

  const lineas: [string, string][] = [
    ["Servicio", cita.servicioNombre],
    ["Barbero", cita.barbero.nombre],
    ["Día", fechaLarga(fechaISO)],
    ["Hora", `${horaLocal(cita.inicio)} – ${horaLocal(cita.fin)}`],
    ["Duración", duracion(cita.duracionMin)],
    ["A nombre de", cita.clienteNombre],
    ["Teléfono", cita.clienteTelefono],
  ];

  return (
    <>
      <Cabecera />
      <main id="contenido" className="relative z-10">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="sombra-alzada border-2 border-tinta bg-acero-00">
            <div
              className={`flex items-center gap-3 px-6 py-4 text-white ${
                anulada ? "campo-tinta bg-tinta" : "campo-bermellon bg-bermellon"
              }`}
            >
              {anulada ? <IconoCruz className="h-6 w-6" /> : <IconoCheck className="h-6 w-6" />}
              <p className="titular text-[1.4rem]">
                {anulada ? "Cita anulada" : pasada ? "Cita pasada" : "Cita confirmada"}
              </p>
              <span className="medida ml-auto text-[0.95rem]">{cita.codigo}</span>
            </div>

            <dl className="px-6 py-3">
              {lineas.map(([clave, valor]) => (
                <div
                  key={clave}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-acero-20 py-3.5 last:border-0"
                >
                  <dt className="cota text-acero-50">{clave}</dt>
                  <dd
                    className={`text-right text-[1rem] font-medium ${anulada ? "text-acero-30 line-through" : "text-tinta"}`}
                  >
                    {valor}
                  </dd>
                </div>
              ))}
            </dl>

            {cita.notas && (
              <div className="border-t border-acero-20 px-6 py-4">
                <p className="cota text-acero-50">Tu nota</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-tinta-60">
                  {cita.notas}
                </p>
              </div>
            )}

            <div className="flex items-baseline justify-between gap-4 border-t-2 border-tinta bg-tinta px-6 py-4 text-white">
              <span className="cota">Se paga en el local</span>
              <span className="medida text-[1.5rem] font-medium">
                {precio(cita.precioCent)}
              </span>
            </div>
          </div>

          {anulada ? (
            <div className="mt-8">
              <p className="text-[0.98rem] leading-relaxed text-acero-50">
                Esta cita ya no está en la agenda. Si te has arrepentido, coge otra
                hora: si tu hueco sigue libre, lo verás.
              </p>
              <Link
                href="/reservar"
                className="cota mt-5 inline-flex items-center bg-bermellon px-6 py-4 text-white transition-colors hover:bg-tinta"
              >
                Coger otra hora
              </Link>
            </div>
          ) : pasada ? (
            <div className="mt-8">
              <p className="text-[0.98rem] leading-relaxed text-acero-50">
                Esta cita ya ha pasado. Gracias por venir.
              </p>
              <Link
                href="/reservar"
                className="cota mt-5 inline-flex items-center bg-bermellon px-6 py-4 text-white transition-colors hover:bg-tinta"
              >
                Reservar otra vez
              </Link>
            </div>
          ) : (
            <div className="mt-8 border-2 border-acero-20 px-6 py-6">
              <p className="titular text-[1.3rem]">¿No puedes venir?</p>
              <p className="mt-2 max-w-[54ch] text-[0.95rem] leading-relaxed text-acero-50">
                Anúlala y el hueco queda libre para otra persona. Si es para hoy
                mismo, mejor llámanos y lo arreglamos por teléfono.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <form action={anular}>
                  <input type="hidden" name="token" value={token} />
                  <button
                    type="submit"
                    className="cota inline-flex items-center gap-2 border-2 border-tinta px-6 py-3.5 transition-colors hover:bg-tinta hover:text-white"
                  >
                    <IconoCruz className="h-4 w-4" />
                    Anular la cita
                  </button>
                </form>
                <a
                  href={`tel:${NEGOCIO.telefonoE164}`}
                  className="cota inline-flex items-center gap-2 px-2 py-3.5 text-acero-50 transition-colors hover:text-tinta"
                >
                  <IconoTelefono className="h-4 w-4" />
                  {NEGOCIO.telefono}
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
