"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { QuizAssessmentForm } from "./quiz-assessment-form";
import { QuizAssessmentDocument } from "./quiz-assessment-document";
import {
  type QuizAssessmentData,
  hydrateQuizAssessment,
  ASSESSMENT_TITLE,
  QUESTIONNAIRE_TITLE,
  SUMMATIVE_ASSESSMENT_TYPE,
} from "@/lib/planning/quiz-assessment";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  type: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function QuizAssessmentClient({ courseId, type, initialData, initialStatus, prefill }: Props) {
  const documentTitle = ASSESSMENT_TITLE[type] ?? "Evaluación";
  const fallbackQuestionnaireTitle = QUESTIONNAIRE_TITLE[type] ?? documentTitle;
  // Solo la evaluación sumativa reutiliza las preguntas del examen final del curso
  const seedQuestions = type === SUMMATIVE_ASSESSMENT_TYPE;

  return (
    <PlanningDocShell<QuizAssessmentData>
      courseId={courseId}
      type={type}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateQuizAssessment(raw, fallbackQuestionnaireTitle, prefill, seedQuestions)}
      seedFromCourse={() => hydrateQuizAssessment(null, fallbackQuestionnaireTitle, prefill, seedQuestions)}
      renderForm={(value, onChange) => <QuizAssessmentForm value={value} onChange={onChange} />}
      renderDocument={(value) => (
        <QuizAssessmentDocument
          documentTitle={documentTitle}
          fallbackQuestionnaireTitle={fallbackQuestionnaireTitle}
          data={value}
        />
      )}
      pdfFilename={(value) => buildPlanningFilename(type, value.courseName)}
    />
  );
}
