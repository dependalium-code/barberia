# La Barbería · web con centro de citas

Web pública de barbería **con motor de reservas propio**. No es una landing con
un botón a Booksy: la agenda, los barberos, los horarios y las citas viven en
este proyecto, y el negocio los gobierna desde un panel privado.

Hecha para instalarse en una barbería real: todo lo que cambia de un negocio a
otro está en **un solo archivo** o en el panel.

---

## Qué hace

**Para el cliente** — `/`, `/carta`, `/equipo`, `/el-local`, `/contacto`, `/reservar`

- La portada abre enseñando los **huecos libres de verdad** del primer día con
  sitio, leídos de la base de datos.
- Reserva en cuatro pasos: servicio → barbero (o «el primero que esté libre») →
  día y hora → nombre y teléfono. Sin registro, sin tarjeta.
- Resguardo con referencia corta (`LB-XXXXX`) y enlace privado para ver o
  **anular la cita** sin llamar.
- Correo de confirmación al cliente y aviso al negocio.

**Para el mostrador** — `/panel`

| Pantalla | Para qué |
|---|---|
| Agenda | El día a la vista, una columna por sillón. Apuntar la cita del que entra por la puerta, marcar atendida o no vino, anular, mover de hora o de barbero. |
| Citas | Buscador por nombre, teléfono o referencia. Próximas, pasadas y anuladas. |
| Equipo y horarios | Alta de barberos, qué servicios hace cada uno y su horario semanal (admite turno partido). |
| Servicios | Carta con duración y precio. La duración es lo que ocupa en la agenda. |
| Cierres y vacaciones | Cerrar fechas, del local entero o de un barbero. Avisa si hay citas dentro. |
| Mensajes | Lo que llega por el formulario de contacto. |
| Ajustes | Paso de la agenda, antelación mínima, ventana de reserva, tope de citas por cliente y un aviso que sale en el formulario. |

## Lo que el motor de citas garantiza

- **Nunca dos citas en el mismo sillón.** La comprobación se rehace en el
  servidor dentro de una transacción serializable: el navegador manda día y
  hora, pero nada de eso se cree.
- **Horario correcto todo el año.** Los instantes se guardan en UTC y los
  horarios en minutos de hora local; la conversión vive en `src/lib/tiempo.ts` y
  está probada contra los dos cambios de hora.
- **Una cita nunca se pierde por culpa del correo.** Primero se guarda, después
  se avisa. Si el correo falla, la cita sigue cogida y el panel lo marca como
  «sin avisar» con el motivo.
- **El precio y la duración se congelan** en cada cita: subir la tarifa mañana
  no cambia lo que se cobró ayer.

---

## Instalar

```bash
npm install
cp .env.example .env      # y rellenarlo
npm run db:push           # crea el esquema
npm run seed:limpio       # SOLO el administrador y los ajustes
npm run dev
```

`npm run seed` (sin `:limpio`) mete además **carta y equipo de ejemplo**, que
sirven para enseñar la demo. **Al entregar la web a un cliente se usa siempre
`seed:limpio`**: no debe quedar ni un barbero ni un precio inventado.

### Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Postgres (Neon, Supabase o el que sea) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USUARIO`, `SMTP_CLAVE` | Correo saliente del propio negocio |
| `SMTP_REMITENTE` | `La Barbería <citas@dominio.com>` |
| `AVISOS_EMAIL` | Dónde llegan los avisos de cita nueva y los mensajes |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo la primera vez, para crear el acceso al panel |
| `NEXT_PUBLIC_SITE_URL` | Dominio final, sin barra al final |

Sin credenciales de correo la web **funciona igual**: las citas se cogen y se
guardan, y el panel avisa de que los correos no salen.

---

## Vender esta web a una barbería

Hay tres sitios donde tocar, y solo tres.

### 1 · `src/datos/negocio.ts`

Nombre, dirección, teléfono, WhatsApp, correo, horario que se enseña, redes,
mapa y datos del titular para las páginas legales.

