import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, PaginaTexto } from "@/componentes/PaginaTexto";
import { DEMO, LEGAL, NEGOCIO } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos pedimos al reservar, para qué los usamos y cómo ejercer tus derechos. ${NEGOCIO.nombreLargo}.`,
};

export default function Privacidad() {
  return (
    <PaginaTexto
      titulo="Privacidad"
      entradilla="Qué te pedimos, para qué lo usamos y cómo borrarlo."
    >
      {DEMO && (
        <p className="mb-8 border-t-2 border-bermellon bg-bermellon-humo px-4 py-3 text-[0.92rem] leading-relaxed">
          <strong>Web de demostración.</strong> El responsable del tratamiento
          es real y esta política se aplica de verdad a los datos que dejes
          aquí. De ejemplo son la barbería, su dirección, sus precios y su
          equipo.
        </p>
      )}

      <Apartado titulo="Quién responde de tus datos">
        <ul>
          <li>
            <strong>Responsable:</strong> {LEGAL.titular} · NIF {LEGAL.nif}
          </li>
          <li>
            <strong>Domicilio social:</strong> {LEGAL.domicilioSocial}
          </li>
          <li>
            <strong>Contacto:</strong>{" "}
            <a href={`mailto:${LEGAL.emailContacto}`}>{LEGAL.emailContacto}</a>
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Qué pedimos y por qué">
        <p>
          <strong>Al reservar cita:</strong> nombre y teléfono, que son
          imprescindibles para poder atenderte y avisarte si pasa algo con tu
          hora. El correo y la nota son opcionales: el correo solo sirve para
          mandarte el resguardo y el enlace con el que puedes anular tú mismo.
        </p>
        <p>
          <strong>Al escribirnos por el formulario de contacto:</strong> nombre,
          correo, y el teléfono si quieres dejarlo, para poder contestarte.
        </p>
        <p>
          No pedimos datos de pago en ningún momento: aquí no se cobra nada, se
          paga en el local.
        </p>
      </Apartado>

      <Apartado titulo="Base legal">
        <ul>
          <li>
            <strong>Gestionar tu cita:</strong> ejecución de la relación que nos
            pides al reservar (art. 6.1.b del RGPD).
          </li>
          <li>
            <strong>Contestar a tus mensajes:</strong> tu consentimiento al
            enviarlos (art. 6.1.a).
          </li>
          <li>
            <strong>Llevar el registro de citas atendidas:</strong> interés
            legítimo en la gestión ordinaria del negocio (art. 6.1.f).
          </li>
        </ul>
        <p>
          No hacemos perfilado ni decisiones automatizadas, y no te vamos a
          mandar publicidad salvo que la pidas expresamente.
        </p>
      </Apartado>

      <Apartado titulo="Cuánto tiempo los guardamos">
        <ul>
          <li>
            <strong>Citas:</strong> mientras la relación siga viva y, después,
            el tiempo necesario para atender reclamaciones o cumplir obligaciones
            fiscales y contables.
          </li>
          <li>
            <strong>Mensajes de contacto:</strong> hasta resolver lo que
            plantean, y como máximo un año.
          </li>
        </ul>
      </Apartado>

      <Apartado titulo="Quién más los ve">
        <p>
          Nadie a quien no haga falta. Los datos se guardan en los proveedores
          que hacen funcionar la web:
        </p>
        <ul>
          <li>
            <strong>Alojamiento y funciones:</strong> {LEGAL.alojamiento}.
          </li>
          <li>
            <strong>Base de datos:</strong> {LEGAL.proveedorBaseDatos}.
          </li>
          <li>
            <strong>Correo saliente:</strong> el proveedor de correo del propio
            negocio, para enviarte la confirmación de tu cita.
          </li>
        </ul>
        <p>
          No cedemos ni vendemos datos a terceros con fines comerciales, ni
          hacemos transferencias fuera del Espacio Económico Europeo.
        </p>
      </Apartado>

      <Apartado titulo="Tus derechos">
        <p>
          Puedes pedir acceso a tus datos, corregirlos, borrarlos, limitar su
          uso, oponerte al tratamiento o llevártelos a otro sitio. Basta con
          escribir a{" "}
          <a href={`mailto:${LEGAL.emailContacto}`}>{LEGAL.emailContacto}</a>{" "}
          indicando qué quieres; puede que te pidamos algo que acredite que eres
          tú, para no dárselos a quien no debe.
        </p>
        <p>
          Si crees que no lo hemos hecho bien, puedes reclamar ante la Agencia
          Española de Protección de Datos:{" "}
          <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
            aepd.es
          </a>
          .
        </p>
      </Apartado>

      <Apartado titulo="Seguridad">
        <p>
          El acceso a la agenda está protegido con contraseña y las contraseñas
          se guardan cifradas, nunca en claro. La web se sirve siempre por
          conexión segura (HTTPS).
        </p>
      </Apartado>

      <Apartado titulo="Cookies">
        <p>
          Lo que se guarda en tu navegador está explicado en la{" "}
          <Link href="/cookies">política de cookies</Link>. Adelanto: casi nada.
        </p>
      </Apartado>
    </PaginaTexto>
  );
}
