---
name: La Barbería
description: Barbería con centro de citas propio, vestida como la lámina técnica de números de peine que cuelga junto al espejo.
colors:
  acero-00: "#f1f3f4"
  acero-05: "#e6e8ea"
  acero-10: "#d6dadd"
  acero-20: "#c2c8cc"
  acero-30: "#a7b0b6"
  acero-50: "#4e575e"
  tinta: "#14171a"
  tinta-80: "#22272c"
  tinta-60: "#39424a"
  bermellon: "#c22e10"
  bermellon-vivo: "#e84520"
  bermellon-hondo: "#8e2109"
  bermellon-papel: "#fbe0d8"
  bermellon-humo: "#f4d9d1"
typography:
  display:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.9rem, 12.8vw, 9.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  medida:
    fontFamily: "Martian Mono, ui-monospace, 'SF Mono', monospace"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  cota:
    fontFamily: "Martian Mono, ui-monospace, 'SF Mono', monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  carta: "2px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "1.75rem"
  seccion: "4rem"
  seccion-amplia: "6rem"
components:
  boton-principal:
    backgroundColor: "{colors.bermellon}"
    textColor: "#ffffff"
    typography: "{typography.display}"
    rounded: "0px"
    padding: "1rem 2rem"
  boton-principal-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "#ffffff"
  boton-cota:
    backgroundColor: "{colors.tinta}"
    textColor: "#ffffff"
    typography: "{typography.cota}"
    rounded: "0px"
    padding: "0.625rem 1rem"
  campo:
    backgroundColor: "{colors.acero-00}"
    textColor: "{colors.tinta}"
    rounded: "0px"
    padding: "0.75rem 1rem"
  hueco-libre:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    typography: "{typography.medida}"
    rounded: "0px"
    padding: "0.625rem 1rem"
  hueco-libre-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "#ffffff"
---

# DESIGN.md · La Barbería

## Overview

El mundo es **la lámina de números de peine que cuelga junto al espejo del
barbero**: papel gris acero, dos tintas, y medidas por todas partes. No es una
decoración: la tesis del producto es que *la agenda es un instrumento de
medida*, y por eso el sitio dibuja el tiempo a escala en vez de listarlo.

De ahí salen las tres decisiones que mandan sobre todo lo demás:

1. **Toda cantidad se dibuja además de escribirse.** Un servicio de 45 minutos
   tiene una barra el doble de larga que uno de 20. El día tiene una regla
   graduada donde cada hueco libre es una marca real leída de la base de datos.
2. **Dos tintas y nada más.** Negro y bermellón sobre papel acero. El bermellón
   ocupa campos enteros a sangre, no filetes ni acentos sueltos.
3. **La cifra siempre en monoespaciada.** Precios, horas, duraciones, teléfonos
   y referencias van en Martian Mono, alineados por columna. El texto corrido
   nunca.

Es una superficie clara a propósito: se usa de pie en la calle y en el
mostrador de una barbería con luz de tienda, no de noche en un sofá.

## Colors

**Estrategia: comprometida.** Un color saturado —el bermellón— gobierna
regiones enteras: la portada, las cabeceras de todas las páginas, el cierre de
página y el instrumento de la agenda. El resto es papel y tinta.

| Rol | Token | Uso |
|---|---|---|
| Papel | `acero-05` `#e6e8ea` | Fondo de todo el sitio |
| Papel claro | `acero-00` `#f1f3f4` | Campos de formulario, fichas |
| Panel | `acero-10` `#d6dadd` | Bloques que se separan del papel |
| Filete | `acero-20` `#c2c8cc` | Reglas de tabla y separadores |
| Tinta | `tinta` `#14171a` | Texto principal (14.6:1) y campos negros |
| Tinta secundaria | `acero-50` `#4e575e` | Texto de apoyo (6.0:1 sobre papel) |
| Segunda tinta | `bermellon` `#c22e10` | Campos, acciones, cifras señaladas (4.6:1) |
| Segunda tinta viva | `bermellon-vivo` `#e84520` | Solo sobre negro (4.5:1); nunca sobre papel |
| Papel teñido | `bermellon-papel` `#fbe0d8` | Texto secundario sobre campo bermellón (4.5:1) |

**Los contrastes están calculados, no estimados.** `acero-30` y
`bermellon-vivo` no llegan a 4.5:1 sobre papel: solo se usan sobre tinta.

**Color de barbero:** cada barbero tiene su color en el panel, y lo elige el
negocio. Por eso el texto que va encima **nunca** es blanco fijo: se calcula con
`tintaSobre()` (`src/lib/color.ts`), que compara la luminancia real y devuelve
la de las dos tintas que más contraste da.

## Typography

Dos familias, una para cada trabajo.

- **Archivo** (variable, eje `wdth`) es la voz. Los titulares van en la clase
  `.titular`: `font-stretch: 125%`, caja alta, `line-height: 0.92`,
  `letter-spacing: -0.025em`. Es una grotesca industrial: se ensancha sin
  volverse decorativa, que es exactamente lo que hace el rótulo de una lámina.
- **Martian Mono** es la medida. Dos tamaños fijos:
  - `.cota` (0.6875rem, `letter-spacing: 0.14em`, caja alta) para rotular una
    cifra, como la etiqueta de una cota en un plano.
  - `.medida` (`font-variant-numeric: tabular-nums`) para la cifra en sí.

**Escala de titulares**, toda con `clamp()` y `text-wrap: balance`:

