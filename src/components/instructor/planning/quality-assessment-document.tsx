/**
 * Plantilla visual de la Evaluación de calidad: portada Cursumi + cuestionario
 * por secciones, con la misma escala de opciones en cada pregunta.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type QualityAssessmentData } from "@/lib/planning/quality-assessment";
import { optionLetter } from "@/lib/planning/quiz-assessment";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

export function QualityAssessmentDocument({ data }: { data: QualityAssessmentData }) {
  const scale = data.scale.filter((o) => o.trim());
  const sections = data.sections.filter((s) => s.title.trim() || s.questions.some((p) => p.statement.trim()));

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle="Evaluación de calidad"
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
          {data.questionnaireTitle || "Cuestionario de calidad"}
        </h2>

        {data.instructions.trim() ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 20 }}>{data.instructions}</p>
        ) : null}

        {sections.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 13 }}>Aún no hay secciones.</p>
        ) : (
          sections.map((section) => {
            const questions = section.questions.filter((p) => p.statement.trim());
            return (
              <div key={section.id} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: PURPLE, marginBottom: 10 }}>{section.title}</h3>
                <ol style={{ margin: 0, paddingLeft: 22 }}>
                  {questions.map((p) => (
                    <li key={p.id} style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600 }}>{p.statement}</div>
                      <ol style={{ listStyleType: "none", margin: "6px 0 0", padding: 0 }}>
                        {scale.map((o, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, padding: "1px 0", marginLeft: 16 }}>
                            <span style={{ fontWeight: 700, color: PURPLE, minWidth: 16 }}>{optionLetter(i)}.</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
