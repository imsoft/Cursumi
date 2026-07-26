"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/user-service";
import { getAdminStats, getAdminActivity, getAdminAnalytics } from "@/lib/admin-service";

async function requireAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("No autorizado");

  // El rol se consulta en la BD, no en la sesión: better-auth no incluye
  // campos propios como `role` en el objeto de sesión, así que leerlo de ahí
  // daba siempre `undefined` y esto lanzaba incluso para administradores
  // legítimos (el dashboard acababa mostrando ceros). Es como lo resuelve el
  // resto del proyecto.
  const role = await getUserRole(session.user.id);
  if (role !== "admin") throw new Error("No autorizado");

  return session;
}

export async function loadAdminStats() {
  await requireAdminSession();
  return getAdminStats();
}

export async function loadAdminActivity() {
  await requireAdminSession();
  return getAdminActivity();
}

export async function loadAdminAnalytics() {
  await requireAdminSession();
  return getAdminAnalytics();
}
