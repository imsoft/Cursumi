export const VIRTUAL_ACTIVITIES_GUIDE_TYPE = "virtual-activities-guide" as const;

export type VirtualActivity = {
  id: string;
  title: string;
  instructions: string;
  materials: string;
  participation: string;
  deliveryMethod: string;
  weight: string;
};

export type VirtualLearningUnit = {
  id: string;
  name: string;
  specificObjective: string;
  activityPeriod: string;
  generalWeight: string;
  criteria: {
    knowledge: boolean;
    skills: boolean;
    attitudes: boolean;
  };
  activities: VirtualActivity[];
};

export type VirtualActivitiesGuideData = {
  courseName: string;
  units: VirtualLearningUnit[];
};

const DEFAULT_MATERIALS =
  "Acceso a internet\nAcceso a la plataforma educativa\nEstar registrado en la plataforma.";

export function emptyVirtualActivity(): VirtualActivity {
  return {
    id: crypto.randomUUID(),
    title: "",
    instructions: "",
    materials: DEFAULT_MATERIALS,
    participation: "Individual",
    deliveryMethod: "",
    weight: "0%",
  };
}

export function emptyVirtualUnit(index: number): VirtualLearningUnit {
  return {
    id: crypto.randomUUID(),
    name: `Unidad ${index}: `,
    specificObjective: "",
    activityPeriod: "Indefinido",
    generalWeight: "50%",
    criteria: { knowledge: true, skills: false, attitudes: false },
    activities: [emptyVirtualActivity()],
  };
}

export function createEmptyVirtualActivitiesGuide(prefill?: {
  courseName?: string;
}): VirtualActivitiesGuideData {
  return {
    courseName: prefill?.courseName ?? "",
    units: [emptyVirtualUnit(1)],
  };
}

export function hydrateVirtualActivitiesGuide(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyVirtualActivitiesGuide>[0],
): VirtualActivitiesGuideData {
  const base = createEmptyVirtualActivitiesGuide(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<VirtualActivitiesGuideData>;

  const units =
    Array.isArray(data.units) && data.units.length > 0
      ? data.units.map((u) => ({
          id: u.id || crypto.randomUUID(),
          name: u.name ?? "",
          specificObjective: u.specificObjective ?? "",
          activityPeriod: u.activityPeriod ?? "Indefinido",
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
                  participation: a.participation ?? "Individual",
                  deliveryMethod: a.deliveryMethod ?? "",
                  weight: a.weight ?? "0%",
                }))
              : [emptyVirtualActivity()],
        }))
      : base.units;

  return { ...base, ...data, units };
}
