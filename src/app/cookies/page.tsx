import type { Metadata } from "next";
import Link from "next/link";
import { Apartado, PaginaTexto } from "@/componentes/PaginaTexto";
import { BotonPreferencias } from "@/componentes/AvisoCookies";
import { CambiarPermisoRecaptcha } from "@/componentes/Recaptcha";
import { LEGAL, NEGOCIO } from "@/datos/negocio";
import { GA_ID } from "@/lib/ga";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Qué guarda esta web en tu navegador. ${NEGOCIO.nombreLargo}.`,
};

/**
 * Si no hay clave de reCAPTCHA configurada, esta página no habla de reCAPTCHA:
 * declarar una cookie que no se pone sería tan falso como callar una que sí.
 */
const CON_RECAPTCHA = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

/** Lo mismo con Google Analytics: sin GA_ID, ni aviso ni mención. */
const CON_ANALITICA = Boolean(GA_ID);

export default function Cookies() {
  return (
    <PaginaTexto
      titulo="Cookies"
      entradilla="Qué guarda esta web en tu navegador. Menos de lo que te esperas."
    >
      {CON_ANALITICA ? (
        <Apartado titulo="Nada de Google hasta que dices que sí">
          <p>
            Esta web <strong>no usa cookies de publicidad</strong> ni píxeles de
            redes sociales. Lo único que puede medir tu visita es{" "}
            <strong>Google Analytics</strong>, y solo si pulsas «Aceptar» en el
            aviso de cookies. Hasta entonces no se carga ningún script de Google
            ni se instala ninguna cookie suya. «Rechazar» cuesta lo mismo que
            «Aceptar», y seguir navegando sin contestar no cuenta como un sí.
          </p>
          {CON_RECAPTCHA && (
            <p>
              Aparte está el filtro antirrobots de los tres formularios
              —reservar hora, escribirnos y pedir información sobre la web—, que
              también <strong>pide permiso antes</strong>, en el propio
              formulario y solo a quien va a enviarlo. Está contado más abajo.
            </p>
          )}
        </Apartado>
      ) : (
        <Apartado titulo="No hay banner porque no hay nada que consentir al entrar">
          <p>
            Esta web <strong>no usa cookies de publicidad ni de analítica</strong>.
            Por eso no verás el cartelito de aceptar cookies nada más entrar: la
            ley solo obliga a pedir permiso para las que no son imprescindibles,
            y navegando por aquí no se pone ninguna.
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
      )}

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
              <code>lb_video_v2</code>
            </strong>{" "}
            — tampoco es una cookie, sino una anotación en el almacenamiento
            local que recuerda que ya has visto el vídeo de bienvenida, para no
            volver a enseñártelo. Se queda en tu navegador y no viaja a ninguna
            parte.
          </li>
          {CON_ANALITICA && (
            <li>
              <strong>
                <code>lb_estadisticas_v1</code>
              </strong>{" "}
              — no es una cookie, es una anotación en el almacenamiento local de
              tu navegador con tu respuesta al aviso de estadísticas. No sale de
              tu equipo y sirve para no volver a preguntarte.
            </li>
          )}
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

      {CON_ANALITICA && (
        <Apartado titulo="Google Analytics, solo si lo aceptas">
          <p>
            Si pulsas «Aceptar» en el aviso, usamos{" "}
            <strong>Google Analytics 4</strong> para saber cuánta gente visita la
            web y qué páginas mira, de forma agregada. El servicio lo presta{" "}
            <strong>Google Ireland Limited</strong> (Gordon House, Barrow Street,
            Dublín 4, Irlanda). Estas son las cookies que pone:
          </p>
          <ul>
            <li>
              <strong>
                <code>_ga</code>
              </strong>{" "}
              — distingue a un visitante de otro sin saber quién es. Dura 2 años.
            </li>
            <li>
              <strong>
                <code>_ga_{GA_ID.replace(/^G-/, "")}</code>
              </strong>{" "}
              — mantiene el estado de la visita. Dura 2 años.
            </li>
          </ul>
          <p>
            Según Google, Analytics 4 no guarda las direcciones IP. Google puede tratar
            datos fuera del Espacio Económico Europeo al amparo del Marco de
            Privacidad de Datos UE-EE. UU.
          </p>
          <p>
            <strong>Cambiar de idea:</strong> con este botón, o con
            «Preferencias de cookies» en el pie de cualquier página, vuelve a
            salir el aviso. Si retiras el permiso, borramos las cookies de
            Google y la página se recarga.
          </p>
          <BotonPreferencias className="cota inline-flex w-fit bg-tinta px-5 py-3 text-white transition-colors hover:bg-bermellon" />
        </Apartado>
      )}

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
