/**
 * Datos de arranque.
 *
 *   npm run seed          -> admin + carta y equipo DE EJEMPLO (para la demo)
 *   npm run seed:limpio   -> SOLO el administrador y los ajustes
 *
 * El modo limpio existe a propósito: al entregar la web a una barbería de
 * verdad no debe quedar ni un barbero ni un precio inventado en la base.
 */
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashClave } from "../src/lib/clave";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const limpio = process.argv.includes("--limpio");

// --- Carta de ejemplo. Precios y duraciones orientativos de una barbería tipo.
const SERVICIOS = [
  { slug: "corte-de-pelo", nombre: "Corte de pelo", categoria: "Barbería", duracionMin: 30, precioCent: 1500, destacado: true,
    descripcion: "Lavado, corte a tijera o máquina, perfilado de contornos y peinado." },
  { slug: "corte-y-barba", nombre: "Corte + barba", categoria: "Barbería", duracionMin: 45, precioCent: 2200, destacado: true,
    descripcion: "El completo: corte al gusto y barba perfilada con toalla caliente." },
  { slug: "arreglo-de-barba", nombre: "Arreglo de barba", categoria: "Barbería", duracionMin: 20, precioCent: 1000, destacado: true,
    descripcion: "Perfilado, rebaje y acabado con aceite y bálsamo." },
  { slug: "afeitado-clasico", nombre: "Afeitado clásico a navaja", categoria: "Barbería", duracionMin: 30, precioCent: 1600,
    descripcion: "Ritual completo: toalla caliente, jabón, navaja y after shave." },
  { slug: "degradado", nombre: "Degradado a máquina", categoria: "Barbería", duracionMin: 20, precioCent: 1200,
    descripcion: "Fade limpio con acabado a navaja en los contornos." },
  { slug: "corte-infantil", nombre: "Corte infantil (hasta 12 años)", categoria: "Barbería", duracionMin: 30, precioCent: 1200,
    descripcion: "Con calma y sin prisas, para que la primera vez no sea la última." },
  { slug: "cejas", nombre: "Perfilado de cejas", categoria: "Extras", duracionMin: 10, precioCent: 500,
    descripcion: "Limpieza y perfilado con navaja." },
  { slug: "canas", nombre: "Camuflaje de canas", categoria: "Color", duracionMin: 45, precioCent: 2000,
    descripcion: "Tono natural, sin efecto tinte, que se difumina al crecer." },
  { slug: "pack-padre-e-hijo", nombre: "Pack padre e hijo", categoria: "Packs", duracionMin: 60, precioCent: 2500,
    descripcion: "Dos cortes seguidos en la misma reserva." },
];

// --- Equipo de ejemplo.
const BARBEROS = [
  { slug: "barbero-uno", nombre: "Marc", puesto: "Barbero · Fundador", color: "#c8a45c",
    bio: "Quince años detrás del sillón. Especialista en degradados y en barba clásica a navaja.",
    servicios: "todos" as const,
    horario: [ ...[1,2,3,4,5].map(d => ({ d, de: "09:30", a: "20:00" })), { d: 6, de: "09:30", a: "14:00" } ] },
  { slug: "barbero-dos", nombre: "Youssef", puesto: "Barbero", color: "#8fb0c9",
    bio: "Corte moderno, texturizado y trabajo de tijera. Le pierden los cortes con raya marcada.",
    servicios: "todos" as const,
    horario: [ ...[1,2,3,4,5].map(d => ({ d, de: "09:30", a: "20:00" })), { d: 6, de: "09:30", a: "14:00" } ] },
  { slug: "barbero-tres", nombre: "Nil", puesto: "Barbero · Tardes", color: "#a58fc9",
    bio: "Refuerza las tardes. Cortes rápidos, contornos limpios y buen ojo para el color.",
    servicios: ["corte-de-pelo", "degradado", "arreglo-de-barba", "corte-infantil", "cejas", "canas"],
    horario: [1,2,3,4,5].map(d => ({ d, de: "15:00", a: "20:00" })) },
];

function min(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function main() {
  await prisma.ajustes.upsert({
    where: { id: "ajustes" },
    update: {},
    create: { id: "ajustes" },
  });

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const clave = process.env.ADMIN_PASSWORD;
  if (email && clave) {
    const passwordHash = await hashClave(clave);
    await prisma.usuario.upsert({
      where: { email },
      update: { passwordHash, activo: true },
      create: { email, passwordHash, nombre: "Administración", rol: "ADMIN" },
    });
    console.log(`✔ Administrador listo: ${email}`);
  } else {
    console.log("⚠ Sin ADMIN_EMAIL / ADMIN_PASSWORD en .env: no se ha creado el acceso al panel.");
  }

  if (limpio) {
    console.log("✔ Modo limpio: no se ha creado contenido de ejemplo.");
    return;
  }

  for (const [i, s] of SERVICIOS.entries()) {
    await prisma.servicio.upsert({
      where: { slug: s.slug },
      update: { ...s, orden: i },
      create: { ...s, orden: i },
    });
  }
  console.log(`✔ ${SERVICIOS.length} servicios de ejemplo.`);

  const todos = await prisma.servicio.findMany({ select: { id: true, slug: true } });
  const porSlug = new Map(todos.map((s) => [s.slug, s.id]));

  for (const [i, b] of BARBEROS.entries()) {
    const { servicios, horario, ...datos } = b;
    const barbero = await prisma.barbero.upsert({
      where: { slug: b.slug },
      update: { ...datos, orden: i },
      create: { ...datos, orden: i },
    });

    const slugs = servicios === "todos" ? [...porSlug.keys()] : servicios;
    await prisma.barberoServicio.deleteMany({ where: { barberoId: barbero.id } });
    await prisma.barberoServicio.createMany({
      data: slugs
        .map((sl) => porSlug.get(sl))
        .filter((id): id is string => Boolean(id))
        .map((servicioId) => ({ barberoId: barbero.id, servicioId })),
    });

    await prisma.horario.deleteMany({ where: { barberoId: barbero.id } });
    await prisma.horario.createMany({
      data: horario.map((h) => ({
        barberoId: barbero.id,
        diaSemana: h.d,
        inicioMin: min(h.de),
        finMin: min(h.a),
      })),
    });
  }
  console.log(`✔ ${BARBEROS.length} barberos de ejemplo con su horario.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
