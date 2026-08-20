/**
 * Genera los iconos del sitio a partir de una imagen cuadrada a sangre.
 *
 *   node scripts/iconos.mjs <origen.png>
 *
 * Al instalar la web en una barbería de verdad, se le pasa su marca y se
 * vuelve a correr. Escribe:
 *   src/app/favicon.ico   16 + 32 + 48 · lo que usan Google, los marcadores
 *                         y los navegadores viejos
 *   src/app/icon.png      512 · el que declara Next para la pestaña
 *   src/app/apple-icon.png 180 · iOS NO lee SVG; sin este, al añadir a la
 *                         pantalla de inicio el icono sale en blanco
 *
 * Los tres van OPACOS y a sangre: Android le mete su propia máscara encima y,
 * si el origen ya trae las esquinas redondeadas, lo recorta dos veces.
 *
 * `sharp` no hace falta instalarlo: ya está en node_modules porque lo usa el
 * optimizador de imágenes de Next.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

/** La tinta de la casa. El fondo se iguala a ella para que no baile. */
const BERMELLON = { r: 0xc2, g: 0x2e, b: 0x10 };

const origen = process.argv[2];
if (!origen) {
  console.error("Uso: node scripts/iconos.mjs <origen.png>");
  process.exit(1);
}

/**
 * `flatten` pega el fondo pero SE LLEVA el canal alfa, y el decodificador de
 * `.ico` de Next lo rechaza en el build con «The PNG is not in RGBA format!».
 * `ensureAlpha` lo devuelve, opaco: el icono sigue a sangre y el build pasa.
 */
const base = (px) =>
  sharp(origen)
    .resize(px, px, { fit: "cover" })
    .flatten({ background: BERMELLON })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

/** Empaqueta varios PNG en un .ico a mano: cabecera de 6 bytes + 16 por entrada. */
function empaquetarIco(imagenes) {
  const n = imagenes.length;
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(n, 4);

  const entradas = Buffer.alloc(16 * n);
  let desplazamiento = 6 + 16 * n;
  imagenes.forEach(({ px, datos }, i) => {
    const e = i * 16;
    entradas.writeUInt8(px === 256 ? 0 : px, e + 0); // 0 significa 256
    entradas.writeUInt8(px === 256 ? 0 : px, e + 1);
    entradas.writeUInt8(0, e + 2); // paleta
    entradas.writeUInt8(0, e + 3); // reservado
    entradas.writeUInt16LE(1, e + 4); // planos
    entradas.writeUInt16LE(32, e + 6); // bits por píxel
    entradas.writeUInt32LE(datos.length, e + 8);
    entradas.writeUInt32LE(desplazamiento, e + 12);
    desplazamiento += datos.length;
  });

  return Buffer.concat([cabecera, entradas, ...imagenes.map((x) => x.datos)]);
}

const paraIco = [];
for (const px of [16, 32, 48]) paraIco.push({ px, datos: await base(px) });
await writeFile("src/app/favicon.ico", empaquetarIco(paraIco));
await writeFile("src/app/icon.png", await base(512));
await writeFile("src/app/apple-icon.png", await base(180));

console.log("favicon.ico    16 + 32 + 48");
console.log("icon.png       512");
console.log("apple-icon.png 180");
