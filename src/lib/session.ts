import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

// Memoized per-request — deduplicates layout + page calls within the same render
export const getCachedSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

// For public pages: returns null on error instead of throwing
export async function getSessionSafe() {
  try {
    return await getCachedSession();
  } catch {
    return null;
  }
}
