/**
 * ID de medición de Google Analytics 4 de labarberiamataro.com.
 * No es un secreto (viaja en el HTML). La variable de entorno, si existe, manda.
 * El aviso de cookies, la carga de gtag y la política de cookies leen ESTA
 * constante: si se vacía, desaparecen a la vez el aviso, Google y su mención.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-G170PDKSFB";
