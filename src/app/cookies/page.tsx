import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, PaginaTexto } from "@/componentes/PaginaTexto";
import { CambiarPermisoRecaptcha } from "@/componentes/Recaptcha";
import { LEGAL, NEGOCIO } from "@/datos/negocio";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Qué guarda esta web en tu navegador. ${NEGOCIO.nombreLargo}.`,
};

/**
 * Si no hay clave de reCAPTCHA configurada, esta página no habla de reCAPTCHA:
 * declarar una cookie que no se pone sería tan falso como callar una que sí.
 */
const CON_RECAPTCHA = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

export default function Cookies() {
  return (
    <PaginaTexto
      titulo="Cookies"
      entradilla="Qué guarda esta web en tu navegador. Menos de lo que te esperas."
    >
      <Apartado titulo="No hay banner porque no hay nada que consentir al entrar">
        <p>
          Esta web <strong>no usa cookies de publicidad ni de analítica</strong>.
          No hay Google Analytics, ni píxel de Facebook, ni nada que siga tus
          pasos por otros sitios. Por eso no verás el cartelito de aceptar
          cookies nada más entrar: la ley solo obliga a pedir permiso para las
          que no son imprescindibles, y navegando por aquí no se pone ninguna.
        </p>
        {CON_RECAPTCHA && (
          <p>
            La única excepción está en los tres formularios —reservar hora,
            escribirnos y pedir información sobre la web— y ahí{" "}
            <strong>se pide permiso antes</strong>, en el propio formulario y
            solo a quien va a enviarlo. Está contado justo debajo.
          </p>
        )}
      </Apartado>

      <Apartado titulo="Lo único que se guarda por nuestra parte">
        <ul>
          <li>
            <strong>
              <code>lb_sesion</code>
            </strong>{" "}
            — solo si el personal de la barbería entra en el panel de gestión.
            Sirve para mantener la sesión abierta y caduca a los catorce días.
            Un cliente que solo reserva hora nunca la recibe.
          </li>
          <li>
            <strong>
              <code>lb_video_v1</code>
            </strong>{" "}
            — tampoco es una cookie, sino una anotación en el almacenamiento
            local que recuerda que ya has visto el vídeo de bienvenida, para no
            volver a enseñártelo. Se queda en tu navegador y no viaja a ninguna
            parte.
          </li>
          {CON_RECAPTCHA && (
            <li>
              <strong>
                <code>lb_recaptcha_v1</code>
              </strong>{" "}
              — no es una cookie, es una anotación en el almacenamiento local de
              tu navegador con tu respuesta al permiso de aquí abajo (
              <code>si</code> o <code>no</code>). No sale de tu equipo y sirve
              para no volver a preguntarte. Guardar tu respuesta está exento del
              deber de consentimiento previo.
            </li>
          )}
        </ul>
        <p>
          Todas son técnicas y necesarias para que aquello funcione: no sirven
          para perfilarte ni se comparten con nadie.
        </p>
      </Apartado>

      {CON_RECAPTCHA && (
        <Apartado titulo="reCAPTCHA de Google, en los formularios y con tu permiso">
          <p>
            Los formularios de <Link href="/reservar">reservar hora</Link>,{" "}
            <Link href="/contacto">contacto</Link> y{" "}
            <Link href="/para-barberias">información para barberías</Link> pueden
            usar <strong>reCAPTCHA v3 de Google</strong> para distinguir a una
            persona de un programa que rellena formularios en cadena. Sirve para
            que la agenda no se llene de citas falsas que dejan sin hueco a
            clientes reales.
          </p>
          <ul>
            <li>
              <strong>Qué cookie pone:</strong> <code>_GRECAPTCHA</code>, del
              dominio <code>google.com</code>, con una duración aproximada de
              seis meses. La pone Google, no nosotros, y solo aparece si dices
              que sí.
            </li>
            <li>
              <strong>Qué recibe Google:</strong> tu dirección IP, la página
              desde la que envías y cómo te has movido por ella (ratón, toques,
              teclado). Con eso calcula una puntuación de 0 a 1. Nosotros solo
              vemos esa puntuación, nunca los datos con los que se calcula.
            </li>
            <li>
              <strong>Base jurídica:</strong> tu consentimiento, que pedimos en
              el propio formulario antes de cargar nada. Hasta que dices que sí,
              en esta web{" "}
              <strong>no hay ni una sola petición a servidores de Google</strong>.
            </li>
            <li>
              <strong>Transferencia internacional:</strong> Google LLC está en
              Estados Unidos y trata los datos al amparo del Marco de
              Privacidad de Datos UE-EE. UU.
            </li>
          </ul>
          <p>
            <strong>Decir que no no te cierra ninguna puerta.</strong> El
            formulario se envía igual, tu cita se coge igual y tu mensaje llega
            igual: lo único que cambia es que lo miramos a mano antes de darlo
            por bueno. Rechazar cuesta exactamente lo mismo que aceptar, un
            clic, y ninguna de las dos respuestas te hace repetir nada.
          </p>
          <p>
            Condiciones de Google:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad
            </a>{" "}
            y{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              condiciones del servicio
            </a>
            .
          </p>
        </Apartado>
      )}

      {CON_RECAPTCHA && (
        <Apartado titulo="Cambiar de idea">
          <p>
            Retirar el permiso tiene que costar lo mismo que darlo, así que está
            aquí, en un botón. Si lo retiras, la próxima vez que envíes un
            formulario te lo volveremos a preguntar. La cookie{" "}
            <code>_GRECAPTCHA</code> la pone Google en tu navegador y se borra
            desde los ajustes de tu navegador, como cualquier otra.
          </p>
          <CambiarPermisoRecaptcha />
        </Apartado>
      )}

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
          consentir por el mero hecho de navegar.
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
