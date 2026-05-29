/**
 * Plantilla visual del Manual del participante: portada Cursumi + tabla de
 * contenido autogenerada + secciones de texto + bibliografía.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCover } from "./planning-cover";
import { type ManualParticipanteData } from "@/lib/planning/manual-participante";

const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const BODY = "#27272a";

function parrafos(cuerpo: string) {
  return cuerpo
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function ManualParticipanteDocument({ data }: { data: ManualParticipanteData }) {
  const secciones = data.secciones.filter((s) => s.titulo.trim() || s.cuerpo.trim());
  const bibliografia = data.bibliografia.filter((b) => b.trim());
  const toc = secciones.filter((s) => s.titulo.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Portada */}
      <PlanningCover
        documentTitle="Manual del participante"
        courseName={data.nombreCurso}
        meta={[{ label: "Estándar de referencia", value: data.estandarReferencia }]}
      />

      {/* Tabla de contenido */}
      {data.mostrarContenido && toc.length > 0 ? (
        <div style={{ padding: 48, color: BODY, boxSizing: "border-box" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: PURPLE, marginBottom: 18 }}>Contenido</h2>
          <div>
            {toc.map((s) => (
              <div
                key={s.id}
                style={{
                  fontSize: 13,
                  lineHeight: 1.9,
                  paddingLeft: s.nivel === 2 ? 22 : 0,
                  fontWeight: s.nivel === 1 ? 700 : 400,
                  color: s.nivel === 1 ? TEXT : BODY,
                }}
              >
                {s.titulo}
              </div>
            ))}
            {bibliografia.length > 0 ? (
              <div style={{ fontSize: 13, lineHeight: 1.9, fontWeight: 700, color: TEXT }}>Bibliografía</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Secciones */}
      <div style={{ padding: 48, color: BODY, boxSizing: "border-box" }}>
        {secciones.map((s) => (
          <div key={s.id} style={{ marginBottom: s.nivel === 1 ? 18 : 12 }}>
            {s.titulo.trim() ? (
              s.nivel === 1 ? (
                <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 10px" }}>{s.titulo}</h2>
              ) : (
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>{s.titulo}</h3>
              )
            ) : null}
            {parrafos(s.cuerpo).map((p, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.7, textAlign: "justify", textIndent: 24, margin: "0 0 8px" }}>
                {p}
              </p>
            ))}
          </div>
        ))}

        {/* Bibliografía */}
        {bibliografia.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 12px" }}>Bibliografía</h2>
            {bibliografia.map((b, i) => (
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
