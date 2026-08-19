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

  instagram: "",
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
