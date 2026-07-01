/**
 * Plantilla visual del Informe final del curso: portada + ficha de datos +
 * secciones de texto. Solo colores fijos (hex) para no romper html2canvas.
 */

import { PlanningCoverV2 } from "./planning-cover-v2";
import type { InformeFinalData } from "@/lib/planning/informe-final";

const PURPLE = "#6d28d9";
const PURPLE_SOFT = "#f5f3ff";
const BORDER = "#c4b5fd";
const TEXT = "#1f1147";
const BODY = "#27272a";

function parrafos(body: string) {
  return body.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

const cellStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "8px 10px",
  fontSize: 12,
  color: TEXT,
  lineHeight: 1.4,
};

const labelCell: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
  color: PURPLE,
  width: "24%",
};

export function InformeFinalDocument({ data }: { data: InformeFinalData }) {
  const textSections: { title: string; body: string }[] = [
    { title: "Objetivos", body: data.objectivesSummary },
    { title: "Desarrollo / metodología", body: data.developmentSummary },
    { title: "Resultados", body: data.results },
    { title: "Observaciones", body: data.observations },
    { title: "Recomendaciones", body: data.recommendations },
    { title: "Conclusiones", body: data.conclusions },
  ].filter((s) => s.body.trim());

  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <PlanningCoverV2
        documentTitle="Informe final del curso"
        courseName={data.courseName}
        meta={[
          { label: "Instructor", value: data.instructorName },
          { label: "Periodo", value: data.period },
          { label: "Lugar", value: data.location },
        ]}
      />

      <div style={{ padding: 48, color: BODY, boxSizing: "border-box" }}>
        {/* Ficha de participación */}
        <h2 style={{ fontSize: 19, fontWeight: 800, color: TEXT, margin: "0 0 12px" }}>Datos del curso</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <tbody>
            <tr>
              <td style={labelCell}>Instructor</td>
              <td style={cellStyle}>{data.instructorName || "—"}</td>
              <td style={labelCell}>Periodo</td>
              <td style={cellStyle}>{data.period || "—"}</td>
            </tr>
            <tr>
              <td style={labelCell}>Lugar</td>
              <td style={cellStyle} colSpan={3}>{data.location || "—"}</td>
            </tr>
            <tr>
              <td style={labelCell}>Inscritos</td>
              <td style={cellStyle}>{data.enrolledCount || "—"}</td>
              <td style={labelCell}>Concluyeron</td>
              <td style={cellStyle}>{data.completedCount || "—"}</td>
            </tr>
            <tr>
              <td style={labelCell}>Aprobados</td>
              <td style={cellStyle} colSpan={3}>{data.approvedCount || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* Secciones de texto */}
        {textSections.map((s) => (
          <div key={s.title} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>{s.title}</h3>
            {parrafos(s.body).map((p, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.7, textAlign: "justify", margin: "0 0 8px" }}>
                {p}
              </p>
            ))}
          </div>
        ))}

        {/* Firma */}
        <div style={{ marginTop: 48, width: 300 }}>
          <div style={{ borderTop: `1.5px solid ${TEXT}`, marginBottom: 8 }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{data.elaboratedBy || "—"}</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
            Elaboró{data.date ? ` — ${data.date}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
