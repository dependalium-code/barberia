import type { Metadata } from "next";
import { leerAjustes } from "@/lib/agenda";
import { TituloPanel } from "../piezas";
import { FormularioAjustes } from "./Formulario";
import { NEGOCIO, direccionCompleta } from "@/datos/negocio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ajustes", robots: { index: false } };

export default async function PaginaAjustes() {
  const ajustes = await leerAjustes();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <TituloPanel>Ajustes de la agenda</TituloPanel>
      <p className="mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed text-acero-50">
        Estas reglas mandan sobre lo que la web deja reservar. Cambian al momento,
        sin tocar nada más.
      </p>

      <FormularioAjustes ajustes={ajustes} />

      <section className="mt-12 max-w-3xl border border-dashed border-acero-30 p-5">
        <h2 className="titular text-[1.2rem]">Lo que no se toca desde aquí</h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-acero-50">
          El nombre, la dirección, el teléfono, el horario que sale en la web y
          los textos legales viven en el archivo{" "}
          <code className="medida bg-acero-10 px-1.5 py-0.5 text-[0.85rem]">
            src/datos/negocio.ts
          </code>
          . Se cambian una vez, al instalar la web, y se vuelve a publicar.
        </p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            ["Negocio", NEGOCIO.nombreLargo],
            ["Teléfono", NEGOCIO.telefono],
            ["Correo", NEGOCIO.email],
            ["Dirección", direccionCompleta() || "sin calle publicada"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-acero-20 py-1.5">
              <dt className="cota text-acero-50">{k}</dt>
              <dd className="text-right text-[0.88rem]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
