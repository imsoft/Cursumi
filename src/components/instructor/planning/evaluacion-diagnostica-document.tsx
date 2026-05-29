/**
 * Plantilla visual de la Evaluación diagnóstica: portada Cursumi + cuestionario.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import {
  type EvaluacionDiagnosticaData,
  opcionLetra,
} from "@/lib/planning/evaluacion-diagnostica";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

export function EvaluacionDiagnosticaDocument({ data }: { data: EvaluacionDiagnosticaData }) {
  const preguntas = data.preguntas.filter((p) => p.enunciado.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle="Evaluación diagnóstica"
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
        <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 20 }}>
          {data.tituloCuestionario || "Cuestionario diagnóstico"}
        </h2>

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
