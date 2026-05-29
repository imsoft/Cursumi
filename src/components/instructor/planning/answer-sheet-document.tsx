/**
 * Plantilla visual de la Hoja de Respuestas: portada Cursumi + clave de
 * respuestas por temas, con la opción correcta resaltada en amarillo.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type AnswerSheetData } from "@/lib/planning/answer-sheet";
import { optionLetter } from "@/lib/planning/quiz-assessment";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const HIGHLIGHT = "#fde047";

export function AnswerSheetDocument({ data }: { data: AnswerSheetData }) {
  const topics = data.topics.filter((t) => t.title.trim() || t.questions.some((p) => p.statement.trim()));

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle="Hoja de Respuestas"
        courseName={data.courseName}
        meta={[
          { label: "Instructor", value: data.instructorName },
          { label: "Lugar de impartición", value: data.location },
          { label: "Fecha de impartición", value: data.date },
          { label: "Horario", value: data.schedule },
          { label: "Duración", value: data.duration },
        ]}
      />

      {/* Contenido */}
      <div style={{ padding: 48, color: TEXT, boxSizing: "border-box" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 20 }}>
          {data.documentTitle || "Hoja de Respuestas"}
        </h2>

        {topics.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 13 }}>Aún no hay temas.</p>
        ) : (
          topics.map((topic) => {
            const questions = topic.questions.filter((p) => p.statement.trim());
            return (
              <div key={topic.id} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: PURPLE, marginBottom: topic.instructions.trim() ? 6 : 10 }}>
                  {topic.title}
                </h3>
                {topic.instructions.trim() ? (
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 12 }}>{topic.instructions}</p>
                ) : null}

                <ol style={{ margin: 0, paddingLeft: 22 }}>
                  {questions.map((p) => (
                    <li key={p.id} style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600 }}>{p.statement}</div>
                      <ol style={{ listStyleType: "none", margin: "6px 0 0", padding: 0 }}>
                        {p.options
                          .filter((o) => o.trim())
                          .map((o, i) => {
                            const isCorrect = p.correctIndex === i;
                            return (
                              <li
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  padding: "2px 6px",
                                  marginLeft: 16,
                                  background: isCorrect ? HIGHLIGHT : "transparent",
                                  borderRadius: 3,
                                  fontWeight: isCorrect ? 600 : 400,
                                }}
                              >
                                <span style={{ fontWeight: 700, color: isCorrect ? TEXT : PURPLE, minWidth: 16 }}>{optionLetter(i)}.</span>
                                <span>{o}</span>
                              </li>
                            );
                          })}
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
