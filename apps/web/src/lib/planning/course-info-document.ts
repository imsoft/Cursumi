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

export function createEmptyCourseInfoDocument(prefill?: {
  courseName?: string;
  instructorName?: string;
}): CourseInfoDocumentData {
  return {
    courseName: prefill?.courseName ?? "",
    generalObjective: "",
    topics: [emptyTopic()],
    introduction: "",
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
