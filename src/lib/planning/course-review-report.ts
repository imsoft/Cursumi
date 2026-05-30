export const COURSE_REVIEW_REPORT_TYPE = "course-review-report" as const;

export type DesignObservation = {
  id: string;
  observation: string;
  unit: string;
  proposal: string;
};

export type CourseReviewReportData = {
  courseName: string;
  developerName: string;
  reviewDate: string; // "YYYY-MM-DD"
  designObservations: DesignObservation[];
  contentObservations: string;
  platformObservations: string;
};

export function emptyDesignObservation(): DesignObservation {
  return { id: crypto.randomUUID(), observation: "", unit: "", proposal: "" };
}

export function createEmptyCourseReviewReport(prefill?: {
  courseName?: string;
  developerName?: string;
}): CourseReviewReportData {
  return {
    courseName: prefill?.courseName ?? "",
    developerName: prefill?.developerName ?? "",
    reviewDate: new Date().toISOString().slice(0, 10),
    designObservations: [emptyDesignObservation()],
    contentObservations: "",
    platformObservations: "",
  };
}

export function hydrateCourseReviewReport(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyCourseReviewReport>[0],
): CourseReviewReportData {
  const base = createEmptyCourseReviewReport(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<CourseReviewReportData>;

  const designObservations =
    Array.isArray(data.designObservations) && data.designObservations.length > 0
      ? data.designObservations.map((o) => ({
          id: o.id || crypto.randomUUID(),
          observation: o.observation ?? "",
          unit: o.unit ?? "",
          proposal: o.proposal ?? "",
        }))
      : base.designObservations;

  return {
    ...base,
    ...data,
    designObservations,
  };
}

const MONTHS_FULL_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatReviewDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  const month = MONTHS_FULL_ES[d.getMonth()];
  const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${d.getDate()} de ${capMonth} de ${d.getFullYear()}`;
}
