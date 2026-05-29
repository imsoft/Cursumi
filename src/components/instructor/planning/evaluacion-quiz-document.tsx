/**
 * Plantilla visual genérica para evaluaciones tipo cuestionario
 * (diagnóstica, formativa, sumativa): portada Cursumi + cuestionario.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type EvaluacionQuizData, opcionLetra } from "@/lib/planning/evaluacion-quiz";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

type Props = {
  documentTitle: string;
  fallbackCuestionarioTitulo: string;
  data: EvaluacionQuizData;
};

export function EvaluacionQuizDocument({ documentTitle, fallbackCuestionarioTitulo, data }: Props) {
  const preguntas = data.preguntas.filter((p) => p.enunciado.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle={documentTitle}
        courseName={data.nombreCurso}
        meta={[
          { label: "Instructor", value: data.nombreInstructor },
          { label: "Lugar de impartición", value: data.lugar },
          { label: "Fecha de impartición", value: data.fecha },
          { label: "Horario", value: data.horario },
          { label: "Duración", value: data.duracion },
        ]}
      />

      {/* Cuestionario */}
      <div style={{ padding: 48, color: TEXT, boxSizing: "border-box" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: data.instrucciones.trim() ? 10 : 20 }}>
          {data.tituloCuestionario || fallbackCuestionarioTitulo}
        </h2>

        {data.instrucciones.trim() ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 20 }}>{data.instrucciones}</p>
        ) : null}

        <ol style={{ margin: 0, paddingLeft: 22 }}>
          {preguntas.length === 0 ? (
            <li style={{ color: MUTED }}>Aún no hay preguntas.</li>
          ) : (
            preguntas.map((p) => (
              <li key={p.id} style={{ marginBottom: 16, fontSize: 13, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{p.enunciado}</div>
                <ol style={{ listStyleType: "none", margin: "8px 0 0", padding: 0 }}>
                  {p.opciones
                    .filter((o) => o.trim())
                    .map((o, i) => (
                      <li key={i} style={{ display: "flex", gap: 8, padding: "2px 0", marginLeft: 16 }}>
                        <span style={{ fontWeight: 700, color: PURPLE, minWidth: 16 }}>{opcionLetra(i)}.</span>
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
