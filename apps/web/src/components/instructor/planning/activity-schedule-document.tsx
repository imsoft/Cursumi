import {
  type ActivityScheduleData,
  computePeriodDates,
  computeWeekGroups,
  formatPeriodDate,
  formatDateES,
} from "@/lib/planning/activity-schedule";

// A4 landscape = 1123 × 794 px at 96 dpi
const DOC_WIDTH = 1123;
const INFO_WIDTH = 340; // activity name + 4 number columns
const MIN_CELL = 14;
const PURPLE = "#6d28d9";
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const PLAN_COLOR = "#ede9fe";
const DONE_COLOR = "#7c3aed";
const REAL_OVER_COLOR = "#fed7aa";
const HIGHLIGHT_COL = "#fef9c3";

function cellBg(
  period: number,       // 1-indexed
  planStart: number,
  planDuration: number,
  realStart: number,
  realDuration: number,
  highlighted: number,
): { bg: string; opacity?: number } {
  const inPlan = period >= planStart && period < planStart + planDuration;
  const inReal = realStart > 0 && period >= realStart && period < realStart + realDuration;

  if (inReal && inPlan)  return { bg: DONE_COLOR };
  if (inReal && !inPlan) return { bg: REAL_OVER_COLOR };
  if (inPlan)            return { bg: PLAN_COLOR };
  return { bg: period === highlighted ? HIGHLIGHT_COL : "transparent" };
}

