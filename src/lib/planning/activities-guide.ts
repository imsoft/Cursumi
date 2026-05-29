export const ACTIVITIES_GUIDE_TYPE = "guia-actividades" as const;

export type UnitActivity = {
  id: string;
  title: string;
  instructions: string;
  materials: string;
  participation: string;
  midTerm: string;
  weight: string;
};

export type EvaluationCriteria = {
  knowledge: boolean;
  skills: boolean;
  attitudes: boolean;
};

export type LearningUnit = {
  id: string;
  name: string;
  objective: string;
  period: string;
  generalWeight: string;
  criteria: EvaluationCriteria;
  activities: UnitActivity[];
};

export type ActivitiesGuideData = {
  courseName: string;
  units: LearningUnit[];
};

const MATERIALS_DEFAULT = "Acceso a internet\nAcceso a la plataforma educativa\nEstar registrado en la plataforma.";

export function emptyActivity(): UnitActivity {
  return {
    id: crypto.randomUUID(),
    title: "",
    instructions: "",
    materials: MATERIALS_DEFAULT,
    participation: "Individual",
    midTerm: "",
    weight: "",
  };
}

export function emptyUnit(): LearningUnit {
  return {
    id: crypto.randomUUID(),
    name: "",
    objective: "",
    period: "Indefinido",
    generalWeight: "",
    criteria: { knowledge: false, skills: false, attitudes: false },
    activities: [emptyActivity()],
  };
}

export function createEmptyActivitiesGuide(prefill?: { courseName?: string }): ActivitiesGuideData {
  return {
    courseName: prefill?.courseName ?? "",
    units: [emptyUnit()],
  };
}

export function hydrateActivitiesGuide(raw: unknown, prefill?: { courseName?: string }): ActivitiesGuideData {
  const base = createEmptyActivitiesGuide(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ActivitiesGuideData>;

  const units =
    Array.isArray(data.units) && data.units.length > 0
      ? data.units.map((u) => ({
          id: u.id || crypto.randomUUID(),
          name: u.name ?? "",
          objective: u.objective ?? "",
          period: u.period ?? "Indefinido",
          generalWeight: u.generalWeight ?? "",
          criteria: {
            knowledge: Boolean(u.criteria?.knowledge),
            skills: Boolean(u.criteria?.skills),
            attitudes: Boolean(u.criteria?.attitudes),
          },
          activities:
            Array.isArray(u.activities) && u.activities.length > 0
              ? u.activities.map((a) => ({
                  id: a.id || crypto.randomUUID(),
                  title: a.title ?? "",
                  instructions: a.instructions ?? "",
                  materials: a.materials ?? "",
                  participation: a.participation ?? "",
                  midTerm: a.midTerm ?? "",
                  weight: a.weight ?? "",
                }))
              : [emptyActivity()],
        }))
      : base.units;

  return { ...base, ...data, units };
}
