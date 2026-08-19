/**
 * Cambia el DNS de Hostinger para que el dominio sirva desde Vercel.
 *
 *   HOSTINGER_TOKEN=... npm run dns -- --ver        enseña la zona actual
 *   HOSTINGER_TOKEN=... npm run dns -- --aplicar    hace el cambio
 *
 * Lo que hace y lo que NO hace:
 *   - Pone   A @   → 76.76.21.21        (el ápex, servido por Vercel)
 *   - Pone   CNAME www → cname.vercel-dns.com
 *   - BORRA  el ALIAS @ de Hostinger, porque el panel no admite ALIAS y A en
 *     el mismo nombre y rechaza cualquier intento de sustituirlo en caliente.
 *   - NO toca los MX, ni el SPF, ni los CNAME de DKIM, ni el TXT de
 *     google-site-verification. Si se tocan, cae el correo o la verificación
 *     de Search Console.
 *
 * Siempre imprime la zona antes de cambiar nada, para poder revertir.
 */
const API = "https://developers.hostinger.com/api/dns/v1";
const DOMINIO = process.env.DOMINIO ?? "labarberiamataro.com";

const INTOCABLES = ["MX", "TXT", "SOA", "NS", "CAA", "SRV"];

async function api(ruta: string, opciones: RequestInit = {}) {
  const token = process.env.HOSTINGER_TOKEN;
  if (!token) throw new Error("Falta HOSTINGER_TOKEN (hPanel → API → crear token).");

  const r = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(opciones.headers ?? {}),
    },
  });
  const cuerpo = await r.text();
  if (!r.ok) throw new Error(`${r.status} en ${ruta}: ${cuerpo.slice(0, 300)}`);
  return cuerpo ? JSON.parse(cuerpo) : null;
}

function pintar(zona: unknown) {
  const filas = Array.isArray(zona) ? zona : ((zona as { data?: unknown[] })?.data ?? []);
  for (const f of filas as { type: string; name: string; ttl?: number; records?: { content: string }[] }[]) {
    const valores = (f.records ?? []).map((r) => r.content).join(", ");
    const aviso = INTOCABLES.includes(f.type) ? "  ← NO TOCAR" : "";
    console.log(`  ${f.type.padEnd(6)} ${String(f.name).padEnd(24)} ${valores}${aviso}`);
  }
  return filas;
}

async function principal() {
  const aplicar = process.argv.includes("--aplicar");

  console.log(`Zona actual de ${DOMINIO}:`);
  const zona = await api(`/zones/${DOMINIO}`);
  const filas = pintar(zona);

  if (!aplicar) {
    console.log("\n(solo lectura. Añade --aplicar para cambiarlo)");
    return;
  }

  const tieneAlias = (filas as { type: string; name: string }[]).some(
    (f) => f.type === "ALIAS" && (f.name === "@" || f.name === DOMINIO),
  );
  console.log(`\nALIAS en el ápex: ${tieneAlias ? "sí, hay que borrarlo primero" : "no hay"}`);

  if (tieneAlias) {
    await api(`/zones/${DOMINIO}`, {
      method: "DELETE",
      body: JSON.stringify({ filters: [{ name: "@", type: "ALIAS" }] }),
    });
    console.log("✔ ALIAS @ borrado");
  }

  await api(`/zones/${DOMINIO}`, {
    method: "PUT",
    body: JSON.stringify({
      overwrite: true,
      zone: [
        { name: "@", type: "A", ttl: 300, records: [{ content: "76.76.21.21" }] },
        { name: "www", type: "CNAME", ttl: 300, records: [{ content: "cname.vercel-dns.com." }] },
      ],
    }),
  });
  console.log("✔ A @ → 76.76.21.21 y CNAME www → cname.vercel-dns.com");

  console.log(`\nZona después:`);
  pintar(await api(`/zones/${DOMINIO}`));
}

principal().catch((e) => {
  console.error("✘", e instanceof Error ? e.message : e);
  process.exit(1);
});
