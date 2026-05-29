export const VIRTUAL_PARTICIPANT_MANUAL_TYPE = "virtual-participant-manual" as const;

export type VirtualManualSectionLevel = 1 | 2;

export type VirtualManualSection = {
  id: string;
  level: VirtualManualSectionLevel;
  title: string;
  body: string;
};

export type VirtualParticipantManualData = {
  courseName: string;
  referenceStandard: string;
  showTableOfContents: boolean;
  sections: VirtualManualSection[];
  bibliography: string[];
};

export function emptyVirtualManualSection(level: VirtualManualSectionLevel = 1): VirtualManualSection {
  return { id: crypto.randomUUID(), level, title: "", body: "" };
}

function section(level: VirtualManualSectionLevel, title: string, body = ""): VirtualManualSection {
  return { id: crypto.randomUUID(), level, title, body };
}

function defaultSections(): VirtualManualSection[] {
  return [
    section(1, "Presentación"),
    section(2, "Bienvenida"),
    section(2, "Recomendaciones de la forma de utilizar el manual"),
    section(2, "Otras recomendaciones para el estudio"),
    section(2, "Esquema de las unidades"),
    section(2, "Objetivo general"),
    section(1, "Introducción"),
    section(1, "Fundamentos"),
    section(1, "Desarrollo"),
    section(1, "Bibliografía"),
  ];
}

export function createEmptyVirtualParticipantManual(prefill?: {
  courseName?: string;
}): VirtualParticipantManualData {
  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    sections: defaultSections(),
    bibliography: [""],
  };
}

export function hydrateVirtualParticipantManual(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyVirtualParticipantManual>[0],
): VirtualParticipantManualData {
  const base = createEmptyVirtualParticipantManual(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<VirtualParticipantManualData>;

  const sections =
    Array.isArray(data.sections) && data.sections.length > 0
      ? data.sections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          level: (s.level === 2 ? 2 : 1) as VirtualManualSectionLevel,
          title: s.title ?? "",
          body: s.body ?? "",
        }))
      : base.sections;

  const bibliography =
    Array.isArray(data.bibliography) && data.bibliography.length > 0
      ? data.bibliography.map((b) => b ?? "")
      : base.bibliography;

  return {
    ...base,
    ...data,
    showTableOfContents: data.showTableOfContents ?? base.showTableOfContents,
    sections,
    bibliography,
  };
}