**Poner `DEMO = false`.** Mientras esté en `true`:

- el pie de página avisa de que el contenido es de ejemplo,
- las páginas legales llevan un recuadro diciendo que los datos del titular no
  son reales,
- y **no se emite la ficha de negocio para Google** (`schema.org`), porque
  publicar una dirección inventada es pedirle a Google que indexe un local que
  no existe.

Los campos marcados con `// DEMO` en el archivo son los que hay que sustituir.

### 2 · El mapa

`NEGOCIO.mapa` es un `bbox` de OpenStreetMap. Hay que cambiarlo por las
coordenadas reales del local. Se usa OSM y no Google a propósito: el iframe de
Google planta cookies de terceros antes de que nadie acepte el banner, y esta
web se sirve **sin banner de cookies** porque no hay ninguna que consentir.

> Si algún día se instala analítica, la página `/cookies` deja de ser cierta y
> hay que poner un banner de consentimiento en condiciones.

### 3 · El panel

Carta, equipo, horarios y ajustes los mete el propio negocio. No hace falta
tocar código para nada de eso.

### Antes de publicar

- [ ] `DEMO = false` y datos reales en `src/datos/negocio.ts`
- [ ] Titular, NIF y domicilio fiscal en `LEGAL`
- [ ] Coordenadas reales del mapa
- [ ] SMTP del negocio configurado y **probado con una reserva de verdad**
- [ ] `npm run seed:limpio`, no `npm run seed`
- [ ] Carta y equipo metidos desde el panel
- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio final
- [ ] Contraseña del panel cambiada y comunicada al cliente

---

## Desplegar

Vercel. `vercel.json` fija la región en **`fra1`** (Fráncfort): por las
funciones pasan nombre, teléfono y correo de los clientes, y la política de
privacidad declara servidores en la Unión Europea. Sin fijarla, Vercel las
despliega en Washington y esa página legal pasa a decir algo que no es cierto.

Comprobarlo en el despliegue, no en el código: `vercel inspect <url>` imprime la
región junto a cada función.

`package.json` incluye `postinstall: prisma generate`, que en Prisma 7 es
obligatorio: el cliente ya no se genera al instalar y sin él el build falla en
un clon limpio.

---

## Desarrollo

Este Mac no tiene Postgres ni Docker, pero Prisma trae **PGlite**, que es
Postgres entero compilado a WASM. La base local vive en `.pgdata/` (ignorada
por git):

```bash
npm run db:local &   # levanta Postgres en 127.0.0.1:55432
npm run dev
```

El `.env` de desarrollo ya apunta ahí. `?sslmode=disable` en la URL es
obligatorio —sin él Prisma da `P1001` aunque el servidor esté escuchando— y el
`-m 20` también: por defecto PGlite admite una sola conexión y Next abre varias.

La base local trae la demo sembrada (9 servicios, 3 barberos con horario y
citas de ejemplo). Para empezar de cero: borrar `.pgdata/`, `npm run db:push` y
`npm run seed`.

### Mapa del código

```
src/
  datos/negocio.ts        Todo lo que cambia al vender la web
  lib/
    tiempo.ts             UTC ↔ hora local de Madrid, con cambios de hora
    agenda.ts             Cálculo de huecos libres (por día y por rango)
    reservas.ts           Alta y anulación de citas, con control de solape
    correo.ts             Avisos por SMTP; devuelve el error, nunca lo lanza
    auth.ts / clave.ts    Sesión del panel (scrypt + token con hash)
    color.ts              Tinta legible sobre un color elegido por el usuario
  componentes/            Cabecera, pie, iconos, regla del día, diagramas
  app/
    (público)             Portada, carta, equipo, local, contacto, legales
    reservar/             El asistente de reserva
    cita/[token]/         Ver y anular la propia cita
    panel/                Agenda y gestión
    api/huecos/           Huecos libres en JSON, para el asistente
```

`DESIGN.md` recoge el sistema visual y `PRODUCT.md` las verdades del producto.
