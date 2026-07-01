import type { PlanningPrefill } from "./prefill";

export const INFORME_FINAL_TYPE = "informe-final" as const;

export type InformeFinalData = {
  courseName: string;
  instructorName: string;
  period: string;
  location: string;
  enrolledCount: string;
  completedCount: string;
  approvedCount: string;
  objectivesSummary: string;
  developmentSummary: string;
  results: string;
  observations: string;
  recommendations: string;
  conclusions: string;
  elaboratedBy: string;
  date: string;
};

export function createEmptyInformeFinal(prefill?: Partial<PlanningPrefill>): InformeFinalData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    period: prefill?.dates ?? "",
    location: prefill?.location ?? "",
    enrolledCount: prefill?.participantCount ?? "",
    completedCount: "",
    approvedCount: "",
    objectivesSummary: prefill?.description ?? "",
    developmentSummary: "",
    results: "",
    observations: "",
    recommendations: "",
    conclusions: "",
    elaboratedBy: prefill?.instructorName ?? "",
    date: prefill?.startDate ?? "",
  };
}

export function hydrateInformeFinal(raw: unknown, prefill?: Partial<PlanningPrefill>): InformeFinalData {
  const base = createEmptyInformeFinal(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<InformeFinalData>;
  return { ...base, ...data };
}
