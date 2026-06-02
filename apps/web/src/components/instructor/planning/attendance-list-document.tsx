/**
 * Plantilla visual (membrete Cursumi) de la Lista de asistencia.
 * Solo colores fijos (hex), NO tokens del tema (oklch), para no romper html2canvas.
 */

import type { AttendanceListData } from "@/lib/planning/attendance-list";

const PURPLE = "#6d28d9";
const PURPLE_SOFT = "#f5f3ff";
const BORDER = "#c4b5fd";
const TEXT = "#1f1147";

const cellStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "8px 8px",
  fontSize: 11,
  verticalAlign: "middle",
  color: TEXT,
  lineHeight: 1.35,
};

const labelCell: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
  fontStyle: "italic",
  color: PURPLE,
  width: "22%",
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
  textAlign: "center",
};

export function AttendanceListDocument({ data }: { data: AttendanceListData }) {
  return (
    <div
      style={{
        width: 794,
        background: "#ffffff",
        color: TEXT,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: 40,
        boxSizing: "border-box",
      }}
    >
      {/* Membrete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: PURPLE,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 20,
          }}
        >
          C
        </div>
      </div>

      {/* Título */}
      <div
        style={{
          background: PURPLE,
          color: "#fff",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 14,
          padding: "8px 10px",
          borderRadius: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Lista de asistencia
      </div>

      {/* Encabezado de datos */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <tbody>
          <tr>
            <td style={labelCell}>Nombre del curso / sesión:</td>
            <td style={cellStyle} colSpan={3}>{data.courseName || "—"}</td>
          </tr>
          <tr>
            <td style={labelCell}>Nombre del facilitador / instructor:</td>
            <td style={cellStyle}>{data.instructorName || "—"}</td>
            <td style={labelCell}>Lugar de impartición:</td>
            <td style={cellStyle}>{data.location || "—"}</td>
          </tr>
          <tr>
            <td style={labelCell}>Duración del curso:</td>
            <td style={cellStyle}>{data.duration || "—"}</td>
            <td style={labelCell}>Horario:</td>
            <td style={cellStyle}>{data.schedule || "—"}</td>
          </tr>
          <tr>
            <td style={labelCell}>Fecha de impartición:</td>
            <td style={cellStyle} colSpan={3}>{data.date || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Tabla de asistencia */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "8%" }}>No.</th>
            <th style={{ ...thStyle, width: "52%" }}>Nombre</th>
            <th style={{ ...thStyle, width: "40%" }}>Firma</th>
          </tr>
        </thead>
        <tbody>
          {data.participants.map((p, idx) => (
            <tr key={p.id}>
              <td style={{ ...cellStyle, textAlign: "center", height: 22 }}>{idx + 1}</td>
              <td style={cellStyle}>{p.name}</td>
              <td style={cellStyle} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