export function ActivityScheduleDocument({ data }: { data: ActivityScheduleData }) {
  const dates = computePeriodDates(data.creationDate, data.totalPeriods);
  const weekGroups = computeWeekGroups(dates);

  const ganttWidth = Math.max(data.totalPeriods * MIN_CELL, DOC_WIDTH - INFO_WIDTH);
  const cellW = data.totalPeriods > 0 ? Math.floor(ganttWidth / data.totalPeriods) : 0;
  const docWidth = INFO_WIDTH + data.totalPeriods * cellW;

  const periods = Array.from({ length: data.totalPeriods }, (_, i) => i + 1);

  const cellStyle = (bg: string): React.CSSProperties => ({
    backgroundColor: bg === "transparent" ? undefined : bg,
    width: cellW,
    minWidth: cellW,
    maxWidth: cellW,
    height: 18,
    borderRight: "1px solid #e5e7eb",
    boxSizing: "border-box" as const,
  });

  const hdrCellStyle: React.CSSProperties = {
    ...cellStyle("#f9fafb"),
    height: 22,
    fontSize: 7,
    color: MUTED,
    textAlign: "center",
    verticalAlign: "middle",
    overflow: "hidden",
    whiteSpace: "nowrap",
  };

  const numHdrStyle: React.CSSProperties = {
    ...cellStyle(data.highlightedPeriod ? HIGHLIGHT_COL : "#f9fafb"),
    height: 16,
    fontSize: 7,
    color: TEXT,
    fontWeight: 600,
    textAlign: "center",
    verticalAlign: "middle",
  };

  return (
    <div style={{ width: docWidth, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif", padding: "24px 20px 20px" }}>

      {/* ── Title ── */}
      <h1 style={{ fontSize: 16, fontWeight: 700, color: PURPLE, margin: "0 0 6px" }}>
        {data.courseName || "Cronograma de actividades"}
      </h1>
      <p style={{ fontSize: 10, color: MUTED, margin: "0 0 6px" }}>
        Fecha de Elaboración: <strong style={{ color: TEXT }}>{formatDateES(data.creationDate)}</strong>
      </p>
      {data.objective && (
        <p style={{ fontSize: 9, color: TEXT, margin: "0 0 10px", maxWidth: 700, lineHeight: 1.4 }}>
          {data.objective}
        </p>
      )}

      {/* ── Legend + highlighted period ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 8, color: MUTED }}>
          <LegendItem color={PLAN_COLOR} label="Duración del plan" />
          <LegendItem color={DONE_COLOR} label="% Completado" />
          <LegendItem color={REAL_OVER_COLOR} label="Real (fuera del plan)" />
          <LegendItem color={HIGHLIGHT_COL} border label="Período resaltado" />
        </div>
        <div style={{ fontSize: 9, color: TEXT, marginLeft: "auto" }}>
          <strong>Período resaltado:</strong>{" "}
          <span style={{ background: HIGHLIGHT_COL, padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>
            {data.highlightedPeriod}
          </span>
        </div>
      </div>

      {/* ── Gantt table ── */}
      <div style={{ overflowX: "visible" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            {/* Activity name col */}
            <col style={{ width: 180 }} />
            {/* Number cols */}
            <col style={{ width: 40 }} />
            <col style={{ width: 55 }} />
            <col style={{ width: 40 }} />
            <col style={{ width: 55 }} />
            {/* Period cols */}
            {periods.map((p) => (
              <col key={p} style={{ width: cellW }} />
            ))}
          </colgroup>

          {/* Row 1: Week group headers */}
          <thead>
            <tr>
              <th colSpan={5} style={{ background: "#f3f4f6", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }} />
              {weekGroups.map((wg) => (
                <th
                  key={wg.label}
                  colSpan={wg.indices.length}
                  style={{
                    background: PURPLE,
                    color: "#ffffff",
                    fontSize: 8,
                    fontWeight: 700,
                    textAlign: "center",
                    borderRight: "1px solid #a78bfa",
                    borderBottom: "1px solid #a78bfa",
                    padding: "3px 0",
                    letterSpacing: "0.05em",
                  }}
                >
                  {wg.label}
                </th>
              ))}
            </tr>

            {/* Row 2: Period dates */}
            <tr>
              <th colSpan={5} style={{ background: "#f3f4f6", borderBottom: "1px solid #d1d5db", borderRight: "1px solid #d1d5db" }} />
              {periods.map((p, i) => (
                <th
                  key={p}
                  style={{
                    ...hdrCellStyle,
                    backgroundColor: p === data.highlightedPeriod ? "#fef3c7" : "#f9fafb",
                    borderBottom: "1px solid #d1d5db",
                    padding: "1px 0",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {dates[i] ? formatPeriodDate(dates[i]) : ""}
                </th>
              ))}
            </tr>

            {/* Row 3: Column labels + period numbers */}
            <tr style={{ background: "#f3f4f6", borderBottom: "2px solid #d1d5db" }}>
              {(["ACTIVIDAD", "INICIO\nDEL PLAN", "DURACIÓN\nDEL PLAN", "INICIO\nREAL", "DURACIÓN\nREAL"] as const).map((lbl, i) => (
                <th
                  key={i}
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    color: TEXT,
                    textAlign: "center",
                    padding: "4px 2px",
                    borderRight: "1px solid #d1d5db",
                    whiteSpace: "pre-line",
                    letterSpacing: "0.03em",
                    ...(i === 0 ? { textAlign: "left" as const, paddingLeft: 6 } : {}),
                  }}
                >
                  {lbl}
                </th>
              ))}
              {periods.map((p) => (
                <th
                  key={p}
                  style={{
                    ...numHdrStyle,
                    backgroundColor: p === data.highlightedPeriod ? "#fde68a" : "#f3f4f6",
                  }}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {data.activities.map((a, rowIdx) => (
              <tr
                key={a.id}
                style={{ background: rowIdx % 2 === 0 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}
              >
                {/* Activity name */}
                <td style={{ fontSize: 8, color: TEXT, padding: "2px 4px 2px 6px", borderRight: "1px solid #e5e7eb", lineHeight: 1.3 }}>
                  {a.name}
                </td>
                {/* Numbers */}
                {[a.planStart, a.planDuration, a.realStart, a.realDuration].map((n, ni) => (
                  <td
                    key={ni}
                    style={{
                      fontSize: 8,
                      color: TEXT,
                      textAlign: "center",
                      padding: "2px",
                      borderRight: "1px solid #e5e7eb",
                      fontWeight: 500,
                    }}
                  >
                    {n}
                  </td>
                ))}
                {/* Gantt cells */}
                {periods.map((p) => {
                  const { bg } = cellBg(p, a.planStart, a.planDuration, a.realStart, a.realDuration, data.highlightedPeriod);
                  return (
                    <td
                      key={p}
                      style={{
                        ...cellStyle(bg),
                        backgroundColor: bg === "transparent"
                          ? p === data.highlightedPeriod ? HIGHLIGHT_COL : undefined
                          : bg,
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Signatures ── */}
      <div style={{ display: "flex", gap: 80, marginTop: 28 }}>
        {[{ label: "Elaborado por", name: data.elaboratedBy }, { label: "Aprobado por", name: data.approvedBy }].map(({ label, name }) => (
          <div key={label} style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ borderTop: `1px solid ${TEXT}`, paddingTop: 4, marginTop: 24 }}>
              <div style={{ fontSize: 9, color: MUTED }}>{label}</div>
              <div style={{ fontSize: 9, color: TEXT, fontWeight: 600, marginTop: 2 }}>{name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 10,
          backgroundColor: color,
          border: border ? "1px solid #d1d5db" : "none",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
