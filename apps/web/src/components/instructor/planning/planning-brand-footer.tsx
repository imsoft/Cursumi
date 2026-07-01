/**
 * Pie de marca Cursumi para los PDFs de planeación: logo + sitio web + @cursumi.
 * Colores fijos (hex) para no romper html2canvas. Ancho A4 (794) para no
 * distorsionar el corte de páginas.
 */

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const MUTED = "#6b7280";

export const CURSUMI_SITE = "cursumi.com";
export const CURSUMI_HANDLE = "@cursumi";

export function PlanningBrandFooter({ width = 794 }: { width?: number }) {
  return (
    <div style={{ width, background: "#ffffff", boxSizing: "border-box", padding: "0 40px 24px" }}>
      <div style={{ height: 3, background: GRADIENT, borderRadius: 2, marginBottom: 10 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-512.png"
            alt="Cursumi"
            width={22}
            height={22}
            style={{ display: "block", borderRadius: 5 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: PURPLE }}>Cursumi</span>
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {CURSUMI_SITE}
          <span style={{ margin: "0 8px", color: PURPLE }}>·</span>
          {CURSUMI_HANDLE}
        </div>
      </div>
    </div>
  );
}
