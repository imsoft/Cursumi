import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-service";
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

export async function requireRole(userId: string, roles: Role[]) {
  const role = await getUserRole(userId);
  if (!roles.includes(role)) {
    throw new ApiError(403, "No autorizado");
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
