import Link from "next/link";
import { anularDesdePanel, marcarEstadoCita, moverCita } from "../acciones";
import { IconoTelefono } from "@/componentes/Iconos";
import { EstadoCita } from "@/generated/prisma/enums";
import { FormularioMover } from "./FormularioMover";

export type CitaFicha = {
  id: string;
  codigo: string;
  estado: EstadoCita;
  origen: string;
  servicioNombre: string;
  barberoNombre: string;
  barberoId: string;
  inicio: string;
  fin: string;
  fechaISO: string;
  duracionMin: number;
  precio: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  notas: string | null;
  avisoError: string | null;
  etiquetaEstado: string;
};

const ORIGEN: Record<string, string> = {
  WEB: "Reservada por la web",
  PANEL: "Apuntada en el mostrador",
  TELEFONO: "Por teléfono",
};

export function FichaCita({
  cita,
  barberos,
  dia,
}: {
  cita: CitaFicha;
  barberos: { id: string; nombre: string }[];
  dia: string;
}) {
  const anulada = cita.estado === EstadoCita.CANCELADA;

  return (
    <div className="border-2 border-tinta bg-acero-00">
      <div className="campo-tinta flex items-baseline justify-between gap-3 bg-tinta px-4 py-3 text-white">
        <span className="cota">{cita.etiquetaEstado}</span>
        <span className="medida text-[0.9rem]">{cita.codigo}</span>
      </div>

      <div className="px-4 py-4">
        <p className="titular text-[1.6rem]">{cita.clienteNombre}</p>
        <a
          href={`tel:${cita.clienteTelefono.replace(/\s/g, "")}`}
          className="medida mt-1.5 inline-flex items-center gap-2 text-[0.95rem] text-bermellon hover:text-tinta"
        >
          <IconoTelefono className="h-4 w-4" />
          {cita.clienteTelefono}
        </a>
        {cita.clienteEmail && (
          <a
            href={`mailto:${cita.clienteEmail}`}
            className="mt-1 block truncate text-[0.85rem] text-acero-50 hover:text-tinta"
          >
            {cita.clienteEmail}
          </a>
        )}

        <dl className="mt-4 border-t border-acero-20">
          {[
            ["Servicio", cita.servicioNombre],
            ["Barbero", cita.barberoNombre],
            ["Hora", `${cita.inicio} – ${cita.fin}`],
            ["Precio", cita.precio],
            ["Origen", ORIGEN[cita.origen] ?? cita.origen],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-acero-20 py-2">
              <dt className="cota text-acero-50">{k}</dt>
              <dd className="text-right text-[0.9rem] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {cita.notas && (
          <div className="mt-3 bg-acero-10 px-3 py-2.5">
            <p className="cota text-acero-50">Nota del cliente</p>
            <p className="mt-1 whitespace-pre-wrap text-[0.88rem] leading-relaxed">
              {cita.notas}
            </p>
          </div>
        )}

        {cita.avisoError && (
          <p className="mt-3 border-t-2 border-bermellon bg-bermellon-humo px-3 py-2.5 text-[0.82rem] leading-relaxed">
            El aviso por correo no salió: {cita.avisoError}
          </p>
        )}

        {!anulada && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Accion id={cita.id} estado={EstadoCita.COMPLETADA} texto="Atendida" />
            <Accion id={cita.id} estado={EstadoCita.NO_PRESENTADO} texto="No vino" />
            <form action={anularDesdePanel}>
              <input type="hidden" name="id" value={cita.id} />
              <button
                type="submit"
                className="cota border border-bermellon px-3 py-2 text-bermellon transition-colors hover:bg-bermellon hover:text-white"
              >
                Anular
              </button>
            </form>
          </div>
        )}

        {anulada && (
          <Accion
            id={cita.id}
            estado={EstadoCita.CONFIRMADA}
            texto="Recuperar la cita"
            className="mt-5"
          />
        )}

        {!anulada && (
          <FormularioMover
            accion={moverCita}
            id={cita.id}
            fecha={cita.fechaISO}
            hora={cita.inicio}
            barberoId={cita.barberoId}
            barberos={barberos}
          />
        )}

        <Link
          href={`/panel/agenda?dia=${dia}`}
          className="cota mt-5 inline-block text-acero-50 hover:text-tinta"
        >
          Cerrar ficha
        </Link>
      </div>
    </div>
  );
}

function Accion({
  id,
  estado,
  texto,
  className = "",
}: {
  id: string;
  estado: EstadoCita;
  texto: string;
  className?: string;
}) {
  return (
    <form action={marcarEstadoCita} className={className}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={estado} />
      <button
        type="submit"
        className="cota border border-tinta px-3 py-2 transition-colors hover:bg-tinta hover:text-white"
      >
        {texto}
      </button>
    </form>
  );
}
