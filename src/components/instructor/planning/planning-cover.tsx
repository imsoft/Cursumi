/**
 * Portada reutilizable para documentos de planeación (look & feel Cursumi).
 * Una página A4 (794 × 1123 px) con colores fijos para html2canvas.
 */

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4c1d95";
const PURPLE_SOFT = "#f5f3ff";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

const A4_W = 794;
const A4_H = 1123;

export type PlanningCoverMeta = {
  label: string;
  value: string;
}[];

export function PlanningCover({
  documentTitle,
  courseName,
  meta,
}: {
  documentTitle: string;
  courseName: string;
  meta: PlanningCoverMeta;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#ffffff",
        color: TEXT,
        fontFamily: "Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Banda superior con degradado de marca */}
      <div style={{ height: 10, background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})` }} />

      {/* Marca */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 56px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-512.png" alt="Cursumi" width={32} height={32} style={{ display: "block" }} />
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.5, color: PURPLE }}>Cursumi</span>
      </div>

      {/* Encabezado del documento */}
      <div style={{ padding: "48px 56px 0" }}>
        <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.4, marginBottom: 14 }}>{courseName || "—"}</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: PURPLE, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: -0.5 }}>
          {documentTitle}
        </div>
        <div style={{ width: 110, height: 5, background: PURPLE, borderRadius: 999, marginTop: 22 }} />
      </div>

      {/* Logo central */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-512.png" alt="Cursumi" width={220} height={220} style={{ display: "block" }} />
      </div>

      {/* Ficha de datos */}
      <div style={{ padding: "0 56px 56px" }}>
        <div
          style={{
            background: PURPLE_SOFT,
            border: `1px solid ${PURPLE}`,
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          {meta.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                fontSize: 13,
                lineHeight: 1.6,
                padding: "3px 0",
                borderTop: i === 0 ? "none" : `1px solid ${PURPLE}22`,
              }}
            >
              <span style={{ fontWeight: 700, color: PURPLE, minWidth: 170 }}>{m.label}:</span>
              <span style={{ color: TEXT }}>{m.value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Banda inferior */}
      <div style={{ height: 10, background: `linear-gradient(90deg, ${PURPLE}, ${PURPLE_DARK})` }} />
    </div>
  );
}
