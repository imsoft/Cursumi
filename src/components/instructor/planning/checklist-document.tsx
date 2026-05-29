/**
 * Plantilla visual (membrete Cursumi) de la Lista de verificación de requerimientos.
 * Solo colores fijos (hex), NO tokens del tema (oklch), para no romper html2canvas.
 */

import {
  type ChecklistData,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/lib/planning/checklist";

const PURPLE = "#6d28d9";
const PURPLE_SOFT = "#f5f3ff";
const BORDER = "#c4b5fd";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

const cellStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "5px 8px",
  fontSize: 11,
  verticalAlign: "top",
  color: TEXT,
  lineHeight: 1.35,
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
};

const labelCell: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
  fontStyle: "italic",
  color: PURPLE,
  width: "22%",
};

function Mark({ on }: { on: boolean }) {
  return <span style={{ fontWeight: 700, color: on ? PURPLE : "transparent" }}>{on ? "X" : "·"}</span>;
}

function CategoryTable({ items }: { items: ChecklistData["items"][keyof ChecklistData["items"]] }) {
  const visible = items.filter((i) => i.description.trim());
  return (
    <div style={{ marginTop: 4 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "8%" }}>No.</th>
            <th style={{ ...thStyle, width: "62%" }}>Descripción</th>
            <th style={{ ...thStyle, width: "15%", textAlign: "center" }}>Existe</th>
            <th style={{ ...thStyle, width: "15%", textAlign: "center" }}>No existe</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td style={{ ...cellStyle, textAlign: "center", color: MUTED }} colSpan={4}>—</td>
            </tr>
          ) : (
            visible.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ ...cellStyle, textAlign: "center" }}>{idx + 1}</td>
                <td style={cellStyle}>{item.description}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}><Mark on={item.status === "existe"} /></td>
                <td style={{ ...cellStyle, textAlign: "center" }}><Mark on={item.status === "no_existe"} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ChecklistDocument({ data }: { data: ChecklistData }) {
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
        }}
      >
        Lista de verificación de requerimientos
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

      {/* Categorías */}
      {CATEGORY_ORDER.map((key, i) => (
        <div key={key}>
          <div style={{ fontWeight: 700, fontSize: 12, marginTop: 16, color: TEXT }}>
            {i + 1}. {CATEGORY_LABELS[key]}
          </div>
          <CategoryTable items={data.items[key]} />
        </div>
      ))}
    </div>
  );
}
