/**
 * Llena la agenda de HOY y MAÑANA con citas de ejemplo, para enseñar el panel.
 *
 *   npm run demo:agenda           siembra
 *   npm run demo:agenda -- --borrar   deja la agenda limpia otra vez
 *
 * Existe para no dejar citas inventadas envejeciendo en producción: se lanza
 * justo antes de una demostración y se borra después. Todos los clientes van
 * con el prefijo «DEMO» para poder distinguirlos de una cita real de un vistazo.
 */
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(process.cwd(), f));
    break;
  } catch {}
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const CLIENTES = [
  "DEMO · Jordi Prat", "DEMO · Aleix Roca", "DEMO · Pau Serra",
  "DEMO · Roger Puig", "DEMO · Enric Font", "DEMO · Bruno Mas",
  "DEMO · Gerard Bosch", "DEMO · Adrià Sanz", "DEMO · Sergi Llop",
  "DEMO · Marc Vidal", "DEMO · Nil Camps", "DEMO · Oriol Ferrer",
  "DEMO · Xavi Riera", "DEMO · Arnau Costa", "DEMO · Guillem Sala",
  "DEMO · Ferran Solé", "DEMO · Biel Torres", "DEMO · Jan Miró",
  "DEMO · Pol Ventura", "DEMO · Iker Navarro", "DEMO · Unai Vila",
  "DEMO · Martí Roig", "DEMO · Quim Batlle", "DEMO · Aitor Pons",
];

async function main() {
  const borrar = process.argv.includes("--borrar");
  if (borrar) {
    const n = await prisma.cita.deleteMany({ where: { clienteNombre: { startsWith: "DEMO" } } });
    console.log(`✔ ${n.count} citas de ejemplo borradas.`);
    return;
  }

  const { crearCita } = await import("../src/lib/reservas");
  const { hoyISO, sumarDias, diaSemanaISO } = await import("../src/lib/tiempo");

  const servicios = await prisma.servicio.findMany({ where: { activo: true } });
  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    include: { horarios: true },
  });
  if (servicios.length === 0 || barberos.length === 0) {
    console.log("⚠ No hay servicios ni barberos. Lanza antes `npm run seed`.");
    return;
  }

  // Días abiertos, empezando por hoy.
  const dias: string[] = [];
  for (let i = 0; dias.length < 2 && i < 7; i++) {
    const f = sumarDias(hoyISO(), i);
    if (barberos.some((b) => b.horarios.some((h) => h.diaSemana === diaSemanaISO(f)))) dias.push(f);
  }

  let puestas = 0;
  let cliente = 0;
  for (const fecha of dias) {
    for (const barbero of barberos) {
      const suyo = barbero.horarios.filter((h) => h.diaSemana === diaSemanaISO(fecha));
      for (const tramo of suyo) {
        // Una cita cada hora y media dentro de su turno: la agenda se ve
        // trabajada pero deja huecos, que es lo que se quiere enseñar.
        for (let m = tramo.inicioMin + 30; m + 60 <= tramo.finMin; m += 90) {
          if (cliente >= CLIENTES.length) break;  // se reparte por orden: la lista tiene de sobra para tres sillones y dos días
          const servicio = servicios[puestas % servicios.length];
          const hora = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
          const r = await crearCita({
            servicioId: servicio.id,
            barberoId: barbero.id,
            fechaISO: fecha,
            hora,
            clienteNombre: CLIENTES[cliente],
            clienteTelefono: `600 ${String(100 + cliente).padStart(3, "0")} ${String(200 + cliente)}`,
            origen: "PANEL",
          });
          if (r.ok) {
            puestas++;
            cliente++;
          }
        }
      }
    }
  }
  console.log(`✔ ${puestas} citas de ejemplo en ${dias.join(" y ")}.`);
  console.log("  Para quitarlas: npm run demo:agenda -- --borrar");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
