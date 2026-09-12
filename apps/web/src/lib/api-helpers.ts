import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-service";
import { debeConfigurar2FA } from "@/lib/two-factor-guard";
import type { Role } from "@/generated/prisma";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new ApiError(401, "No autenticado");
  }
  return session;
}

/**
 * Exige rol, y segundo factor a quien lo tenga obligatorio.
 *
 * El 2FA se comprobaba solo en los layouts de /admin e /instructor, que es una
 * puerta de la interfaz y no una barrera: con la cookie de sesión se podía
 * llamar a la API directamente y, por ejemplo, cambiar roles desde
 * /api/admin/users/[id] sin pasar por el segundo factor. Si a una cuenta con
 * privilegios le roban la contraseña, la redirección de la pantalla no la
 * protege.
 *
 * Va aquí y no en cada ruta porque las 42 rutas privilegiadas pasan por esta
 * función, incluidas todas las de admin.
 *
 * Quien entra solo con Google queda exento, igual que en los layouts: no tiene
 * contraseña con la que dar de alta un TOTP, así que exigírselo lo dejaría
 * fuera para siempre. Ver two-factor-guard.ts.
 */
export async function requireRole(userId: string, roles: Role[]) {
  const role = await getUserRole(userId);
  if (!roles.includes(role)) {
    throw new ApiError(403, "No autorizado");
  }
  if (await debeConfigurar2FA(userId, role)) {
    throw new ApiError(
      403,
      "Activa tu segundo factor en /seguridad/dos-factores para poder usar esta función.",
    );
  }
  return role;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  // Datos mal formados = culpa del cliente (400), no error del servidor (500).
  // Devolvemos el primer problema con su campo para que la UI pueda mostrarlo.
  if (error instanceof ZodError) {
    const first = error.issues[0];
    const field = first?.path.join(".");
    return NextResponse.json(
      {
        error: field ? `${field}: ${first.message}` : (first?.message ?? "Datos inválidos"),
        issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
