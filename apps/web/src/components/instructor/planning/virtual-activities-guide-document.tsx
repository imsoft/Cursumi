import { type VirtualActivitiesGuideData, type VirtualLearningUnit } from "@/lib/planning/virtual-activities-guide";

const PURPLE = "#6d28d9";
const LIGHT_PURPLE = "#7c3aed";
const WHITE = "#ffffff";
const BORDER = "#000000";
const W = 794;

const colWidths = {
  title: 120,
  instructions: 180,
  materials: 120,
  participation: 90,
  delivery: 140,
  weight: 70,
};

const totalTableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);

const cell = (w: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: w,
  minWidth: w,
  maxWidth: w,
  padding: "6px 8px",
  borderRight: `1px solid ${BORDER}`,
  borderBottom: `1px solid ${BORDER}`,
  verticalAlign: "top",
  boxSizing: "border-box" as const,
  ...extra,
});

const headerCell = (w: number): React.CSSProperties => ({
  ...cell(w),
  backgroundColor: PURPLE,
  color: WHITE,
  fontSize: 9,
  fontWeight: 700,
  textAlign: "center",
  verticalAlign: "middle",
  lineHeight: 1.3,
});

const dataCell = (w: number): React.CSSProperties => ({
  ...cell(w),
  color: LIGHT_PURPLE,
  fontSize: 10,
  lineHeight: 1.4,
  whiteSpace: "pre-wrap" as const,
});

function DocHeader({ courseName }: { courseName: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: PURPLE, textAlign: "center", margin: "0 0 6px", letterSpacing: "0.04em" }}>
          GUÍA DE ACTIVIDADES DE APRENDIZAJE DE CADA UNIDAD DEL CURSO
        </p>
        {courseName && (
          <p style={{ fontSize: 10, color: PURPLE, textAlign: "center", margin: 0 }}>
            {courseName}
          </p>
        )}
      </div>
      {/* Cursumi logo placeholder — hexagon */}
      <div style={{
        width: 48, height: 48, flexShrink: 0,
        background: `linear-gradient(135deg, #4300d0, #6d28d9, #a400e3)`,
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: WHITE, fontWeight: 700, fontSize: 20, letterSpacing: "-1px" }}>C</span>
      </div>
    </div>
  );
}

function UnitBlock({ unit }: { unit: VirtualLearningUnit }) {
  const criteriaLabel = (checked: boolean, label: string) =>
    `${label}: ${checked ? "X" : ""}`;

  return (
    <div style={{ border: `1px solid ${BORDER}`, marginBottom: 32 }}>
      {/* Unit info rows */}
      {[
        { label: "NOMBRE DE LA UNIDAD DE APRENDIZAJE:", value: unit.name },
        { label: "OBJETIVO ESPECÍFICO DE LA UNIDAD:", value: unit.specificObjective },
        { label: "PERIODO DE REALIZACIÓN DE ACTIVIDADES:", value: unit.activityPeriod },
        { label: "PONDERACIÓN GENERAL DE ACTIVIDADES:", value: unit.generalWeight },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, padding: "5px 10px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: PURPLE, whiteSpace: "nowrap", marginRight: 6 }}>
            {label}
          </span>
          <span style={{ fontSize: 10, color: PURPLE, flex: 1 }}>{value}</span>
        </div>
      ))}

      {/* Criteria row */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 180, padding: "5px 10px", borderRight: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: PURPLE }}>CRITERIOS DE EVALUACIÓN DE ACTIVIDADES:</span>
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          {[
            { checked: unit.criteria.knowledge, label: "CONOCIMIENTOS" },
            { checked: unit.criteria.skills, label: "HABILIDADES" },
            { checked: unit.criteria.attitudes, label: "ACTITUDES" },
          ].map(({ checked, label }, i) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "5px 10px",
                borderRight: i < 2 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: PURPLE }}>
                {criteriaLabel(checked, label)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Activities section header */}
      <div style={{ backgroundColor: PURPLE, padding: "7px 10px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: WHITE, letterSpacing: "0.04em" }}>
          DESCRIPCIÓN DE ACTIVIDADES DE LA UNIDAD DE APRENDIZAJE
        </span>
      </div>

      {/* Activities table */}
      <table style={{ borderCollapse: "collapse", width: totalTableWidth, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: colWidths.title }} />
          <col style={{ width: colWidths.instructions }} />
          <col style={{ width: colWidths.materials }} />
          <col style={{ width: colWidths.participation }} />
          <col style={{ width: colWidths.delivery }} />
          <col style={{ width: colWidths.weight }} />
        </colgroup>
        <thead>
          <tr>
            <th style={headerCell(colWidths.title)}>TITULO DE LA ACTIVIDAD</th>
            <th style={headerCell(colWidths.instructions)}>INSTRUCCIONES</th>
            <th style={headerCell(colWidths.materials)}>MATERIALES O RECURSO</th>
            <th style={headerCell(colWidths.participation)}>FORMA DE PARTICIPACIÓN INDIVIDUAL O COLABORATIVA</th>
            <th style={headerCell(colWidths.delivery)}>MEDIO DE ENTREGA</th>
            <th style={{ ...headerCell(colWidths.weight), borderRight: "none" }}>PONDERACIÓN DE ACTIVIDAD</th>
          </tr>
        </thead>
        <tbody>
          {unit.activities.map((a, i) => (
            <tr key={a.id}>
              <td style={dataCell(colWidths.title)}>{a.title}</td>
              <td style={dataCell(colWidths.instructions)}>{a.instructions}</td>
              <td style={dataCell(colWidths.materials)}>{a.materials}</td>
              <td style={dataCell(colWidths.participation)}>{a.participation}</td>
              <td style={dataCell(colWidths.delivery)}>{a.deliveryMethod}</td>
              <td style={{ ...dataCell(colWidths.weight), borderRight: "none", textAlign: "center" as const }}>{a.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VirtualActivitiesGuideDocument({ data }: { data: VirtualActivitiesGuideData }) {
  return (
    <div style={{ width: W, background: WHITE, fontFamily: "Arial, Helvetica, sans-serif", padding: "32px 28px", boxSizing: "border-box" }}>
      {data.units.map((unit) => (
        <div key={unit.id}>
          <DocHeader courseName={data.courseName} />
          <UnitBlock unit={unit} />
        </div>
      ))}
    </div>
  );
}
