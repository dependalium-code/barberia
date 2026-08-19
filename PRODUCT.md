# La Barbería — web con centro de citas

## Qué es
Web pública de una barbería de barrio **con motor de reservas propio**, construida
para venderse e instalarse en una barbería real. No es una landing con un botón a
Booksy: la agenda, los barberos, los horarios y las citas viven en este proyecto.

## A quién sirve
- **Cliente final (público, móvil, prisa).** Quiere hora hoy o mañana con su barbero
  y en menos de un minuto. Muchas veces reserva de pie, en la calle, con una mano.
- **Barbería (panel privado, mostrador).** Quiere ver el día de un vistazo, meter la
  cita del que entra por la puerta, mover una hora y cerrar una tarde de vacaciones.
- **Iván (quien vende la web).** Necesita entregarla y que un negocio la use sin
  tocar código: todo lo del negocio en un archivo, todo lo operativo en el panel.

## Éxito
- Reservar sin registro, sin app y sin llamar.
- Cero citas duplicadas en el mismo sillón.
- El mostrador deja de apuntar horas en una libreta.

## Verdades del producto (no negociables)
- **Zona horaria Europe/Madrid**, con los dos cambios de hora al año.
- **Sin pasarela de pago.** Se cobra en el local. No se pide tarjeta ni señal.
- Datos que se piden al reservar: nombre, teléfono y, opcional, email y nota.
  Nada más: cada campo extra es una reserva menos.
- El email es opcional, así que **la confirmación no puede depender del correo**:
  el resguardo se enseña en pantalla con su referencia.
- La cita se guarda **antes** de intentar avisar por correo. Un correo que falla
  queda marcado en el panel, nunca pierde la cita.
- Contenido de ejemplo marcado como tal mientras `DEMO = true`.

## Contenido real disponible
Teléfono 645 505 387 · info@labarberiamataro.com · Mataró (Barcelona).
No hay dirección de local, ni fotos propias, ni reseñas reales: eso lo aporta la
barbería que la compre.

## Restricciones técnicas
Next.js 16 (App Router) · React 19 · Tailwind v4 · Prisma 7 + Postgres ·
Vercel región `fra1` · correo por SMTP del propio negocio.
