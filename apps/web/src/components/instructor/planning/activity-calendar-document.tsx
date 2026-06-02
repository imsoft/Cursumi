import { type ActivityCalendarData, formatCalendarDate } from "@/lib/planning/activity-calendar";

const PURPLE = "#6d28d9";
const LIGHT_PURPLE = "#7c3aed";
const WHITE = "#ffffff";
const BORDER = "#1f2937";
const W = 794;

// Column widths
const COL = { unit: 170, date: 110, activity: 220, weight: 90, duration: 120 };
const TABLE_W = COL.unit + COL.date + COL.activity + COL.weight + COL.duration;

const thStyle = (w: number): React.CSSProperties => ({
  width: w,
  backgroundColor: PURPLE,
  color: WHITE,
  fontSize: 9,
  fontWeight: 700,
  textAlign: "center",
  verticalAlign: "middle",
  padding: "6px 6px",
  border: `1px solid ${BORDER}`,
  lineHeight: 1.3,
  boxSizing: "border-box" as const,
});

const tdStyle = (w: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: w,
  color: LIGHT_PURPLE,
  fontSize: 10,
  padding: "7px 8px",
  border: `1px solid ${BORDER}`,
  verticalAlign: "top",
  lineHeight: 1.4,
  boxSizing: "border-box" as const,
  ...extra,
});

export function ActivityCalendarDocument({ data }: { data: ActivityCalendarData }) {
  // Build flat rows for the table with rowspan info
  type Row = {
    unitName?: string;
    unitRowspan?: number;
    date?: string;
    dateRowspan?: number;
    activityIndex: number;
    activityName: string;
    weight: string;
    duration: string;
  };

  const rows: Row[] = [];
  for (const unit of data.units) {
    const count = unit.activities.length;
    unit.activities.forEach((a, ai) => {
      rows.push({
        unitName: ai === 0 ? unit.name : undefined,
        unitRowspan: ai === 0 ? count : undefined,
        date: ai === 0 ? formatCalendarDate(unit.scheduledDate) : undefined,
        dateRowspan: ai === 0 ? count : undefined,
        activityIndex: ai + 1,
        activityName: a.name,
        weight: a.weight,
        duration: a.duration,
      });
    });
  }

  return (
    <div style={{ width: W, background: WHITE, fontFamily: "Arial, Helvetica, sans-serif", padding: "32px 28px", boxSizing: "border-box" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textAlign: "center", margin: 0, letterSpacing: "0.03em" }}>
            CALENDARIO GENERAL DE ACTIVIDADES ESTABLECIDO
          </p>
        </div>
        {/* Logo */}
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
      <table style={{ borderCollapse: "collapse", width: TABLE_W, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: COL.unit }} />
          <col style={{ width: COL.date }} />
          <col style={{ width: COL.activity }} />
          <col style={{ width: COL.weight }} />
          <col style={{ width: COL.duration }} />
        </colgroup>

        {/* Course info rows */}
        <tbody>
          <tr>
            <td
              colSpan={5}
              style={{ ...tdStyle(TABLE_W), padding: "6px 10px" }}
            >
              <span style={{ fontWeight: 700 }}>NOMBRE DEL CURSO:&nbsp;</span>
              {data.courseName}
            </td>
          </tr>
          <tr>
            <td
              colSpan={5}
              style={{ ...tdStyle(TABLE_W), padding: "6px 10px" }}
            >
              <span style={{ fontWeight: 700 }}>PONDERACIÓN GENERAL DE ACTIVIDADES:&nbsp;</span>
              {data.generalWeight}
            </td>
          </tr>

          {/* Column headers */}
          <tr>
            <th style={thStyle(COL.unit)}>NOMBRE DE LA UNIDAD</th>
            <th style={thStyle(COL.date)}>FECHA PROGRAMADA PARA LA UNIDAD</th>
            <th style={thStyle(COL.activity)}>ACTIVIDADES</th>
            <th style={thStyle(COL.weight)}>PONDERACIÓN DE ACTIVIDAD</th>
            <th style={thStyle(COL.duration)}>PERIODO DE REALIZACIÓN DE LA ACTIVIDAD</th>
          </tr>

          {/* Data rows */}
          {rows.map((row, i) => (
            <tr key={i}>
              {row.unitName !== undefined && (
                <td
                  rowSpan={row.unitRowspan}
                  style={{ ...tdStyle(COL.unit), fontWeight: 600 }}
                >
                  {row.unitName}
                </td>
              )}
              {row.date !== undefined && (
                <td
                  rowSpan={row.dateRowspan}
                  style={{ ...tdStyle(COL.date), textAlign: "center" as const }}
                >
                  {row.date}
                </td>
              )}
              <td style={tdStyle(COL.activity)}>
                {row.activityIndex}.&nbsp;&nbsp;{row.activityName}
              </td>
              <td style={{ ...tdStyle(COL.weight), textAlign: "center" as const }}>
                {row.weight}
              </td>
              <td style={{ ...tdStyle(COL.duration), textAlign: "center" as const }}>
                {row.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
