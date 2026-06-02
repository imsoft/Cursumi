import { cache } from "react";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { auth } from "./auth";

// Memoized per-request — deduplicates layout + page calls within the same render
export const getCachedSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

/**
 * Sesión para layouts que deben degradar con gracia (p. ej. admin con try/catch).
 * No enmascara fallos de infra: si la lectura lanza, se propaga tras re-lanzar redirects de Next.
 */
export async function getSessionSafe() {
  try {
    return await getCachedSession();
  } catch (e) {
    unstable_rethrow(e);
    console.error("[session] getCachedSession error:", e);
    return null;
  }
}
