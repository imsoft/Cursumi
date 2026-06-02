import { MEXICO_STATES_CITIES } from "@/lib/mexico-cities";

export function getCitiesForState(stateName: string): string[] {
  return MEXICO_STATES_CITIES.find((g) => g.value === stateName)?.items ?? [];
}

/** Si solo hay municipio guardado (datos viejos), intenta deducir el estado. */
export function findStateForMunicipality(municipality: string): string | undefined {
  const q = municipality.trim().toLowerCase();
  if (!q) return undefined;
  for (const g of MEXICO_STATES_CITIES) {
    if (g.items.some((m) => m.toLowerCase() === q)) return g.value;
  }
  return undefined;
}

export function formatMexicoLocation(city?: string | null, state?: string | null): string {
  const c = city?.trim();
  const s = state?.trim();
  if (c && s) return `${c}, ${s}`;
  return c || s || "";
}
