import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ventanaDelDia } from "@/lib/agenda";
import {
  aFechaISO,
  diaSemanaISO,
  fechaLarga,
  hoyISO,
  horaLocal,
  inicioDelDia,
  minutosAHora,
  sumarDias,
} from "@/lib/tiempo";
import { precio } from "@/datos/negocio";
import { tintaSobre } from "@/lib/color";
import { EstadoCita } from "@/generated/prisma/enums";
import { FichaCita } from "./FichaCita";
import { NuevaCita } from "./NuevaCita";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda", robots: { index: false } };

const PIXELES_POR_MINUTO = 1.15;

const ETIQUETA_ESTADO: Record<EstadoCita, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Atendida",
  CANCELADA: "Anulada",
  NO_PRESENTADO: "No vino",
};

export default async function PaginaAgenda({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const pedida = typeof p.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.dia) ? p.dia : hoyISO();
  const citaAbierta = typeof p.cita === "string" ? p.cita : null;

  const [barberos, servicios, ventana] = await Promise.all([
    prisma.barbero.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true, color: true, horarios: true },
    }),
    prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true, duracionMin: true, precioCent: true },
    }),
    ventanaDelDia(pedida),
  ]);

  const desdeInstante = inicioDelDia(pedida);
  const hastaInstante = inicioDelDia(sumarDias(pedida, 1));

  const delDia = await prisma.cita.findMany({
    where: { inicio: { lt: hastaInstante }, fin: { gt: desdeInstante } },
    include: { barbero: { select: { nombre: true, color: true } } },
    orderBy: { inicio: "asc" },
  });

  const bloqueos = await prisma.bloqueo.findMany({
    where: { inicio: { lt: hastaInstante }, fin: { gt: desdeInstante } },
    select: { id: true, barberoId: true, inicio: true, fin: true, motivo: true },
  });

  const vivas = delDia.filter((c) => c.estado !== EstadoCita.CANCELADA);
  const facturacion = vivas.reduce((t, c) => t + c.precioCent, 0);
  const sinAviso = delDia.filter((c) => !c.avisoOk && c.avisoError).length;

  const desdeMin = ventana ? Math.min(ventana.desdeMin, ...vivas.map(minutosDe)) : 540;
  const hastaMin = ventana ? Math.max(ventana.hastaMin, ...vivas.map(finDe)) : 1200;
  const alto = Math.max((hastaMin - desdeMin) * PIXELES_POR_MINUTO, 200);

  const horas: number[] = [];
  for (let m = Math.ceil(desdeMin / 60) * 60; m <= hastaMin; m += 60) horas.push(m);

  const abierta = citaAbierta ? (delDia.find((c) => c.id === citaAbierta) ?? null) : null;
  const diaDeLaSemana = diaSemanaISO(pedida);
  const medianoche = desdeInstante.getTime();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Barra del día */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h1 className="titular text-[clamp(1.7rem,4vw,2.4rem)]">
          {pedida === hoyISO() ? "Hoy" : fechaLarga(pedida).split(",")[0]}
        </h1>
        <p className="medida text-[0.95rem] text-acero-50">{fechaLarga(pedida)}</p>

        <div className="ml-auto flex items-center gap-px bg-acero-20">
          <Link
            href={`/panel/agenda?dia=${sumarDias(pedida, -1)}`}
            className="cota bg-acero-05 px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
          >
            Ayer
          </Link>
          <Link
            href="/panel/agenda"
            className="cota bg-acero-05 px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
          >
            Hoy
          </Link>
          <Link
            href={`/panel/agenda?dia=${sumarDias(pedida, 1)}`}
            className="cota bg-acero-05 px-4 py-2.5 transition-colors hover:bg-tinta hover:text-white"
          >
            Mañana
          </Link>
        </div>
      </div>

      {/* Resumen del día */}
      <dl className="mt-5 grid grid-cols-2 gap-px border border-acero-20 bg-acero-20 sm:grid-cols-4">
        {[
          ["Citas", String(vivas.length)],
          ["Previsto", precio(facturacion)],
          ["Anuladas", String(delDia.length - vivas.length)],
          ["Sin avisar", String(sinAviso)],
        ].map(([clave, valor]) => (
          <div key={clave} className="bg-acero-05 px-4 py-3">
            <dt className="cota text-acero-50">{clave}</dt>
            <dd
              className={`medida mt-1 text-[1.25rem] font-medium ${
                clave === "Sin avisar" && sinAviso > 0 ? "text-bermellon" : ""
              }`}
            >
              {valor}
            </dd>
          </div>
        ))}
      </dl>

      {sinAviso > 0 && (
        <p className="mt-3 border-t-2 border-bermellon bg-bermellon-humo px-4 py-3 text-[0.9rem] leading-relaxed text-tinta">
          Hay {sinAviso} {sinAviso === 1 ? "cita cuyo aviso" : "citas cuyos avisos"} por
          correo no {sinAviso === 1 ? "salió" : "salieron"}. La cita está cogida igual;
          revisa las credenciales de correo en el servidor.
        </p>
      )}

      <NuevaCita servicios={servicios} barberos={barberos} fecha={pedida} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* La agenda */}
        {barberos.length === 0 ? (
          <p className="border border-dashed border-acero-20 px-5 py-12 text-center text-acero-50">
            No hay ningún barbero activo. Añade uno en{" "}
            <Link href="/panel/equipo" className="underline">
              Equipo y horarios
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto border border-acero-20 bg-acero-00 pb-4">
            <div className="min-w-[36rem]">
              {/* Cabecera de columnas */}
              <div
                className="grid border-b border-acero-20"
                style={{ gridTemplateColumns: `4rem repeat(${barberos.length}, minmax(0,1fr))` }}
              >
                <span />
                {barberos.map((b) => (
                  <span key={b.id} className="border-l border-acero-20 px-3 py-2.5">
                    <span className="cota block truncate">{b.nombre}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1.5 block h-1"
                      style={{ background: b.color }}
                    />
                  </span>
                ))}
              </div>

              <div
                className="relative grid"
                style={{
                  gridTemplateColumns: `4rem repeat(${barberos.length}, minmax(0,1fr))`,
                  height: `${alto}px`,
                }}
              >
                {/* Regla de horas */}
                <div className="relative">
                  {horas.map((m) => (
                    <span
                      key={m}
                      className="cota absolute right-2 -translate-y-1/2 text-acero-50"
                      style={{ top: `${(m - desdeMin) * PIXELES_POR_MINUTO}px` }}
                    >
                      {minutosAHora(m)}
                    </span>
                  ))}
                </div>

                {barberos.map((b) => {
                  const suyas = delDia.filter((c) => c.barberoId === b.id);
                  const susBloqueos = bloqueos.filter(
                    (x) => x.barberoId === null || x.barberoId === b.id,
                  );
                  const susTramos = b.horarios.filter((h) => h.diaSemana === diaDeLaSemana);

                  return (
                    <div key={b.id} className="relative border-l border-acero-20">
                      {/* Fuera de turno: gris */}
                      <div className="absolute inset-0 bg-acero-10/70" />
                      {susTramos.map((t) => (
                        <div
                          key={t.id}
                          className="absolute inset-x-0 bg-acero-00"
                          style={{
                            top: `${(t.inicioMin - desdeMin) * PIXELES_POR_MINUTO}px`,
                            height: `${(t.finMin - t.inicioMin) * PIXELES_POR_MINUTO}px`,
                          }}
                        />
                      ))}

                      {/* Líneas de hora */}
                      {horas.map((m) => (
                        <div
                          key={m}
                          className="absolute inset-x-0 border-t border-acero-20"
                          style={{ top: `${(m - desdeMin) * PIXELES_POR_MINUTO}px` }}
                        />
                      ))}

                      {/* Cierres */}
                      {susBloqueos.map((x) => {
                        // Un cierre puede empezar antes o acabar después del
                        // día que se está pintando: se recorta a la franja.
                        const ini = Math.max((x.inicio.getTime() - medianoche) / 60000, desdeMin);
                        const fin = Math.min((x.fin.getTime() - medianoche) / 60000, hastaMin);
                        if (fin <= ini) return null;
                        return (
                          <div
                            key={x.id}
                            title={x.motivo ?? "Cerrado"}
                            className="absolute inset-x-0 bg-[repeating-linear-gradient(135deg,rgba(20,23,26,0.14)_0_5px,transparent_5px_11px)]"
                            style={{
                              top: `${(ini - desdeMin) * PIXELES_POR_MINUTO}px`,
                              height: `${(fin - ini) * PIXELES_POR_MINUTO}px`,
                            }}
                          />
                        );
                      })}

                      {/* Citas */}
                      {suyas.map((c) => {
                        const ini = minutosDe(c);
                        const dur = Math.max(c.duracionMin, 15);
                        const anulada = c.estado === EstadoCita.CANCELADA;
                        const seleccionada = c.id === citaAbierta;
                        return (
                          <Link
                            key={c.id}
                            href={`/panel/agenda?dia=${pedida}&cita=${c.id}#ficha`}
                            className={`absolute inset-x-1 overflow-hidden px-2 py-1 transition-shadow ${
                              anulada
                                ? "border border-dashed border-acero-30 bg-acero-10 text-acero-50"
                                : ""
                            } ${seleccionada ? "sombra-alzada ring-2 ring-tinta" : "sombra-carta"}`}
                            style={{
                              top: `${(ini - desdeMin) * PIXELES_POR_MINUTO}px`,
                              height: `${dur * PIXELES_POR_MINUTO - 2}px`,
                              background: anulada ? undefined : c.barbero.color,
                              color: anulada ? undefined : tintaSobre(c.barbero.color),
                            }}
                          >
                            <span className="cota block truncate">
                              {horaLocal(c.inicio)} {c.clienteNombre}
                            </span>
                            {dur >= 25 && (
                              <span className="mt-0.5 block truncate text-[0.72rem] leading-tight opacity-90">
                                {c.servicioNombre}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Ficha de la cita seleccionada */}
        <div id="ficha" className="xl:sticky xl:top-6 xl:self-start">
          {abierta ? (
            <FichaCita
              cita={{
                id: abierta.id,
                codigo: abierta.codigo,
                estado: abierta.estado,
                origen: abierta.origen,
                servicioNombre: abierta.servicioNombre,
                barberoNombre: abierta.barbero.nombre,
                barberoId: abierta.barberoId,
                inicio: horaLocal(abierta.inicio),
                fin: horaLocal(abierta.fin),
                fechaISO: aFechaISO(abierta.inicio),
                duracionMin: abierta.duracionMin,
                precio: precio(abierta.precioCent),
                clienteNombre: abierta.clienteNombre,
                clienteTelefono: abierta.clienteTelefono,
                clienteEmail: abierta.clienteEmail,
                notas: abierta.notas,
                avisoError: abierta.avisoError,
                etiquetaEstado: ETIQUETA_ESTADO[abierta.estado],
              }}
              barberos={barberos.map((b) => ({ id: b.id, nombre: b.nombre }))}
              dia={pedida}
            />
          ) : (
            <p className="border border-dashed border-acero-20 px-5 py-10 text-center text-[0.92rem] leading-relaxed text-acero-50">
              Pincha una cita de la agenda y aquí salen sus datos y qué puedes
              hacer con ella.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Minutos desde medianoche local, leídos de la hora de pared del instante. */
function minutosDe(c: { inicio: Date }): number {
  const [h, m] = horaLocal(c.inicio).split(":").map(Number);
  return h * 60 + m;
}

/** Igual, pero un fin a las 00:00 es el final del día, no el principio. */
function finDe(c: { fin: Date }): number {
  const [h, m] = horaLocal(c.fin).split(":").map(Number);
  const total = h * 60 + m;
  return total === 0 ? 24 * 60 : total;
}
