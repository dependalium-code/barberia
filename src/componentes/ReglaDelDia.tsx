import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { primerDiaConHueco, ventanaDelDia } from "@/lib/agenda";
import { fechaLarga, hoyISO, minutosAHora, sumarDias } from "@/lib/tiempo";
import { duracion, precio } from "@/datos/negocio";
import { IconoFlecha } from "@/componentes/Iconos";

/**
 * La agenda dibujada como lo que es: un instrumento de medida.
 *
 * La regla se traza sobre la franja REAL de apertura de ese día y las marcas
 * son los huecos que de verdad quedan libres, leídos de la base de datos. No
 * es una ilustración: si la barbería llena la tarde, la regla se queda a
 * medias sola.
 */
export async function ReglaDelDia() {
  const servicio =
    (await prisma.servicio.findFirst({
      where: { activo: true, destacado: true },
      orderBy: { orden: "asc" },
    })) ??
    (await prisma.servicio.findFirst({ where: { activo: true }, orderBy: { orden: "asc" } }));

  if (!servicio) return null;

  const encontrado = await primerDiaConHueco(servicio.id);
  if (!encontrado) {
    return (
      <div className="border border-white/25 p-6">
        <p className="titular text-2xl text-white">Agenda completa</p>
        <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-bermellon-papel">
          No queda ningún hueco en las próximas dos semanas. Llámanos y miramos
          si podemos encajarte antes.
        </p>
      </div>
    );
  }

  const { fechaISO, huecos } = encontrado;
  const ventana = (await ventanaDelDia(fechaISO)) ?? { desdeMin: 540, hastaMin: 1200 };
  const ancho = Math.max(ventana.hastaMin - ventana.desdeMin, 60);
  const posicion = (m: number) => ((m - ventana.desdeMin) / ancho) * 100;

  const esHoy = fechaISO === hoyISO();
  const esManiana = fechaISO === sumarDias(hoyISO(), 1);
  const cuando = esHoy ? "Hoy" : esManiana ? "Mañana" : null;

  // Horas en punto para las cotas grandes de la regla.
  const horasEnPunto: number[] = [];
  for (let m = Math.ceil(ventana.desdeMin / 60) * 60; m <= ventana.hastaMin; m += 60) {
    horasEnPunto.push(m);
  }
  const paso = horasEnPunto.length > 8 ? 2 : 1;
  // En el móvil no caben ni la mitad de las cotas: se dejan tres —apertura,
  // mediodía y cierre— y el resto aparece a partir de `sm`. Se eligen de entre
  // las que ya se pintan, no de todas, o en el móvil desaparecería la de en medio.
  const pintadas = horasEnPunto.map((_, i) => i).filter((i) => i % paso === 0);
  const cotasMovil = new Set([
    pintadas[0],
    pintadas[Math.floor((pintadas.length - 1) / 2)],
    pintadas[pintadas.length - 1],
  ]);

  // Hasta dónde llega la parte del día que ya no se puede reservar.
  const primerLibre = huecos[0]?.minutos ?? ventana.desdeMin;
  const yaCerrado = Math.max(0, Math.min(100, posicion(primerLibre)));

  const primeros = huecos.slice(0, 8);

  return (
    <div className="border-2 border-white/35">
      {/* Cabecera del instrumento */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/25 px-4 py-3 sm:px-6">
        <p className="cota text-white">
          {cuando ? `${cuando} · ` : ""}
          {fechaLarga(fechaISO)}
        </p>
        <p className="cota text-bermellon-papel">
          {huecos.length} {huecos.length === 1 ? "hueco libre" : "huecos libres"} ·{" "}
          {servicio.nombre} · {duracion(servicio.duracionMin)} · {precio(servicio.precioCent)}
        </p>
      </div>

      {/* La regla graduada */}
      <div className="px-4 pb-2 pt-7 sm:px-6 sm:pb-3 sm:pt-9">
        <div className="relative h-20 sm:h-24">
          {/* Graduación menor: un diente por cada arranque posible */}
          <div
            aria-hidden="true"
            className="graduacion absolute inset-x-0 top-0 h-4 text-white/35 sm:h-5"
            style={{ ["--paso" as string]: `${(15 / ancho) * 100}%` }}
          />
          {/* Barra principal */}
          <div aria-hidden="true" className="absolute inset-x-0 top-4 h-px bg-white/50 sm:top-5" />

          {/* Franja ya cerrada del día: sin ella la regla vacía por la izquierda
              parece un fallo, cuando lo que pasa es que la mañana ya ha ido. */}
          {yaCerrado > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-0 h-4 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.22)_0_1px,transparent_1px_9px)] sm:h-5"
              style={{ left: 0, width: `${yaCerrado}%` }}
            />
          )}

          {/* Marcas de hueco libre: llegan hasta abajo, que es lo que se mira */}
          {huecos.map((h) => (
            <span
              key={h.minutos}
              aria-hidden="true"
              className="absolute top-0 h-9 w-[3px] -translate-x-1/2 bg-white sm:h-11"
              style={{ left: `${posicion(h.minutos)}%` }}
            />
          ))}

          {/* Cotas de hora */}
          {horasEnPunto.map((m, i) => {
            const x = posicion(m);
            // Las cotas de los extremos se anclan por dentro: centradas se
            // salen de la pantalla y abren barra horizontal en el móvil.
            const anclaje =
              x < 8 ? "translate-x-0" : x > 92 ? "-translate-x-full" : "-translate-x-1/2";
            const marca = x < 8 ? "ml-0" : x > 92 ? "ml-auto" : "mx-auto";
            const visible = cotasMovil.has(i) ? "" : "hidden sm:block";
            return (
              <span
                key={m}
                aria-hidden="true"
                className={`absolute top-12 ${anclaje} sm:top-14`}
                style={{ left: `${x}%` }}
              >
                <span className={`block h-2.5 w-px bg-white/50 ${marca}`} />
                {i % paso === 0 && (
                  <span
                    className={`cota mt-2 whitespace-nowrap text-white/85 ${visible || "block"}`}
                  >
                    {minutosAHora(m)}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Los huecos, tocables */}
      <ul className="flex flex-wrap gap-2 px-4 pb-5 sm:px-6 sm:pb-6">
        {primeros.map((h) => (
          <li key={h.minutos}>
            <Link
              href={`/reservar?servicio=${servicio.slug}&fecha=${fechaISO}&hora=${h.hora}`}
              className="medida block bg-white px-4 py-2.5 text-[0.95rem] font-medium text-tinta transition-colors hover:bg-tinta hover:text-white"
            >
              {h.hora}
            </Link>
          </li>
        ))}
        {huecos.length > primeros.length && (
          <li>
            <Link
              href={`/reservar?servicio=${servicio.slug}&fecha=${fechaISO}`}
              className="cota flex h-full items-center gap-2 border border-white/40 px-4 text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Ver las {huecos.length - primeros.length} restantes
              <IconoFlecha className="h-4 w-4" />
            </Link>
          </li>
        )}
      </ul>

      {/* La acción vive DENTRO del instrumento, no colgando debajo. */}
      <Link
        href="/reservar"
        className="group flex items-center justify-between gap-4 border-t-2 border-white/35 bg-tinta px-4 py-5 text-white transition-colors hover:bg-white hover:text-tinta sm:px-6"
      >
        <span className="titular text-[clamp(1.4rem,4vw,2rem)]">Reservar hora</span>
        <IconoFlecha className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </div>
  );
}
