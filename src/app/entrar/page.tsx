import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { abrirSesion, claveCorrecta, usuarioActual } from "@/lib/auth";
import { Formulario } from "./Formulario";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

async function entrar(_previo: string | null, datos: FormData): Promise<string | null> {
  "use server";
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  const clave = String(datos.get("clave") ?? "");
  if (!email || !clave) return "Faltan el correo o la contraseña.";

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  // Mismo mensaje para usuario inexistente y contraseña mala: si no, se puede
  // averiguar qué correos tienen cuenta probando uno a uno.
  const generico = "El correo o la contraseña no son correctos.";
  if (!usuario || !usuario.activo) return generico;
  if (!(await claveCorrecta(clave, usuario.passwordHash))) return generico;

  await abrirSesion(usuario.id);
  redirect("/panel/agenda");
}

export default async function PaginaEntrar() {
  if (await usuarioActual()) redirect("/panel/agenda");
  return <Formulario accion={entrar} />;
}
