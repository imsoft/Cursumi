import type { PlanningPrefill } from "./prefill";

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

export function createEmptyVirtualParticipantManual(prefill?: Partial<PlanningPrefill>): VirtualParticipantManualData {
  // Índice a partir de la estructura del curso: sección (nivel 1) → lecciones (nivel 2)
  const sections: VirtualManualSection[] = (prefill?.units ?? []).flatMap((u) => [
    { id: crypto.randomUUID(), level: 1 as VirtualManualSectionLevel, title: u.title, body: "" },
    ...u.lessons.map((l) => ({
      id: crypto.randomUUID(),
      level: 2 as VirtualManualSectionLevel,
      title: l.title,
      body: "",
    })),
  ]);

  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    sections: sections.length > 0 ? sections : [emptyVirtualManualSection()],
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
