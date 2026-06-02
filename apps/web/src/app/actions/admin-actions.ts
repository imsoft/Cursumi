"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin-service";
import { getAdminAnalytics } from "@/lib/admin-service";

async function requireAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("No autorizado");
  }
  return session;
}

export async function loadAdminStats() {
  await requireAdminSession();
  return getAdminStats();
}

export async function loadAdminAnalytics() {
  await requireAdminSession();
  return getAdminAnalytics();
}
