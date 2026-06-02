export const PARTICIPANT_MANUAL_TYPE = "manual-participante" as const;

export type SectionLevel = 1 | 2;

export type ManualSection = {
  id: string;
  level: SectionLevel;
  title: string;
  body: string;
};

export type ParticipantManualData = {
  courseName: string;
  referenceStandard: string;
  showTableOfContents: boolean;
  sections: ManualSection[];
  bibliography: string[];
};

export function emptyManualSection(level: SectionLevel = 1): ManualSection {
  return { id: crypto.randomUUID(), level, title: "", body: "" };
}

export function createEmptyParticipantManual(prefill?: { courseName?: string }): ParticipantManualData {
  return {
    courseName: prefill?.courseName ?? "",
    referenceStandard: "",
    showTableOfContents: true,
    sections: [emptyManualSection()],
    bibliography: [""],
  };
}

export function hydrateParticipantManual(raw: unknown, prefill?: { courseName?: string }): ParticipantManualData {
  const base = createEmptyParticipantManual(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ParticipantManualData>;

  const sections =
    Array.isArray(data.sections) && data.sections.length > 0
      ? data.sections.map((s) => ({
          id: s.id || crypto.randomUUID(),
          level: (s.level === 2 ? 2 : 1) as SectionLevel,
          title: s.title ?? "",
          body: s.body ?? "",
        }))
      : base.sections;

  const bibliography =
    Array.isArray(data.bibliography) && data.bibliography.length > 0 ? data.bibliography.map((b) => b ?? "") : base.bibliography;

  return {
    ...base,
    ...data,
    showTableOfContents: data.showTableOfContents ?? base.showTableOfContents,
    sections,
    bibliography,
  };
}
