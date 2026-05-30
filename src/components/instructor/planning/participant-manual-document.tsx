/**
 * Plantilla visual del Manual del participante: portada Cursumi + tabla de
 * contenido autogenerada + secciones de texto + bibliografía.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCoverV2 } from "./planning-cover-v2";
import { type ParticipantManualData } from "@/lib/planning/participant-manual";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const BODY = "#27272a";

function parrafos(body: string) {
  return body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function ParticipantManualDocument({ data }: { data: ParticipantManualData }) {
  const sections = data.sections.filter((s) => s.title.trim() || s.body.trim());
  const bibliography = data.bibliography.filter((b) => b.trim());
  const toc = sections.filter((s) => s.title.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada */}
      <PlanningCoverV2
        documentTitle="Manual del participante"
        courseName={data.courseName}
        meta={[{ label: "Estándar de referencia", value: data.referenceStandard }]}
      />

      {/* Tabla de contenido */}
      {data.showTableOfContents && toc.length > 0 ? (
        <div style={{ padding: 48, color: BODY, boxSizing: "border-box" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: PURPLE, marginBottom: 18 }}>Contenido</h2>
          <div>
            {toc.map((s) => (
              <div
                key={s.id}
                style={{
                  fontSize: 13,
                  lineHeight: 1.9,
                  paddingLeft: s.level === 2 ? 22 : 0,
                  fontWeight: s.level === 1 ? 700 : 400,
                  color: s.level === 1 ? TEXT : BODY,
                }}
              >
                {s.title}
              </div>
            ))}
            {bibliography.length > 0 ? (
              <div style={{ fontSize: 13, lineHeight: 1.9, fontWeight: 700, color: TEXT }}>Bibliografía</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Secciones */}
      <div style={{ padding: 48, color: BODY, boxSizing: "border-box" }}>
        {sections.map((s) => (
          <div key={s.id} style={{ marginBottom: s.level === 1 ? 18 : 12 }}>
            {s.title.trim() ? (
              s.level === 1 ? (
                <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 10px" }}>{s.title}</h2>
              ) : (
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>{s.title}</h3>
              )
            ) : null}
            {parrafos(s.body).map((p, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.7, textAlign: "justify", textIndent: 24, margin: "0 0 8px" }}>
                {p}
              </p>
            ))}
          </div>
        ))}

        {/* Bibliografía */}
        {bibliography.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 12px" }}>Bibliografía</h2>
            {bibliography.map((b, i) => (
              <p
                key={i}
                style={{ fontSize: 13, lineHeight: 1.6, textAlign: "justify", paddingLeft: 24, textIndent: -24, margin: "0 0 8px" }}
              >
                {b}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
