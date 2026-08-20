/**
 * TODO lo que cambia al vender esta web a otra barbería está en este archivo.
 * Ni un dato del negocio vive esparcido por los componentes.
 *
 * Los campos marcados con  // DEMO  son contenido de ejemplo: no corresponden a
 * ningún local real. Mientras DEMO sea true, la web enseña un aviso discreto
 * diciéndolo, para que nadie confunda la maqueta con una ficha de negocio real.
 */

export const DEMO = true;

export const NEGOCIO = {
  nombre: "La Barbería",
  nombreLargo: "La Barbería Mataró",
  reclamo: "Barbería clásica, acabado moderno",
  descripcion:
    "Corte, degradado y arreglo de barba con técnica de barbería tradicional y acabado actual. Cita previa online, sin esperas.",

  telefono: "645 505 387",
  telefonoE164: "+34645505387",
  whatsapp: "+34645505387",
  email: "info@labarberiamataro.com",

  // Dirección comercial del local. VACÍA a propósito: no hay local todavía y
  // una calle inventada en un dominio real acaba con alguien plantado en una
  // puerta que no existe. Toda la interfaz sabe pintarse sin ella.
  direccion: "",
  codigoPostal: "08301",
  ciudad: "Mataró",
  provincia: "Barcelona",
  pais: "España",
  // DEMO — recuadro aproximado del centro de Mataró, no del local.
  // OpenStreetMap a propósito: el iframe de Google planta cookies de terceros
  // antes de que nadie acepte el banner. Al vender la web, cambiar el bbox y
  // el marcador por las coordenadas reales del local.
  mapa:
    "https://www.openstreetmap.org/export/embed.html?bbox=2.4347%2C41.5331%2C2.4547%2C41.5431&layer=mapnik&marker=41.5381%2C2.4447",

  instagram: "https://www.instagram.com/labarberiamataro/",
  facebook: "",
  fichaGoogle: "",

  // Se enseña en la web. La agenda real la mandan los horarios de cada barbero
  // guardados en la base de datos, no este texto.
  horarioTexto: [
    { dias: "Lunes a viernes", horas: "09:30 – 20:00" },
    { dias: "Sábado", horas: "09:30 – 14:00" },
    { dias: "Domingo", horas: "Cerrado" },
  ],
} as const;

export const LEGAL = {
  // Datos REALES de la sociedad que publica esta web. No son de ejemplo:
  // responden legalmente de ella aunque la barbería sea una maqueta.
  titular: "Dependalium Global Services, S.L.",
  nif: "B26786962",

  // Domicilio SOCIAL, el inscrito. NO es la dirección del local, y mezclarlos
  // es el error de siempre: el aviso legal y la privacidad tienen que declarar
  // este (art. 10 LSSI-CE), mientras que el pie, la página de contacto y el
  // JSON-LD enseñan la dirección comercial (NEGOCIO.direccion).
  domicilioSocial: "Baixada de les Espenyes, 6, 1º · 08301 Mataró (Barcelona)",

  // Redacción literal que quiere el titular, con sus mayúsculas. No reformatear.
  registroMercantil:
    "Sociedad inscrita en el Registro Mercantil de Barcelona, Tomo 100046, Folio 219, Hoja B-561219, Inscripción 1ª",

  emailContacto: "info@dependalium.com",
  telefono: "645 505 387",
  telefonoE164: "+34645505387",

  // Región donde corren las funciones (fijada en vercel.json). Si se cambia
  // allí, hay que cambiarla aquí: alimenta el aviso legal y la privacidad.
  alojamiento: "Vercel Inc., región de Fráncfort (fra1), Unión Europea",
  proveedorBaseDatos: "Neon, región de Fráncfort (eu-central-1), Unión Europea",
} as const;

/**
 * Quién vende esta web y qué se vende. Solo aplica mientras DEMO sea true:
 * cuando la web se instala en una barbería de verdad, todo esto desaparece.
 *
 * NADA de lo que hay aquí es inventado. El precio y el plazo están vacíos a
 * propósito: son afirmaciones comerciales y las pone el titular, no yo.
 */
