"use client";

import { useMemo, useState } from "react";

/**
 * La cuenta de lo que cuesta pagar por cita, al año.
 *
 * REGLA: aquí no se afirma lo que cobra nadie. No sé lo que paga esta barbería
 * ni lo que cobra su proveedor, así que **los números los pone el barbero** y
 * la página solo hace la multiplicación. Inventar la tarifa del de enfrente
 * sería mentir en la página cuyo argumento entero es la transparencia.
 */

const CAMPO =
  "mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] text-tinta transition-colors focus:border-tinta focus:outline-none";

function euros(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).replace(/\s/g, " ");
}

export function Calculadora({ alta, mensual, meses }: { alta: number; mensual: number; meses: number }) {
  const [citas, setCitas] = useState(200);
  const [ticket, setTicket] = useState(18);
  const [cuota, setCuota] = useState(0);
  const [comision, setComision] = useState(0);

  const n = (v: string, tope: number) => {
    const x = Number(v.replace(",", "."));
    return Number.isFinite(x) && x >= 0 ? Math.min(x, tope) : 0;
  };

  const cuenta = useMemo(() => {
    const facturaMes = citas * ticket;
    const comisionMes = (facturaMes * comision) / 100;
    const hoyMes = cuota + comisionMes;
    const hoyAnio = hoyMes * 12;
    const primerAnio = alta + mensual * 12;
    const siguientes = mensual * 12;
    return {
      facturaMes,
      comisionMes,
      hoyMes,
      hoyAnio,
      primerAnio,
      siguientes,
      difPrimero: hoyAnio - primerAnio,
      difSiguientes: hoyAnio - siguientes,
      hayDatos: hoyMes > 0,
    };
  }, [citas, ticket, cuota, comision, alta, mensual]);

  return (
    <div className="border-2 border-tinta bg-acero-00">
      <p className="cota campo-tinta bg-tinta px-5 py-3 text-white">La cuenta, con tus números</p>

      <div className="grid items-end gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
        <label className="cota text-acero-50">
          Citas al mes
          <input
            type="number" min={0} max={5000} inputMode="numeric" value={citas}
            onChange={(e) => setCitas(n(e.target.value, 5000))} className={`${CAMPO} medida`}
          />
        </label>
        <label className="cota text-acero-50">
          Precio medio (€)
          <input
            type="number" min={0} max={500} step="0.5" inputMode="decimal" value={ticket}
            onChange={(e) => setTicket(n(e.target.value, 500))} className={`${CAMPO} medida`}
          />
        </label>
        <label className="cota text-acero-50">
          Cuota fija hoy (€/mes)
          <input
            type="number" min={0} max={2000} step="1" inputMode="decimal" value={cuota}
            onChange={(e) => setCuota(n(e.target.value, 2000))} className={`${CAMPO} medida`}
          />
        </label>
        <label className="cota text-acero-50">
          Comisión por cita (%)
          <input
            type="number" min={0} max={100} step="0.5" inputMode="decimal" value={comision}
            onChange={(e) => setComision(n(e.target.value, 100))} className={`${CAMPO} medida`}
          />
        </label>
      </div>

      <dl className="border-t-2 border-tinta px-5 py-2 sm:px-6">
        <Linea clave="Facturas por esas citas" valor={euros(cuenta.facturaMes)} sufijo="al mes" />
        {comision > 0 && (
          <Linea clave={`La comisión del ${comision} %`} valor={euros(cuenta.comisionMes)} sufijo="al mes" />
        )}
        <Linea clave="Pagas hoy por la herramienta" valor={euros(cuenta.hoyMes)} sufijo="al mes" />
        <Linea clave="Al año" valor={euros(cuenta.hoyAnio)} destacado />
      </dl>

      <div className="campo-tinta bg-tinta px-5 py-5 text-acero-05 sm:px-6">
        <p className="cota text-bermellon-vivo">Con esta web</p>
        <dl className="mt-3">
          <LineaOscura clave="Primer año (alta incluida)" valor={euros(cuenta.primerAnio)} />
          <LineaOscura clave="Los siguientes" valor={euros(cuenta.siguientes)} />
        </dl>

        {cuenta.hayDatos ? (
          <p className="mt-5 border-t border-tinta-60 pt-4 text-[1.05rem] leading-relaxed">
            {cuenta.difPrimero > 0 ? (
              <>
                El primer año te ahorras{" "}
                <strong className="medida text-bermellon-vivo">{euros(cuenta.difPrimero)}</strong>, y
                a partir del segundo{" "}
                <strong className="medida text-bermellon-vivo">{euros(cuenta.difSiguientes)}</strong> cada año.
              </>
            ) : (
              <>
                Con esos números <strong>esta web te sale más cara</strong>: {euros(-cuenta.difPrimero)} más el
                primer año. Te lo digo igual — si pagas poco, pagas poco.
              </>
            )}
          </p>
        ) : (
          <p className="mt-5 border-t border-tinta-60 pt-4 text-[0.95rem] leading-relaxed text-acero-30">
            Pon lo que pagas hoy —la cuota, la comisión o las dos— y sale la comparación.
          </p>
        )}
        <p className="mt-3 text-[0.8rem] leading-relaxed text-acero-30">
          Todas las cifras sin IVA. La cuota de esta web tiene permanencia de {meses} meses.
        </p>
      </div>
    </div>
  );
}

function Linea({ clave, valor, sufijo, destacado }: { clave: string; valor: string; sufijo?: string; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-acero-20 py-3 last:border-0">
      <dt className={destacado ? "text-[0.98rem] font-medium" : "text-[0.95rem] text-acero-50"}>
        {clave} {sufijo && <span className="cota text-acero-30">· {sufijo}</span>}
      </dt>
      <dd className={`medida text-right ${destacado ? "text-[1.5rem] font-medium" : "text-[1.05rem]"}`}>{valor}</dd>
    </div>
  );
}

function LineaOscura({ clave, valor }: { clave: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-tinta-60 py-2.5 last:border-0">
      <dt className="text-[0.92rem] text-acero-30">{clave}</dt>
      <dd className="medida text-right text-[1.15rem] font-medium text-acero-00">{valor}</dd>
    </div>
  );
}
