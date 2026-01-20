import { headers } from "next/headers";
import { NextResponse } from "next/server";
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
  console.error(error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
