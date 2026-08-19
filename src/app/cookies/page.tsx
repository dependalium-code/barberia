import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, PaginaTexto } from "@/componentes/PaginaTexto";
import { LEGAL, NEGOCIO } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Qué guarda esta web en tu navegador. ${NEGOCIO.nombreLargo}.`,
};

export default function Cookies() {
  return (
    <PaginaTexto
      titulo="Cookies"
      entradilla="Qué guarda esta web en tu navegador. Menos de lo que te esperas."
    >
      <Apartado titulo="No hay banner porque no hace falta">
        <p>
          Esta web <strong>no usa cookies de publicidad ni de analítica</strong>.
          No hay Google Analytics, ni píxel de Facebook, ni nada que siga tus
          pasos por otros sitios. Por eso no verás el cartelito de aceptar
          cookies: la ley solo obliga a pedir permiso para las que no son
          imprescindibles, y aquí no hay ninguna.
        </p>
      </Apartado>

      <Apartado titulo="Lo único que se guarda">
        <ul>
          <li>
            <strong>
              <code>lb_sesion</code>
            </strong>{" "}
            — solo si el personal de la barbería entra en el panel de gestión.
            Sirve para mantener la sesión abierta y caduca a los catorce días.
            Un cliente que solo reserva hora nunca la recibe.
          </li>
        </ul>
        <p>
          Es una cookie técnica, necesaria para que el panel funcione, y está
          exenta del deber de consentimiento previo.
        </p>
      </Apartado>

      <Apartado titulo="El mapa">
        <p>
          El mapa de la página de contacto se carga desde OpenStreetMap, que no
          instala cookies de seguimiento. Se eligió por eso, en lugar del mapa de
          Google, que sí las pone antes de que nadie acepte nada.
        </p>
      </Apartado>

      <Apartado titulo="Si añades analítica más adelante">
        <p>
          Si algún día se instala una herramienta de medición, esta página deja
          de ser cierta y hay que poner un banner de consentimiento en condiciones,
          con rechazo tan fácil como la aceptación. Mientras tanto, no hay nada que
          consentir.
        </p>
      </Apartado>

      <Apartado titulo="Más información">
        <p>
          Cómo tratamos tus datos personales está en la{" "}
          <Link href="/privacidad">política de privacidad</Link>. Para cualquier
          duda:{" "}
          <a href={`mailto:${LEGAL.emailContacto}`}>{LEGAL.emailContacto}</a>.
        </p>
      </Apartado>
    </PaginaTexto>
  );
}
