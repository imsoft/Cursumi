/**
 * Plantilla visual (membrete Cursumi) del Contrato de aprendizaje.
 * Solo colores fijos (hex), NO tokens del tema (oklch), para no romper html2canvas.
 */

import type { LearningContractData, CommitmentRow } from "@/lib/planning/learning-contract";

const PURPLE = "#6d28d9";
const PURPLE_SOFT = "#f5f3ff";
const BORDER = "#c4b5fd";
const TEXT = "#1f1147";

const cellStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "6px 8px",
  fontSize: 11,
  verticalAlign: "top",
  color: TEXT,
  lineHeight: 1.4,
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
};

function CommitmentsTable({ rows }: { rows: CommitmentRow[] }) {
  const visible = rows.filter((r) => r.description.trim());
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: "8%", textAlign: "center" }}>No.</th>
          <th style={thStyle}>Descripción</th>
        </tr>
      </thead>
      <tbody>
        {visible.map((r, idx) => (
          <tr key={r.id}>
            <td style={{ ...cellStyle, textAlign: "center" }}>{idx + 1}</td>
            <td style={cellStyle}>{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignatureLine({ caption, name }: { caption: string; name?: string }) {
  return (
    <div style={{ width: "45%", textAlign: "center" }}>
      <div style={{ borderTop: `1px solid ${TEXT}`, marginBottom: 6 }} />
      <div style={{ fontSize: 11, color: TEXT }}>{caption}</div>
      {name ? <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: TEXT }}>{name}</div> : null}
    </div>
  );
}

export function LearningContractDocument({ data }: { data: LearningContractData }) {
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
        Contrato de aprendizaje
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
            <td style={labelCell}>Duración del curso / sesión:</td>
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

      {/* 1. Compromisos del facilitador */}
      <div style={{ fontWeight: 700, fontSize: 12, marginTop: 18, color: TEXT }}>
        1. Compromisos del facilitador / instructor / capacitador / formador
      </div>
      <CommitmentsTable rows={data.facilitatorCommitments} />

      {/* 2. Compromisos del participante */}
      <div style={{ fontWeight: 700, fontSize: 12, marginTop: 18, color: TEXT }}>
        2. Compromisos del participante
      </div>
      <CommitmentsTable rows={data.participantCommitments} />

      {/* Firmas */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 64 }}>
        <SignatureLine caption="Nombre y firma del participante" />
        <SignatureLine
          caption="Firma del facilitador / instructor / capacitador / formador"
          name={data.instructorName || undefined}
        />
      </div>
    </div>
  );
}
