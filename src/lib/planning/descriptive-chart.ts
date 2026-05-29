export const DESCRIPTIVE_CHART_TYPE = "carta-descriptiva" as const;

export type GeneralObjective = {
  subject: string;
  action: string;
  condition: string;
};

export type SpecificObjective = {
  subject: string;
  action: string;
  condition: string;
  topics: string;
};

export type EvaluationCriteria = {
  id: string;
  aspect: string;
  percentage: string;
  instrument: string;
  moment: string;
  type: string;
};

export type ResourceVerification = {
  stage: string;
  activities: string;
  duration: string;
  techniques: string;
  materials: string;
};

export type ActivityRow = {
  id: string;
  stageTopic: string;
  activities: string;
  durationMin: number | null;
  techniques: string;
  materials: string;
};

export type DescriptiveChartData = {
  courseName: string;
  instructorName: string;
  location: string;
  duration: string;
  dates: string;
  participantCount: string;
  psychographicProfile: string;
  knowledgeProfile: string;
  skillsProfile: string;
  purpose: string;
  generalObjective: GeneralObjective;
  cognitiveObjective: SpecificObjective;
  psychomotorObjective: SpecificObjective;
  affectiveObjective: SpecificObjective;
  facilitiesRequirement: string;
  equipmentRequirement: string;
  materialsRequirement: string;
  humanResourcesRequirement: string;
  safetyRequirement: string;
  assessmentDescription: string;
  assessmentCriteria: EvaluationCriteria[];
  resourceVerification: ResourceVerification;
  opening: ActivityRow[];
  development: ActivityRow[];
  closing: ActivityRow[];
};

function emptySpecificObjective(): SpecificObjective {
  return { subject: "El participante", action: "", condition: "", topics: "" };
}

export function emptyActivityRow(): ActivityRow {
  return {
    id: crypto.randomUUID(),
    stageTopic: "",
    activities: "",
    durationMin: null,
    techniques: "",
    materials: "",
  };
}

export function emptyEvaluationCriteria(aspect: string, moment: string): EvaluationCriteria {
  return {
    id: crypto.randomUUID(),
    aspect,
    percentage: "",
    instrument: "Cuestionario",
    moment,
    type: "Heteroevaluación",
  };
}

export function createEmptyDescriptiveChart(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): DescriptiveChartData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    duration: prefill?.duration ?? "",
    dates: "",
    participantCount: "",
    psychographicProfile: "",
    knowledgeProfile: "",
    skillsProfile: "",
    purpose: "",
    generalObjective: { subject: "El participante", action: "", condition: "" },
    cognitiveObjective: emptySpecificObjective(),
    psychomotorObjective: emptySpecificObjective(),
    affectiveObjective: emptySpecificObjective(),
    facilitiesRequirement: "",
    equipmentRequirement: "",
    materialsRequirement: "",
    humanResourcesRequirement: "",
    safetyRequirement: "",
    assessmentDescription: "",
    assessmentCriteria: [
      emptyEvaluationCriteria("Evaluación diagnóstica", "Al inicio"),
      emptyEvaluationCriteria("Evaluación formativa", "Intermedia"),
      emptyEvaluationCriteria("Evaluación sumativa", "Al final"),
    ],
    resourceVerification: {
      stage: "Comprobación de la existencia y funcionamiento de los recursos requeridos",
      activities: "",
      duration: "",
      techniques: "",
      materials: "Lista de verificación de requerimientos",
    },
    opening: [emptyActivityRow()],
    development: [emptyActivityRow()],
    closing: [emptyActivityRow()],
  };
}

export function hydrateDescriptiveChart(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyDescriptiveChart>[0],
): DescriptiveChartData {
  const base = createEmptyDescriptiveChart(prefill);
  if (!raw || typeof raw !== "object") return base;

  const ensureRows = (rows: ActivityRow[] | undefined): ActivityRow[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [emptyActivityRow()];
    return rows.map((r) => ({
      id: r.id || crypto.randomUUID(),
      stageTopic: r.stageTopic ?? "",
      activities: r.activities ?? "",
      durationMin: typeof r.durationMin === "number" ? r.durationMin : null,
      techniques: r.techniques ?? "",
      materials: r.materials ?? "",
    }));
  };

  const data = raw as Partial<DescriptiveChartData>;

  return {
    ...base,
    ...data,
    generalObjective: { ...base.generalObjective, ...data.generalObjective },
    cognitiveObjective: { ...base.cognitiveObjective, ...data.cognitiveObjective },
    psychomotorObjective: { ...base.psychomotorObjective, ...data.psychomotorObjective },
    affectiveObjective: { ...base.affectiveObjective, ...data.affectiveObjective },
    resourceVerification: { ...base.resourceVerification, ...data.resourceVerification },
    assessmentCriteria:
      Array.isArray(data.assessmentCriteria) && data.assessmentCriteria.length > 0
        ? data.assessmentCriteria.map((c) => ({
            id: c.id || crypto.randomUUID(),
            aspect: c.aspect ?? "",
            percentage: c.percentage ?? "",
            instrument: c.instrument ?? "",
            moment: c.moment ?? "",
            type: c.type ?? "",
          }))
        : base.assessmentCriteria,
    opening: ensureRows(data.opening),
    development: ensureRows(data.development),
    closing: ensureRows(data.closing),
  };
}

export function sumDuration(rows: ActivityRow[]): number {
  return rows.reduce((acc, row) => acc + (row.durationMin ?? 0), 0);
}

export function sumDurationTotal(data: DescriptiveChartData): number {
  return sumDuration(data.opening) + sumDuration(data.development) + sumDuration(data.closing);
}

export function formatMinutes(min: number): string {
  if (min <= 0) return "0 min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
