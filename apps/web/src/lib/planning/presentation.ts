import type { PlanningPrefill } from "./prefill";

export const PRESENTATION_TYPE = "presentation" as const;

export type SlideKind = "cover" | "section" | "content" | "closing";

export type Slide = {
  id: string;
  kind: SlideKind;
  heading: string;
  sub: string;
  bullets: string[];
};

export type PresentationData = {
  courseName: string;
  presenter: string;
  slides: Slide[];
};

export const SLIDE_KIND_LABEL: Record<SlideKind, string> = {
  cover: "Portada",
  section: "Tema / sección",
  content: "Contenido",
  closing: "Cierre",
};

export function emptySlide(kind: SlideKind): Slide {
  switch (kind) {
    case "cover":
      return { id: crypto.randomUUID(), kind, heading: "", sub: "", bullets: [] };
    case "section":
      return { id: crypto.randomUUID(), kind, heading: "", sub: "", bullets: [] };
    case "content":
      return { id: crypto.randomUUID(), kind, heading: "", sub: "", bullets: [""] };
    case "closing":
      return { id: crypto.randomUUID(), kind, heading: "", sub: "", bullets: [] };
  }
}

export function createEmptyPresentation(prefill?: Partial<PlanningPrefill>): PresentationData {
  const courseName = prefill?.courseName ?? "";
  const presenter = prefill?.instructorName ?? "";

  // Portada + una diapositiva de sección y de contenido (con las lecciones) por cada sección del curso
  const structuredSlides: Slide[] = (prefill?.units ?? []).flatMap((u) => [
    { id: crypto.randomUUID(), kind: "section" as SlideKind, heading: u.title, sub: "", bullets: [] },
    {
      id: crypto.randomUUID(),
      kind: "content" as SlideKind,
      heading: u.title,
      sub: "",
      bullets: u.lessons.length ? u.lessons.map((l) => l.title) : [""],
    },
  ]);

  const slides: Slide[] = structuredSlides.length
    ? [
        { id: crypto.randomUUID(), kind: "cover", heading: courseName, sub: presenter, bullets: [] },
        ...structuredSlides,
        { id: crypto.randomUUID(), kind: "closing", heading: "", sub: "", bullets: [] },
      ]
    : [
        { id: crypto.randomUUID(), kind: "cover", heading: courseName, sub: presenter, bullets: [] },
        { id: crypto.randomUUID(), kind: "content", heading: "", sub: "", bullets: [""] },
      ];

  return { courseName, presenter, slides };
}

const VALID_KINDS: SlideKind[] = ["cover", "section", "content", "closing"];

export function hydratePresentation(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyPresentation>[0],
): PresentationData {
  const base = createEmptyPresentation(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<PresentationData>;

  const slides =
    Array.isArray(data.slides) && data.slides.length > 0
      ? data.slides.map((s) => ({
          id: s.id || crypto.randomUUID(),
          kind: (VALID_KINDS.includes(s.kind as SlideKind) ? s.kind : "content") as SlideKind,
          heading: s.heading ?? "",
          sub: s.sub ?? "",
          bullets: Array.isArray(s.bullets) ? s.bullets.map((b) => b ?? "") : [],
        }))
      : base.slides;

  return { ...base, ...data, slides };
}
