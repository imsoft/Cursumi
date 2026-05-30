import { type CourseReviewReportData, formatReviewDate } from "@/lib/planning/course-review-report";

const W = 794;
const PURPLE = "#6d28d9";
const PURPLE_DARK = "#5b21b6";
const PURPLE_LIGHT_HEADER = "#a78bfa";
const PURPLE_TEXT = "#7c3aed";
const WHITE = "#ffffff";
const BORDER = "#1f2937";

const cellBase: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "8px 10px",
  verticalAlign: "middle",
  boxSizing: "border-box" as const,
};

// dark purple label cell (left column of header info)
const labelCell: React.CSSProperties = {
  ...cellBase,
  backgroundColor: PURPLE_DARK,
  color: WHITE,
  fontSize: 11,
  fontWeight: 700,
  textAlign: "center",
  width: 160,
};

const valueCell: React.CSSProperties = {
  ...cellBase,
  color: PURPLE_TEXT,
  fontSize: 11,
  textAlign: "center",
  lineHeight: 1.4,
};

// light purple section header
const sectionHeaderCell: React.CSSProperties = {
  ...cellBase,
  backgroundColor: PURPLE_LIGHT_HEADER,
  color: WHITE,
  fontSize: 11,
  fontWeight: 700,
  textAlign: "center",
  lineHeight: 1.3,
};

const obsCell: React.CSSProperties = {
  ...cellBase,
  color: PURPLE_TEXT,
  fontSize: 11,
  textAlign: "center",
  verticalAlign: "top",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap" as const,
};

export function CourseReviewReportDocument({ data }: { data: CourseReviewReportData }) {
  return (
    <div style={{ width: W, background: WHITE, fontFamily: "Arial, Helvetica, sans-serif", padding: "32px 28px", boxSizing: "border-box" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textAlign: "center", margin: 0, letterSpacing: "0.02em", lineHeight: 1.4 }}>
            REPORTE PARA LA REVISIÓN DEL FUNCIONAMIENTO DEL CURSO DE FORMACIÓN EN LÍNEA
          </p>
        </div>
        <div style={{
          width: 48, height: 48, flexShrink: 0, marginLeft: 16,
          background: `linear-gradient(135deg, #4300d0, #6d28d9, #a400e3)`,
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: WHITE, fontWeight: 700, fontSize: 20 }}>C</span>
        </div>
      </div>

      {/* ── Main table ── */}
      <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
        <tbody>
          {/* Header info rows */}
          <tr>
            <td style={labelCell}>NOMBRE DEL CURSO:</td>
            <td style={valueCell} colSpan={2}>{data.courseName}</td>
          </tr>
          <tr>
            <td style={labelCell}>NOMBRE DEL DESARROLLADOR:</td>
            <td style={valueCell} colSpan={2}>{data.developerName}</td>
          </tr>
          <tr>
            <td style={labelCell}>FECHA DE REVISIÓN DEL CURSO:</td>
            <td style={valueCell} colSpan={2}>{formatReviewDate(data.reviewDate)}</td>
          </tr>

          {/* Design observations headers */}
          <tr>
            <td style={sectionHeaderCell}>OBSERVACIÓN DE DISEÑO</td>
            <td style={sectionHeaderCell}>UNIDAD O TEMA DONDE SE PRESENTÓ LA OBSERVACIÓN</td>
            <td style={sectionHeaderCell}>PROPUESTA DE MODIFICACIÓN</td>
          </tr>
          {/* Design observation rows */}
          {data.designObservations.map((obs) => (
            <tr key={obs.id}>
              <td style={obsCell}>{obs.observation}</td>
              <td style={obsCell}>{obs.unit}</td>
              <td style={obsCell}>{obs.proposal}</td>
            </tr>
          ))}

          {/* Content / platform headers */}
          <tr>
            <td style={sectionHeaderCell}>OBSERVACIONES DEL CONTENIDO</td>
            <td style={sectionHeaderCell} colSpan={2}>OBSERVACIONES DE LA FUNCIONALIDAD DE LA PLATAFORMA</td>
          </tr>
          <tr>
            <td style={{ ...obsCell, height: 90 }}>{data.contentObservations}</td>
            <td style={{ ...obsCell, height: 90 }} colSpan={2}>{data.platformObservations}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Signatures ── */}
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 80, gap: 40 }}>
        {["Nombre y Firma del Participante", "Nombre y Firma del desarrollador"].map((label) => (
          <div key={label} style={{ textAlign: "center", flex: 1, maxWidth: 300 }}>
            <div style={{ borderTop: `1px solid #9ca3af`, margin: "0 20px", paddingTop: 8 }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
