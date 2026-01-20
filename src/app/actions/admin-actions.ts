"use server";

import { getAdminStats } from "@/lib/admin-service";
import { getAdminAnalytics } from "@/lib/admin-service";

export async function loadAdminStats() {
  return getAdminStats();
}

export async function loadAdminAnalytics() {
  return getAdminAnalytics();
}