export const AGENCIA = {
  // Marca comercial, NO razón social. Creaar es el nombre con el que se venden
  // las webs; la sociedad que responde de todo es la de LEGAL, la misma para
  // las dos marcas (mismo NIF, B26786962). Los textos legales no cambian.
  nombre: "Creaar",
  web: "https://creaar.es",
  telefono: "645 505 387",
  telefonoE164: "+34645505387",
  whatsapp: "+34645505387",
  email: "info@dependalium.com",

  /**
   * Alta + cuota. Se cobra así y no de una vez porque los costes son
   * mensuales (alojamiento, base de datos, buzón y sobre todo soporte) y
   * porque el barbero compara contra lo que ya paga a Booksy cada mes, no
   * contra un cheque grande.
   *
   * Los importes van SIN IVA a propósito: el comprador es una empresa, y
   * entre empresas el precio se anuncia sin IVA. A consumidor final sería al
   * revés y habría que enseñarlo con el IVA incluido.
   *
   * Vacíos = no se enseña el bloque de precio y el formulario pide presupuesto.
   */
  precioAlta: "299 €",
  precioMensual: "89 €",
  permanenciaMeses: 12,
  /** Vacío = no se promete plazo de entrega. */
  plazo: "",

  /** Qué cubre cada una de las dos cifras. */
  cubreElAlta: [
    "Instalación con tu nombre, tus servicios, tus precios y tu equipo",
    "Tu dominio conectado y el certificado de seguridad",
    "Correo de confirmación saliendo desde tu propia dirección",
    "Textos legales escritos y una sesión para enseñarte el panel",
  ],
  cubreLaCuota: [
    "Alojamiento, base de datos y copias",
    "Las reservas, sin comisión por cita y sin límite de citas",
    "Soporte por teléfono y WhatsApp cuando algo no cuadra",
    "Actualizaciones y arreglos sin coste añadido",
  ],

  /** Lo que la web hace de verdad. Verificable abriendo esta misma página. */
  incluye: [
    {
      titulo: "Reservas propias, sin comisión por cita",
      texto:
        "La agenda es tuya y vive en tu web. No pagas un porcentaje por cada cliente que reserva ni compartes tus clientes con un directorio donde está la competencia.",
    },
    {
      titulo: "Panel para el mostrador",
      texto:
        "El día a la vista, un sillón por columna. Apuntas la cita del que entra por la puerta, la mueves de hora, la anulas o marcas quién no vino.",
    },
    {
      titulo: "Tus servicios, tus precios, tu horario",
      texto:
        "Carta con duración y precio, horario de cada barbero con turno partido, vacaciones y cierres puntuales. Todo se cambia desde el panel, sin llamar a nadie.",
    },
    {
      titulo: "Nunca dos citas en el mismo sillón",
      texto:
        "El hueco se comprueba en el servidor al confirmar. Si dos personas pinchan la misma hora a la vez, una se lleva el aviso de que ya está cogida.",
    },
    {
      titulo: "Confirmación por correo",
      texto:
        "El cliente recibe su resguardo y un enlace para anular él mismo, que libera el hueco. Sale desde el correo de tu propio dominio.",
    },
    // OJO: esta viñeta describe el montaje real. Si algún día se instala
    // analítica, deja de ser cierta y hay que reescribirla junto con /cookies.
    {
      titulo: "Sin banner de cookies",
      texto:
        "No lleva analítica ni rastreadores, así que nadie se encuentra el cartel de aceptar cookies al entrar. Lo único de terceros es el filtro antirrobots de los formularios, y ahí se pide permiso antes de cargar nada. Aviso legal, privacidad y política de cookies vienen escritos.",
    },
  ],
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export function precio(centimos: number): string {
  return (centimos / 100)
    .toLocaleString("es-ES", { style: "currency", currency: "EUR" })
    .replace(/\s/g, " ");
}

/** Dirección para enseñar. Sin calle, se queda en la ciudad. */
export function direccionCompleta(): string {
  const linea = [NEGOCIO.direccion, `${NEGOCIO.codigoPostal} ${NEGOCIO.ciudad}`]
    .filter(Boolean)
    .join(", ");
  return linea;
}

/** Dónde se atiende, en una línea corta. */
export function zonaDeServicio(): string {
  return `${NEGOCIO.ciudad} · ${NEGOCIO.provincia}`;
}

export function duracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
