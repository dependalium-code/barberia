"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NEGOCIO } from "@/datos/negocio";
import { IconoTelefono } from "@/componentes/Iconos";
import { BarraDemo } from "@/componentes/BarraDemo";

const ENLACES = [
  { href: "/", texto: "Portada" },
  { href: "/carta", texto: "Carta" },
  { href: "/equipo", texto: "Equipo" },
  { href: "/el-local", texto: "El local" },
  { href: "/contacto", texto: "Contacto" },
];

export function Cabecera() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const activo = (href: string) =>
    href === "/" ? ruta === "/" : ruta.startsWith(href);

  return (
    <>
      <BarraDemo />
      <header className="campo-tinta sticky top-0 z-50 bg-tinta text-acero-05">
        <div className="mx-auto flex h-14 max-w-[86rem] items-stretch gap-4 px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 py-2 text-acero-00 transition-colors hover:text-bermellon-vivo"
          >
            <span className="titular text-[1.05rem] leading-none sm:text-[1.2rem]">
              {NEGOCIO.nombre}
            </span>
            <span className="cota hidden text-acero-30 sm:block">
              {NEGOCIO.ciudad}
            </span>
          </Link>

          <nav
            aria-label="Principal"
            className="ml-auto hidden items-stretch lg:flex"
          >
            {ENLACES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                aria-current={activo(e.href) ? "page" : undefined}
                className={`cota relative flex items-center px-4 transition-colors ${
                  activo(e.href)
                    ? "text-bermellon-vivo"
                    : "text-acero-30 hover:text-acero-00"
                }`}
              >
                {e.texto}
                {activo(e.href) && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] bg-bermellon-vivo" />
                )}
              </Link>
            ))}
          </nav>

          <a
            href={`tel:${NEGOCIO.telefonoE164}`}
            className="cota ml-auto hidden items-center gap-2 border-l border-tinta-60 pl-4 text-acero-30 transition-colors hover:text-acero-00 lg:ml-0 lg:flex"
          >
            <IconoTelefono className="h-4 w-4" />
            {NEGOCIO.telefono}
          </a>

          <Link
            href="/reservar"
            className="cota my-2 ml-auto flex items-center bg-bermellon px-4 text-white transition-colors hover:bg-bermellon-vivo sm:px-6 lg:ml-0"
          >
            Reservar
          </Link>

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            className="cota -mr-2 flex items-center gap-2 px-2 text-acero-30 transition-colors hover:text-acero-00 lg:hidden"
          >
            <span className="sr-only">Menú</span>
            <span aria-hidden="true" className="grid gap-[5px]">
              <span
                className={`block h-[2px] w-5 bg-current transition-transform duration-300 ${abierto ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[2px] w-5 bg-current transition-opacity duration-200 ${abierto ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[2px] w-5 bg-current transition-transform duration-300 ${abierto ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>

        <div
          id="menu-movil"
          hidden={!abierto}
          className="border-t border-tinta-60 bg-tinta lg:hidden"
        >
          <nav
            aria-label="Principal (móvil)"
            className="px-4 pb-6 pt-2 sm:px-6"
          >
            {ENLACES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="block border-b border-tinta-60 py-4"
              >
                <span
                  className={`titular text-2xl ${activo(e.href) ? "text-bermellon-vivo" : "text-acero-00"}`}
                >
                  {e.texto}
                </span>
              </Link>
            ))}
            <a
              href={`tel:${NEGOCIO.telefonoE164}`}
              className="medida mt-6 flex items-center gap-3 text-lg text-acero-00"
            >
              <IconoTelefono className="h-5 w-5 text-bermellon-vivo" />
              {NEGOCIO.telefono}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
