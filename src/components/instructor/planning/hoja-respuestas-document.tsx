/**
 * Plantilla visual de la Hoja de Respuestas: portada Cursumi + clave de
 * respuestas por temas, con la opción correcta resaltada en amarillo.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type HojaRespuestasData } from "@/lib/planning/hoja-respuestas";
import { opcionLetra } from "@/lib/planning/evaluacion-quiz";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const HIGHLIGHT = "#fde047";

export function HojaRespuestasDocument({ data }: { data: HojaRespuestasData }) {
  const temas = data.temas.filter((t) => t.titulo.trim() || t.preguntas.some((p) => p.enunciado.trim()));

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada (una página A4) */}
      <PlanningCover
        documentTitle="Hoja de Respuestas"
        courseName={data.nombreCurso}
        meta={[
          { label: "Instructor", value: data.nombreInstructor },
          { label: "Lugar de impartición", value: data.lugar },
          { label: "Fecha de impartición", value: data.fecha },
          { label: "Horario", value: data.horario },
          { label: "Duración", value: data.duracion },
        ]}
      />

      {/* Contenido */}
      <div style={{ padding: 48, color: TEXT, boxSizing: "border-box" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: TEXT, marginBottom: 20 }}>
          {data.tituloDocumento || "Hoja de Respuestas"}
        </h2>

        {temas.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 13 }}>Aún no hay temas.</p>
        ) : (
          temas.map((tema) => {
            const preguntas = tema.preguntas.filter((p) => p.enunciado.trim());
            return (
              <div key={tema.id} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: PURPLE, marginBottom: tema.instrucciones.trim() ? 6 : 10 }}>
                  {tema.titulo}
                </h3>
                {tema.instrucciones.trim() ? (
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, marginBottom: 12 }}>{tema.instrucciones}</p>
                ) : null}

                <ol style={{ margin: 0, paddingLeft: 22 }}>
                  {preguntas.map((p) => (
                    <li key={p.id} style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600 }}>{p.enunciado}</div>
                      <ol style={{ listStyleType: "none", margin: "6px 0 0", padding: 0 }}>
                        {p.opciones
                          .filter((o) => o.trim())
                          .map((o, i) => {
                            const correcta = p.correctaIndex === i;
                            return (
                              <li
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  padding: "2px 6px",
                                  marginLeft: 16,
                                  background: correcta ? HIGHLIGHT : "transparent",
                                  borderRadius: 3,
                                  fontWeight: correcta ? 600 : 400,
                                }}
                              >
                                <span style={{ fontWeight: 700, color: correcta ? TEXT : PURPLE, minWidth: 16 }}>{opcionLetra(i)}.</span>
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
