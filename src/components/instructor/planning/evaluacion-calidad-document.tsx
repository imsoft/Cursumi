/**
 * Plantilla visual de la Evaluación de calidad: portada Cursumi + cuestionario
 * por secciones, con la misma escala de opciones en cada pregunta.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type EvaluacionCalidadData } from "@/lib/planning/evaluacion-calidad";
import { opcionLetra } from "@/lib/planning/evaluacion-quiz";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

export function EvaluacionCalidadDocument({ data }: { data: EvaluacionCalidadData }) {
  const escala = data.escala.filter((o) => o.trim());
  const secciones = data.secciones.filter((s) => s.titulo.trim() || s.preguntas.some((p) => p.enunciado.trim()));

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle="Evaluación de calidad"
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
          {data.tituloCuestionario || "Cuestionario de calidad"}
        </h2>

        {data.instrucciones.trim() ? (
          <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 20 }}>{data.instrucciones}</p>
        ) : null}

        {secciones.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 13 }}>Aún no hay secciones.</p>
        ) : (
          secciones.map((seccion) => {
            const preguntas = seccion.preguntas.filter((p) => p.enunciado.trim());
            return (
              <div key={seccion.id} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: PURPLE, marginBottom: 10 }}>{seccion.titulo}</h3>
                <ol style={{ margin: 0, paddingLeft: 22 }}>
                  {preguntas.map((p) => (
                    <li key={p.id} style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600 }}>{p.enunciado}</div>
                      <ol style={{ listStyleType: "none", margin: "6px 0 0", padding: 0 }}>
                        {escala.map((o, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, padding: "1px 0", marginLeft: 16 }}>
                            <span style={{ fontWeight: 700, color: PURPLE, minWidth: 16 }}>{opcionLetra(i)}.</span>
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
