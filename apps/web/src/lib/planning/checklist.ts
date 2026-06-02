export const CHECKLIST_TYPE = "lista-verificacion" as const;

export type RequirementStatus = "existe" | "no_existe" | "";

export type RequirementItem = {
  id: string;
  description: string;
  status: RequirementStatus;
};

export type CategoryKey =
  | "instalaciones"
  | "equipo"
  | "materiales"
  | "humanos"
  | "seguridad";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  instalaciones: "Instalaciones, mobiliario y su distribución",
  equipo: "Equipo de apoyo",
  materiales: "Materiales didácticos de apoyo y servicios",
  humanos: "Requerimientos humanos",
  seguridad: "Medidas de salud / seguridad / higiene / protección civil",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "instalaciones",
  "equipo",
  "materiales",
  "humanos",
  "seguridad",
];

export type ChecklistData = {
  courseName: string;
  instructorName: string;
  location: string;
  duration: string;
  schedule: string;
  date: string;
  items: Record<CategoryKey, RequirementItem[]>;
};

export function emptyItem(): RequirementItem {
  return { id: crypto.randomUUID(), description: "", status: "" };
}

export function createEmptyChecklist(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): ChecklistData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    duration: prefill?.duration ?? "",
    schedule: "",
    date: "",
    items: {
      instalaciones: [emptyItem()],
      equipo: [emptyItem()],
      materiales: [emptyItem()],
      humanos: [emptyItem()],
      seguridad: [emptyItem()],
    },
  };
}

export function verificationSummary(data: ChecklistData): { total: number; existing: number } {
  let total = 0;
  let existing = 0;
  for (const key of CATEGORY_ORDER) {
    for (const item of data.items[key]) {
      if (!item.description.trim()) continue;
      total += 1;
      if (item.status === "existe") existing += 1;
    }
  }
  return { total, existing };
}

export function hydrateChecklist(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyChecklist>[0],
): ChecklistData {
  const base = createEmptyChecklist(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ChecklistData>;

  const ensureItems = (rows: RequirementItem[] | undefined): RequirementItem[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [emptyItem()];
    return rows.map((r) => ({
      id: r.id || crypto.randomUUID(),
      description: r.description ?? "",
      status: (["existe", "no_existe", ""].includes(r.status as string) ? r.status : "") as RequirementStatus,
    }));
  };

  const rawItems = (data.items ?? {}) as Partial<Record<CategoryKey, RequirementItem[]>>;

  return {
    ...base,
    ...data,
    items: {
      instalaciones: ensureItems(rawItems.instalaciones),
      equipo: ensureItems(rawItems.equipo),
      materiales: ensureItems(rawItems.materiales),
      humanos: ensureItems(rawItems.humanos),
      seguridad: ensureItems(rawItems.seguridad),
    },
  };
}
