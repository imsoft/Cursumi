import type { PlanningPrefill } from "./prefill";
import { parseDurationToMinutes } from "@/lib/utils";

export const COURSE_INFO_TYPE = "course-info-document" as const;

export type CourseTopic = {
  id: string;
  title: string;
  objective: string;
  hours: number;
};

export type EvaluationItem = {
  id: string;
  text: string;
};

export type CourseInfoDocumentData = {
  courseName: string;
  generalObjective: string;
  topics: CourseTopic[];
  introduction: string;
  methodology: string;
  visualGuide: string;
  targetAudience: string;
  noPriorKnowledge: string;
  requiredSkills: string;
  requiredMaterials: string;
  evaluationItems: EvaluationItem[];
  durationDays: number;
  developerName: string;
  developerRole: string;
};

export function totalHours(topics: CourseTopic[]): number {
  return topics.reduce((sum, t) => sum + (t.hours || 0), 0);
}

export function emptyTopic(): CourseTopic {
  return {
    id: crypto.randomUUID(),
    title: "",
    objective: "",
    hours: 0,
  };
}

export function emptyEvaluationItem(text = ""): EvaluationItem {
  return { id: crypto.randomUUID(), text };
}

export function createEmptyCourseInfoDocument(prefill?: Partial<PlanningPrefill>): CourseInfoDocumentData {
  // Cada sección → tema, con horas estimadas de la suma de duraciones de sus lecciones
  const topics: CourseTopic[] = (prefill?.units ?? []).map((u) => {
    const minutes = u.lessons.reduce((sum, l) => sum + parseDurationToMinutes(l.durationLabel), 0);
    return {
      id: crypto.randomUUID(),
      title: u.title,
      objective: "",
      hours: minutes > 0 ? Math.round((minutes / 60) * 10) / 10 : 0,
    };
  });

  return {
    courseName: prefill?.courseName ?? "",
    generalObjective: "",
    topics: topics.length > 0 ? topics : [emptyTopic()],
    introduction: prefill?.description ?? "",
    methodology: "",
    visualGuide: "",
    targetAudience: "",
    noPriorKnowledge: "",
    requiredSkills: "",
    requiredMaterials: "",
    evaluationItems: [emptyEvaluationItem()],
    durationDays: 0,
    developerName: prefill?.instructorName ?? "",
    developerRole: "DESARROLLADOR",
  };
}

export function hydrateCourseInfoDocument(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyCourseInfoDocument>[0],
): CourseInfoDocumentData {
  const base = createEmptyCourseInfoDocument(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<CourseInfoDocumentData>;

  const topics =
    Array.isArray(data.topics) && data.topics.length > 0
      ? data.topics.map((t) => ({
          id: t.id || crypto.randomUUID(),
          title: t.title ?? "",
          objective: t.objective ?? "",
          hours: typeof t.hours === "number" ? t.hours : 1,
        }))
      : base.topics;

  const evaluationItems =
    Array.isArray(data.evaluationItems) && data.evaluationItems.length > 0
      ? data.evaluationItems.map((e) => ({
          id: e.id || crypto.randomUUID(),
          text: e.text ?? "",
        }))
      : base.evaluationItems;

  return {
    ...base,
    ...data,
    durationDays: typeof data.durationDays === "number" ? data.durationDays : base.durationDays,
    topics,
    evaluationItems,
  };
}
