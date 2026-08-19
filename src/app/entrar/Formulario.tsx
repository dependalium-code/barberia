"use client";

import Link from "next/link";
import { useActionState } from "react";
import { NEGOCIO } from "@/datos/negocio";

export function Formulario({
  accion,
}: {
  accion: (previo: string | null, datos: FormData) => Promise<string | null>;
}) {
  const [error, enviar, enviando] = useActionState(accion, null);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="titular block text-3xl">
          {NEGOCIO.nombre}
        </Link>
        <p className="cota mt-2 text-acero-50">Panel del mostrador</p>

        <form action={enviar} className="sombra-carta mt-8 border-2 border-tinta bg-acero-00 p-6">
          {error && (
            <p role="alert" className="mb-5 bg-bermellon-humo px-4 py-3 text-[0.92rem] text-tinta">
              {error}
            </p>
          )}

          <label htmlFor="email" className="cota block text-acero-50">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] focus:border-tinta focus:outline-none"
          />

          <label htmlFor="clave" className="cota mt-5 block text-acero-50">
            Contraseña
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full border-2 border-acero-20 bg-acero-00 px-4 py-3 text-[1rem] focus:border-tinta focus:outline-none"
          />

          <button
            type="submit"
            disabled={enviando}
            className="cota mt-7 w-full bg-bermellon px-6 py-4 text-white transition-colors hover:bg-tinta disabled:bg-acero-20 disabled:text-acero-50"
          >
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <Link href="/" className="cota mt-6 inline-block text-acero-50 hover:text-tinta">
          Volver a la web
        </Link>
      </div>
    </main>
  );
}
