/**
 * Plantilla visual genérica para evaluaciones tipo cuestionario
 * (diagnóstica, formativa, sumativa): portada Cursumi + cuestionario.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCoverV2 } from "./planning-cover-v2";
import { type QuizAssessmentData, optionLetter } from "@/lib/planning/quiz-assessment";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

type Props = {
  documentTitle: string;
  fallbackQuestionnaireTitle: string;
  data: QuizAssessmentData;
};

export function QuizAssessmentDocument({ documentTitle, fallbackQuestionnaireTitle, data }: Props) {
  const questions = data.questions.filter((p) => p.statement.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCoverV2
        documentTitle={documentTitle}
        courseName={data.courseName}
        meta={[
          { label: "Instructor", value: data.instructorName },
          { label: "Lugar de impartición", value: data.location },
          { label: "Fecha de impartición", value: data.date },
          { label: "Horario", value: data.schedule },
          { label: "Duración", value: data.duration },
        ]}
      />

      {/* Cuestionario */}
      <div style={{ padding: 48, color: TEXT, boxSizing: "border-box" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: data.instructions.trim() ? 10 : 20 }}>
          {data.questionnaireTitle || fallbackQuestionnaireTitle}
        </h2>

        {data.instructions.trim() ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 20 }}>{data.instructions}</p>
        ) : null}

        <ol style={{ margin: 0, paddingLeft: 22 }}>
          {questions.length === 0 ? (
            <li style={{ color: MUTED }}>Aún no hay preguntas.</li>
          ) : (
            questions.map((p) => (
              <li key={p.id} style={{ marginBottom: 16, fontSize: 13, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{p.statement}</div>
                <ol style={{ listStyleType: "none", margin: "8px 0 0", padding: 0 }}>
                  {p.options
                    .filter((o) => o.trim())
                    .map((o, i) => (
                      <li key={i} style={{ display: "flex", gap: 8, padding: "2px 0", marginLeft: 16 }}>
                        <span style={{ fontWeight: 700, color: PURPLE, minWidth: 16 }}>{optionLetter(i)}.</span>
                        <span>{o}</span>
                      </li>
                    ))}
                </ol>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}
