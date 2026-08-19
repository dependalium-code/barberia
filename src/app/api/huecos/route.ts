import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { huecosDelRango, leerAjustes } from "@/lib/agenda";
import { hoyISO, sumarDias } from "@/lib/tiempo";

export const dynamic = "force-dynamic";

/**
 * Huecos libres de un rango de días.
 * GET /api/huecos?servicio=<slug>&barbero=<slug>&desde=2026-08-19&dias=14
 */
export async function GET(peticion: Request) {
  const url = new URL(peticion.url);
  const slugServicio = url.searchParams.get("servicio");
  const slugBarbero = url.searchParams.get("barbero");
  const desde = url.searchParams.get("desde") ?? hoyISO();
  const dias = Math.min(Math.max(Number(url.searchParams.get("dias") ?? 14), 1), 42);

  if (!slugServicio) {
    return NextResponse.json({ error: "Falta el servicio." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
    return NextResponse.json({ error: "Fecha mal formada." }, { status: 400 });
  }

  const ajustes = await leerAjustes();
  const tope = sumarDias(hoyISO(), ajustes.ventanaDiasMax);
  const desdeReal = desde < hoyISO() ? hoyISO() : desde > tope ? tope : desde;

  const servicio = await prisma.servicio.findUnique({
    where: { slug: slugServicio },
    select: { id: true, activo: true, duracionMin: true },
  });
  if (!servicio || !servicio.activo) {
    return NextResponse.json({ error: "Servicio no disponible." }, { status: 404 });
  }

  let barberoId: string | null = null;
  if (slugBarbero) {
    const b = await prisma.barbero.findUnique({
      where: { slug: slugBarbero },
      select: { id: true, activo: true },
    });
    if (!b || !b.activo) {
      return NextResponse.json({ error: "Barbero no disponible." }, { status: 404 });
    }
    barberoId = b.id;
  }

  const mapa = await huecosDelRango({
    servicioId: servicio.id,
    barberoId,
    desdeISO: desdeReal,
    dias,
  });

  const barberos = await prisma.barbero.findMany({
    where: { activo: true },
    select: { id: true, slug: true },
  });
  const slugPorId = new Map(barberos.map((b) => [b.id, b.slug]));

  return NextResponse.json({
    desde: desdeReal,
    ultimoDiaReservable: tope,
    duracionMin: servicio.duracionMin,
    dias: [...mapa.entries()].map(([fecha, huecos]) => ({
      fecha,
      huecos: huecos.map((h) => ({
        hora: h.hora,
        barberos: h.barberoIds.map((id) => slugPorId.get(id)).filter(Boolean),
      })),
    })),
  });
}
