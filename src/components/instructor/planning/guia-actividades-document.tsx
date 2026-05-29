/**
 * Plantilla visual de la "Guía de actividades de aprendizaje de cada unidad
 * del curso": encabezado con el curso + una tabla por unidad de aprendizaje.
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import { type GuiaActividadesData, type UnidadAprendizaje } from "@/lib/planning/guia-actividades";

const PURPLE = "#6d28d9";
const PURPLE_BAND = "#7c3aed";
const PURPLE_SOFT = "#a78bfa";
const BORDER = "#333333";
const TEXT = "#1f1147";

const ACT_COLS = [
  { key: "titulo", label: "TÍTULO DE LA ACTIVIDAD", width: "16%" },
  { key: "instrucciones", label: "INSTRUCCIONES", width: "21%" },
  { key: "materiales", label: "MATERIALES O RECURSO", width: "17%" },
  { key: "participacion", label: "FORMA DE PARTICIPACIÓN INDIVIDUAL O COLABORATIVA", width: "15%" },
  { key: "medioTiempo", label: "MEDIO & TIEMPO DE ENTREGA", width: "15%" },
  { key: "ponderacion", label: "PONDERACIÓN DE ACTIVIDAD & CRITERIOS DE EVALUACIÓN", width: "16%" },
] as const;

const cellBase: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "6px 8px",
  fontSize: 10.5,
  lineHeight: 1.45,
  verticalAlign: "top",
  whiteSpace: "pre-line",
  color: PURPLE,
};

function metaRow(label: string, value: string) {
  return (
    <tr>
      <td style={{ ...cellBase, fontWeight: 700 }}>
        {label}: <span style={{ fontWeight: 400 }}>{value}</span>
      </td>
    </tr>
  );
}

function Unidad({ unidad }: { unidad: UnidadAprendizaje }) {
  const x = (v: boolean) => (v ? "X" : "");
  return (
    <div style={{ marginBottom: 28, breakInside: "avoid" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <tbody>
          {metaRow("NOMBRE DE LA UNIDAD DE APRENDIZAJE", unidad.nombre)}
          {metaRow("OBJETIVO ESPECÍFICO DE LA UNIDAD", unidad.objetivo)}
          {metaRow("PERIODO DE REALIZACIÓN DE ACTIVIDADES", unidad.periodo)}
          {metaRow("PONDERACIÓN GENERAL DE ACTIVIDADES", unidad.ponderacionGeneral)}
          <tr>
            <td style={{ ...cellBase, padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <tbody>
                  <tr>
                    <td style={{ ...cellBase, fontWeight: 700, width: "25%", border: "none", borderRight: `1px solid ${BORDER}` }}>
                      CRITERIOS DE EVALUACIÓN DE ACTIVIDADES:
                    </td>
                    <td style={{ ...cellBase, fontWeight: 700, width: "25%", border: "none", borderRight: `1px solid ${BORDER}` }}>
                      CONOCIMIENTOS: <span style={{ fontWeight: 400, color: TEXT }}>{x(unidad.criterios.conocimientos)}</span>
                    </td>
                    <td style={{ ...cellBase, fontWeight: 700, width: "25%", border: "none", borderRight: `1px solid ${BORDER}` }}>
                      HABILIDADES: <span style={{ fontWeight: 400, color: TEXT }}>{x(unidad.criterios.habilidades)}</span>
                    </td>
                    <td style={{ ...cellBase, fontWeight: 700, width: "25%", border: "none" }}>
                      ACTITUDES: <span style={{ fontWeight: 400, color: TEXT }}>{x(unidad.criterios.actitudes)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Banda + tabla de actividades */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: -1 }}>
        <thead>
          <tr>
            <th
              colSpan={ACT_COLS.length}
              style={{ border: `1px solid ${BORDER}`, background: PURPLE_BAND, color: "#ffffff", fontSize: 11, fontWeight: 800, padding: "6px 8px", textAlign: "center" }}
            >
              DESCRIPCIÓN DE ACTIVIDADES DE LA UNIDAD DE APRENDIZAJE
            </th>
          </tr>
          <tr>
            {ACT_COLS.map((c) => (
              <th
                key={c.key}
                style={{ border: `1px solid ${BORDER}`, background: PURPLE, color: "#ffffff", fontSize: 9.5, fontWeight: 700, padding: "6px 6px", textAlign: "center", width: c.width }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {unidad.actividades.length === 0 ? (
            <tr>
              <td colSpan={ACT_COLS.length} style={{ ...cellBase, textAlign: "center", color: PURPLE_SOFT }}>
                Sin actividades.
              </td>
            </tr>
          ) : (
            unidad.actividades.map((a) => (
              <tr key={a.id}>
                <td style={cellBase}>{a.titulo}</td>
                <td style={cellBase}>{a.instrucciones}</td>
                <td style={cellBase}>{a.materiales}</td>
                <td style={cellBase}>{a.participacion}</td>
                <td style={cellBase}>{a.medioTiempo}</td>
                <td style={cellBase}>{a.ponderacion}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function GuiaActividadesDocument({ data }: { data: GuiaActividadesData }) {
  return (
    <div style={{ width: 794, background: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif", padding: 40, boxSizing: "border-box" }}>
      {/* Encabezado */}
      <div style={{ position: "relative", marginBottom: 20, minHeight: 56 }}>
        <img
          src="/icons/icon-512.png"
          alt="Cursumi"
          width={56}
          height={56}
          loading="eager"
          style={{ position: "absolute", top: 0, right: 0, width: 56, height: 56, objectFit: "contain" }}
        />
        <div style={{ textAlign: "center", padding: "0 64px" }}>
          <h1 style={{ fontSize: 13, fontWeight: 800, color: PURPLE, margin: 0, letterSpacing: 0.3 }}>
            GUÍA DE ACTIVIDADES DE APRENDIZAJE DE CADA UNIDAD DEL CURSO
          </h1>
          {data.nombreCurso.trim() ? (
            <p style={{ fontSize: 12, fontWeight: 700, color: PURPLE_SOFT, margin: "8px 0 0" }}>{data.nombreCurso}</p>
          ) : null}
        </div>
      </div>

      {data.unidades.map((u) => (
        <Unidad key={u.id} unidad={u} />
      ))}
    </div>
  );
}
