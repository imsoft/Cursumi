/**
 * Portada unificada de documentos de planeación (look & feel Cursumi).
 * Una página A4 (794 × 1123 px), colores fijos para html2canvas.
 *
 * Soporta dos variantes de pie:
 *  - `meta`: ficha de datos (instructor, lugar, fecha…) — usado por presenciales.
 *  - `referenceStandard`: bloque de estándar de referencia — usado por virtuales.
 * Ambos pueden coexistir o ir vacíos.
 */

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const PURPLE_SOFT = "#f5f3ff";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const WHITE = "#ffffff";

const A4_W = 794;
const A4_H = 1123;

export type PlanningCoverMeta = { label: string; value: string }[];

export function PlanningCoverV2({
  documentTitle,
  courseName,
  meta,
  referenceStandard,
}: {
  documentTitle: string;
  courseName: string;
  meta?: PlanningCoverMeta;
  referenceStandard?: string;
}) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: WHITE,
        color: TEXT,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Banda superior */}
      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "64px 72px 56px" }}>
        {/* Nombre del curso */}
        <p style={{ fontSize: 14, color: PURPLE, fontWeight: 500, margin: "0 0 44px", lineHeight: 1.4 }}>
          {courseName || "—"}
        </p>

        {/* Logo real */}
        <div style={{ marginBottom: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-512.png" alt="Cursumi" width={84} height={84} style={{ display: "block" }} />
        </div>

        {/* Título del documento */}
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: PURPLE,
            margin: "0 0 20px",
            lineHeight: 1.05,
            letterSpacing: "-1px",
            textTransform: "uppercase",
          }}
        >
          {documentTitle}
        </h1>

        <div style={{ height: 5, width: 84, background: GRADIENT, borderRadius: 3, marginBottom: 28 }} />

        <div style={{ flex: 1 }} />

        {/* Ficha de datos (presenciales) */}
        {meta && meta.length > 0 && (
          <div
            style={{
              background: PURPLE_SOFT,
              border: `1px solid ${PURPLE}`,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: referenceStandard ? 24 : 0,
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
        )}

        {/* Estándar de referencia (virtuales) */}
        {referenceStandard && (
          <div style={{ textAlign: "right", maxWidth: 300, alignSelf: "flex-end" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, margin: "0 0 6px", letterSpacing: "0.05em" }}>
              Estándar de Referencia
            </p>
            <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.5 }}>{referenceStandard}</p>
          </div>
        )}
      </div>

      {/* Banda inferior */}
      <div style={{ height: 6, background: GRADIENT, flexShrink: 0 }} />

      {/* Acento vertical izquierdo */}
      <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 4, background: GRADIENT, opacity: 0.35 }} />
    </div>
  );
}
