import { DEMO, NEGOCIO, SITE_URL } from "@/datos/negocio";

/**
 * Ficha de negocio para Google (schema.org HairSalon).
 *
 * Mientras DEMO sea true NO se emite: publicar una dirección y un horario
 * inventados en datos estructurados es pedirle a Google que indexe un local
 * que no existe. Se enciende solo cuando los datos son los de verdad.
 */
export function DatosEstructurados({
  servicios,
}: {
  servicios: { nombre: string; precioCent: number }[];
}) {
  if (DEMO) return null;

  const ficha = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: NEGOCIO.nombreLargo,
    description: NEGOCIO.descripcion,
    url: SITE_URL,
    telephone: NEGOCIO.telefonoE164,
    email: NEGOCIO.email,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: NEGOCIO.direccion,
      postalCode: NEGOCIO.codigoPostal,
      addressLocality: NEGOCIO.ciudad,
      addressRegion: NEGOCIO.provincia,
      addressCountry: "ES",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: servicios.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.nombre },
        price: (s.precioCent / 100).toFixed(2),
        priceCurrency: "EUR",
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/reservar`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: "Cita de barbería" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ficha) }}
    />
  );
}
