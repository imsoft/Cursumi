"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { EvaluacionQuizForm } from "./evaluacion-quiz-form";
import { EvaluacionQuizDocument } from "./evaluacion-quiz-document";
import {
  type EvaluacionQuizData,
  hydrateEvaluacionQuiz,
  EVALUACION_TITULO,
  EVALUACION_CUESTIONARIO_TITULO,
} from "@/lib/planning/evaluacion-quiz";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  type: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function EvaluacionQuizClient({ courseId, type, initialData, initialStatus, prefill }: Props) {
  const documentTitle = EVALUACION_TITULO[type] ?? "Evaluación";
  const fallbackCuestionario = EVALUACION_CUESTIONARIO_TITULO[type] ?? documentTitle;

  return (
    <PlanningDocShell<EvaluacionQuizData>
      courseId={courseId}
      type={type}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateEvaluacionQuiz(raw, fallbackCuestionario, prefill)}
      renderForm={(value, onChange) => <EvaluacionQuizForm value={value} onChange={onChange} />}
      renderDocument={(value) => (
        <EvaluacionQuizDocument
          documentTitle={documentTitle}
          fallbackCuestionarioTitulo={fallbackCuestionario}
          data={value}
        />
      )}
      pdfFilename={(value) => `${sanitizeFilename(documentTitle)}-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
