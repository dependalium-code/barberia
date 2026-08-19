"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/panel/agenda", texto: "Agenda" },
  { href: "/panel/citas", texto: "Citas" },
  { href: "/panel/equipo", texto: "Equipo y horarios" },
  { href: "/panel/servicios", texto: "Servicios" },
  { href: "/panel/cierres", texto: "Cierres y vacaciones" },
  { href: "/panel/mensajes", texto: "Mensajes y leads" },
  { href: "/panel/ajustes", texto: "Ajustes" },
];

export function NavPanel() {
  const ruta = usePathname();

  return (
    <nav aria-label="Panel" className="flex gap-px overflow-x-auto border-y border-tinta-60 lg:mt-2 lg:block lg:overflow-visible lg:border-y-0">
      {ENLACES.map((e) => {
        const activo = ruta.startsWith(e.href);
        return (
          <Link
            key={e.href}
            href={e.href}
            aria-current={activo ? "page" : undefined}
            className={`cota relative block shrink-0 whitespace-nowrap px-5 py-3.5 transition-colors ${
              activo ? "bg-tinta-80 text-bermellon-vivo" : "text-acero-30 hover:text-acero-00"
            }`}
          >
            {activo && (
              <span className="absolute inset-y-0 left-0 w-[3px] bg-bermellon-vivo" />
            )}
            {e.texto}
          </Link>
        );
      })}
    </nav>
  );
}