| Nivel | Tamaño |
|---|---|
| Portada | `clamp(2.9rem, 12.8vw, 9.5rem)` |
| Cabecera de página | `clamp(2.6rem, 10vw, 6rem)` |
| Sección | `clamp(2.4rem, 7vw, 4.5rem)` |
| Bloque | `clamp(1.8rem, 5vw, 2.6rem)` |
| Ficha | `1.25rem` – `2rem` |

Medida del texto corrido: 52–58 caracteres (`max-w-[54ch]` y vecinos).
`line-height: 1.65` en cuerpo, `1.75` en las páginas legales.

## Layout

- Ancho máximo `86rem`, con `px-4 / sm:px-6 / lg:px-10`.
- Ritmo vertical de sección: `py-16` en móvil, `py-24` a partir de `sm`.
- **Más aire encima de un título que debajo**: los titulares de sección llevan
  `border-b-2 border-tinta` con `pb-4`, y la sección anterior cierra con `mt-14`.
- **Rejillas por filete, no por hueco.** Los grupos usan `gap-px` sobre
  `bg-acero-20`: el separador es la propia rejilla, como las líneas de una
  tabla impresa.
- Lo que no cabe (agenda del panel, tira de días, tablas de citas) va en su
  propio `overflow-x-auto`. **La página nunca se desplaza en horizontal**:
  verificado en 15 rutas × 5 anchos (320–768 px).

## Elevation & Depth

Casi plano, como el papel. Solo dos sombras, ambas con desplazamiento y
difuminado —nunca un halo de color centrado:

- `.sombra-carta` — `0 1px 2px rgba(20,23,26,.06), 0 8px 24px -12px rgba(20,23,26,.28)`
- `.sombra-alzada` — `0 2px 4px rgba(20,23,26,.08), 0 18px 40px -16px rgba(20,23,26,.34)`

La jerarquía la hace el **filete**, no la sombra: `border-2 border-tinta` marca
lo que importa (la ficha de la cita, el instrumento de la agenda, el resguardo).

## Shapes

**Esquinas vivas.** El radio del sistema es `2px` y en la práctica casi todo va
a `0`. Es tinta sobre papel: no hay nada redondeado en una lámina impresa.

Iconos: SVG propios en `src/componentes/Iconos.tsx`, trazo `1.5`,
`stroke-linecap: square`, `stroke-linejoin: miter`, retícula de 24. Ni un emoji
ni un glifo Unicode haciendo de icono.

## Components

**La regla del día** (`ReglaDelDia`) es la pieza firma. Un bloque enmarcado con
`border-2 border-white/35` sobre campo bermellón que contiene, en este orden:
cabecera con la fecha y el recuento, la regla graduada, las primeras horas
tocables y —cerrándolo por abajo— la propia acción de reservar. La graduación
menor es `.graduacion` (`repeating-linear-gradient` con `--paso` calculado a
partir del intervalo real de la agenda). La franja del día ya cerrada se raya en
diagonal: sin ella, una regla vacía por la izquierda parece un fallo.

**La barra de duración** acompaña a cada servicio: ancho proporcional a la
duración máxima de la carta, altura `0.625rem`, siempre en bermellón, con la
cifra en `.cota` al lado. Aparece igual en la portada, en la carta y en el paso
1 de la reserva.

**Diagrama de cabeza** (`DiagramaCabeza`): sustituye a la foto de archivo del
barbero. Perfil dibujado, bandas de degradado teñidas del color del barbero y
línea de corte discontinua en tinta con las cotas de número de peine. Tres
variantes según la altura del degradado.

**Botones.** Tres tonos y ninguna variante más: `principal` (campo tinta que
pasa a bermellón), `borde` (filete de tinta que se invierte al pasar por
encima) y `peligro` (filete bermellón que se rellena). Todos con
`transition-colors`, sin escalado ni elevación al pasar.

**Alertas y avisos.** Fondo `bermellon-humo` con **filete superior**
`border-t-2 border-bermellon`. Nunca un filete lateral de color.

**Motion.** Una sola entrada orquestada: `.banda` revela por bandas de arriba
abajo con `clip-path` y `cubic-bezier(0.16, 1, 0.3, 1)`, escalonada con
`--retardo`. No hay una segunda animación de entrada repetida en cada sección;
el resto del movimiento son transiciones de color de 200–300 ms y el
desplazamiento de 4 px de las flechas. Todo se apaga con
`prefers-reduced-motion`.

## Do's and Don'ts

**Sí**

- Dibujar toda cantidad además de escribirla: si hay una cifra, hay una escala.
- Enseñar el dato real antes de pedir nada. La portada abre con los huecos
  libres de verdad, no con una promesa.
- Separar con filete y con espacio; el color es para campos enteros.
- Calcular el contraste cuando el color lo elige el usuario (`tintaSobre`).
- Meter lo ancho en su propio `overflow-x-auto`.

**No**

- Ni una franja lateral de color en tarjetas, listas o avisos.
- Ni antetítulos ni ristras de tarjetas iguales de título+texto como andamio de
  la página: eso se cuenta en un bloque rayado.
- Ni sombras duras sin difuminar, ni texto con degradado, ni cristales.
- Ni monoespaciada como disfraz de «técnico»: solo para cifras y medidas.
- Ni dorado sobre negro con foto de barbería a sangre. Es lo que hace todo el
  sector y es justo lo que esta identidad rechaza.
- Ni retícula decorativa de fondo: la graduación vive dentro de los
  instrumentos que miden algo.
