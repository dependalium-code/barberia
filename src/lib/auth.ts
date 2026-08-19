import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export { hashClave, claveCorrecta } from "@/lib/clave";

export const COOKIE_SESION = "lb_sesion";
const DIAS_SESION = 14;

/** En la base solo se guarda el hash del token: si se filtra, no sirve para entrar. */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function abrirSesion(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiraEn = new Date(Date.now() + DIAS_SESION * 86_400_000);
  await prisma.sesion.create({
    data: { usuarioId, tokenHash: hashToken(token), expiraEn },
  });
  const tarro = await cookies();
  tarro.set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEn,
  });
}

export async function cerrarSesion(): Promise<void> {
  const tarro = await cookies();
  const token = tarro.get(COOKIE_SESION)?.value;
  if (token) {
    await prisma.sesion.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  tarro.delete(COOKIE_SESION);
}

export type UsuarioSesion = {
  id: string;
  nombre: string;
  email: string;
  rol: "ADMIN" | "BARBERO";
  barberoId: string | null;
};

export async function usuarioActual(): Promise<UsuarioSesion | null> {
  const tarro = await cookies();
  const token = tarro.get(COOKIE_SESION)?.value;
  if (!token) return null;

  const sesion = await prisma.sesion.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: true },
  });
  if (!sesion || sesion.expiraEn.getTime() < Date.now() || !sesion.usuario.activo) return null;

  return {
    id: sesion.usuario.id,
    nombre: sesion.usuario.nombre,
    email: sesion.usuario.email,
    rol: sesion.usuario.rol,
    barberoId: sesion.usuario.barberoId,
  };
}

/** Para usar al principio de cada página y acción del panel. */
export async function exigirUsuario(): Promise<UsuarioSesion> {
  const u = await usuarioActual();
  if (!u) throw new SinPermiso();
  return u;
}

export class SinPermiso extends Error {
  constructor() {
    super("sin sesión");
    this.name = "SinPermiso";
  }
}

export async function limpiarSesionesCaducadas() {
  await prisma.sesion.deleteMany({ where: { expiraEn: { lt: new Date() } } });
}
