import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, PaginaTexto } from "@/componentes/PaginaTexto";
import { DEMO, LEGAL, NEGOCIO, SITE_URL } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: `Titular, condiciones de uso y responsabilidad del sitio web de ${NEGOCIO.nombreLargo}.`,
  robots: { index: true, follow: true },
};

export default function AvisoLegal() {
  const dominio = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <PaginaTexto
      titulo="Aviso legal"
      entradilla="Quién hay detrás de esta web y en qué condiciones se usa."
    >
      {DEMO && (
        <p className="mb-8 border-t-2 border-bermellon bg-bermellon-humo px-4 py-3 text-[0.92rem] leading-relaxed">
          <strong>Esta web es una demostración.</strong> Los datos del titular
          que figuran aquí son reales y responden de este sitio; lo que es de
          ejemplo es la barbería: la dirección del local, los precios, el equipo
          y las imágenes no corresponden a ningún negocio existente.
        </p>
      )}

      <Apartado titulo="Titular del sitio">
        <ul>
          <li>
            <strong>Titular:</strong> {LEGAL.titular}
          </li>
          <li>
            <strong>NIF:</strong> {LEGAL.nif}
          </li>
          <li>
            <strong>Domicilio social:</strong> {LEGAL.domicilioSocial}
          </li>
          <li>
            <strong>Datos registrales:</strong> {LEGAL.registroMercantil}
          </li>
          <li>
            <strong>Correo:</strong>{" "}
            <a href={`mailto:${LEGAL.emailContacto}`}>{LEGAL.emailContacto}</a>
          </li>
          <li>
            <strong>Teléfono:</strong> {LEGAL.telefono}
          </li>
          <li>
            <strong>Sitio web:</strong> {dominio}
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Qué se puede hacer aquí">
        <p>
          Esta web informa de los servicios de {NEGOCIO.nombreLargo} y permite
          reservar cita. La reserva no supone ningún pago: el servicio se abona
          en el local una vez prestado.
        </p>
        <p>
          Para reservar hay que dar datos ciertos. Una reserva hecha con datos
          falsos puede anularse sin aviso, porque ocupa un hueco que otra persona
          podría estar usando.
        </p>
      </Apartado>

      <Apartado titulo="Anulaciones">
        <p>
          Cualquier cita se puede anular desde el enlace del correo de
          confirmación o llamando al {NEGOCIO.telefono}. Anularla con tiempo
          libera el hueco; no anularla no genera ningún cargo, pero sí deja el
          sillón parado.
        </p>
      </Apartado>

      <Apartado titulo="Contenidos y propiedad intelectual">
        <p>
          Los textos, las imágenes, los dibujos y el diseño de esta web
          pertenecen a su titular o se usan con permiso. Se pueden compartir
          enlaces libremente; reproducir el contenido en otro sitio, no, sin
          permiso por escrito.
        </p>
      </Apartado>

      <Apartado titulo="Responsabilidad">
        <p>
          Cuidamos de que lo que aquí se publica sea correcto, pero los precios y
          horarios pueden cambiar. Los que mandan son los del propio local en el
          momento de la visita.
        </p>
        <p>
          Tampoco respondemos de interrupciones del servicio por causas ajenas
          (caídas de la red, del alojamiento o mantenimientos), aunque se
          intentan reducir al mínimo.
        </p>
      </Apartado>

      <Apartado titulo="Legislación y juzgados">
        <p>
          Esta relación se rige por la ley española. Para cualquier disputa, y
          salvo que la ley imponga otro fuero por tratarse de una persona
          consumidora, las partes se someten a los juzgados de{" "}
          {NEGOCIO.provincia}.
        </p>
      </Apartado>

      <Apartado titulo="Más información">
        <p>
          Cómo tratamos tus datos está en la{" "}
          <Link href="/privacidad">política de privacidad</Link>, y qué guardamos
          en tu navegador, en la <Link href="/cookies">política de cookies</Link>.
        </p>
      </Apartado>
    </PaginaTexto>
  );
}
