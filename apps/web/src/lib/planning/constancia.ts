import type { PlanningPrefill } from "./prefill";

export const CONSTANCIA_TYPE = "constancia" as const;

export type ConstanciaData = {
  courseName: string;
  /** Nombre del participante — puede quedar en blanco para llenarlo a mano */
  recipientName: string;
  durationLabel: string;
  location: string;
  date: string;
  /** Estándar / nota al pie (opcional) */
  standard: string;
  issuerName: string;
  issuerRole: string;
  folio: string;
};

export function createEmptyConstancia(prefill?: Partial<PlanningPrefill>): ConstanciaData {
  return {
    courseName: prefill?.courseName ?? "",
    recipientName: "",
    durationLabel: prefill?.duration ?? "",
    location: prefill?.location ?? "",
    date: prefill?.startDate ?? "",
    standard: "",
    issuerName: prefill?.instructorName ?? "",
    issuerRole: "Instructor",
    folio: "",
  };
}

export function hydrateConstancia(raw: unknown, prefill?: Partial<PlanningPrefill>): ConstanciaData {
  const base = createEmptyConstancia(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ConstanciaData>;
  return { ...base, ...data };
}
