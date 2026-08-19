import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioActual, cerrarSesion } from "@/lib/auth";
import { NEGOCIO } from "@/datos/negocio";
import { NavPanel } from "./NavPanel";

export const dynamic = "force-dynamic";

async function salir() {
  "use server";
  await cerrarSesion();
  redirect("/entrar");
}

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");

  return (
    <div className="relative z-10 min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="campo-tinta bg-tinta text-acero-05 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block">
          <Link href="/" className="titular block text-xl text-acero-00">
            {NEGOCIO.nombre}
          </Link>
          <p className="cota mt-1 hidden text-acero-30 lg:block">Panel</p>
          <form action={salir} className="lg:hidden">
            <button type="submit" className="cota text-acero-30 hover:text-acero-00">
              Salir
            </button>
          </form>
        </div>

        <NavPanel />

        <div className="hidden border-t border-tinta-60 px-5 py-4 lg:block">
          <p className="cota text-acero-30">Sesión</p>
          <p className="mt-1.5 truncate text-[0.9rem] text-acero-05">{usuario.nombre}</p>
          <p className="truncate text-[0.8rem] text-acero-30">{usuario.email}</p>
          <form action={salir} className="mt-3">
            <button
              type="submit"
              className="cota border-b border-acero-30 pb-0.5 text-acero-30 transition-colors hover:border-bermellon-vivo hover:text-bermellon-vivo"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <main className="min-w-0 pb-16">{children}</main>
    </div>
  );
}
