/**
 * Plantilla visual (membrete Cursumi) de la Carta Descriptiva.
 * Se usa tanto para previsualizar como para exportar a PDF con html2canvas.
 *
 * IMPORTANTE: usa solo colores fijos (hex), NO tokens del tema (oklch),
 * porque html2canvas no soporta oklch y rompería la captura.
 */

import type { CartaDescriptivaData, ActividadFila } from "@/lib/planning/carta-descriptiva";
import { sumDuracion, sumDuracionTotal, formatMinutos } from "@/lib/planning/carta-descriptiva";

const PURPLE = "#6d28d9";
const PURPLE_SOFT = "#f5f3ff";
const BORDER = "#c4b5fd";
const TEXT = "#1f1147";
const MUTED = "#6b7280";

const sectionHeaderStyle: React.CSSProperties = {
  background: PURPLE,
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 12,
  padding: "6px 10px",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const cellStyle: React.CSSProperties = {
  border: `1px solid ${BORDER}`,
  padding: "6px 8px",
  fontSize: 11,
  verticalAlign: "top",
  color: TEXT,
  lineHeight: 1.4,
};

const thStyle: React.CSSProperties = {
  ...cellStyle,
  background: PURPLE_SOFT,
  fontWeight: 700,
  fontStyle: "italic",
};

function MultiLine({ value }: { value: string }) {
  if (!value?.trim()) return <span style={{ color: MUTED }}>—</span>;
  return (
    <>
      {value.split("\n").map((line, i) => (
        <div key={i}>{line || "\u00A0"}</div>
      ))}
    </>
  );
}

function ActivityTable({
  rows,
  firstColLabel,
  totalLabel,
}: {
  rows: ActividadFila[];
  firstColLabel: string;
  totalLabel: string;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: "20%" }}>{firstColLabel}</th>
          <th style={{ ...thStyle, width: "44%" }}>Actividades</th>
          <th style={{ ...thStyle, width: "10%" }}>Duración</th>
          <th style={{ ...thStyle, width: "13%" }}>Técnicas grupales / instruccionales</th>
          <th style={{ ...thStyle, width: "13%" }}>Material y equipo de apoyo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={cellStyle}><MultiLine value={row.temaEtapa} /></td>
            <td style={cellStyle}><MultiLine value={row.actividades} /></td>
            <td style={{ ...cellStyle, fontStyle: "italic" }}>
              {row.duracionMin != null ? formatMinutos(row.duracionMin) : "—"}
            </td>
            <td style={{ ...cellStyle, fontStyle: "italic" }}><MultiLine value={row.tecnicas} /></td>
            <td style={{ ...cellStyle, fontStyle: "italic" }}><MultiLine value={row.material} /></td>
          </tr>
        ))}
        <tr>
          <td style={{ ...cellStyle, fontWeight: 700, fontStyle: "italic" }} colSpan={2}>
            {totalLabel}
          </td>
          <td style={{ ...cellStyle, fontWeight: 700, fontStyle: "italic" }}>
            {formatMinutos(sumDuracion(rows))}
          </td>
          <td style={cellStyle} colSpan={2} />
        </tr>
      </tbody>
    </table>
  );
}

export function CartaDescriptivaDocument({ data }: { data: CartaDescriptivaData }) {
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
      {/* Encabezado / membrete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ color: PURPLE, fontWeight: 700, fontStyle: "italic", fontSize: 13 }}>
          DOCUMENTO DE PLANEACIÓN DEL CURSO / CARTA DESCRIPTIVA
        </div>
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

      {/* 1. Información general */}
      <div style={sectionHeaderStyle}>Información general</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, fontStyle: "italic", fontWeight: 700 }} colSpan={4}>
              Nombre del curso-taller: <span style={{ fontWeight: 400 }}>{data.nombreCurso || "—"}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, fontStyle: "italic", fontWeight: 700 }} colSpan={4}>
              Nombre del facilitador / instructor: <span style={{ fontWeight: 400 }}>{data.nombreInstructor || "—"}</span>
            </td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, width: "25%" }}>
              <strong style={{ fontStyle: "italic" }}>Lugar de instrucción:</strong>
              <div><MultiLine value={data.lugar} /></div>
            </td>
            <td style={{ ...cellStyle, width: "25%" }}>
              <strong style={{ fontStyle: "italic" }}>Duración:</strong> {data.duracion || "—"}
              <div style={{ marginTop: 8 }}>
                <strong style={{ fontStyle: "italic" }}>Fecha(s):</strong> {data.fechas || "—"}
              </div>
            </td>
            <td style={{ ...cellStyle, width: "33%" }}>
              <strong style={{ fontStyle: "italic" }}>Perfil del participante:</strong>
              <div><strong>Psicográficas:</strong> <MultiLine value={data.perfilPsicograficas} /></div>
              <div><strong>Conocimientos:</strong> <MultiLine value={data.perfilConocimientos} /></div>
              <div><strong>Habilidades:</strong> <MultiLine value={data.perfilHabilidades} /></div>
            </td>
            <td style={{ ...cellStyle, width: "17%" }}>
              <strong style={{ fontStyle: "italic" }}>Número de participantes:</strong> {data.numParticipantes || "—"}
            </td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, background: PURPLE_SOFT, fontStyle: "italic" }} colSpan={4}>
              <strong>Propósito / beneficio del curso:</strong> <MultiLine value={data.proposito} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Objetivo general */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Objetivo general</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "20%" }}>Sujeto</th>
            <th style={{ ...thStyle, width: "40%" }}>Acción o comportamiento</th>
            <th style={{ ...thStyle, width: "40%" }}>Condición de operación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>{data.objetivoGeneral.sujeto || "—"}</td>
            <td style={cellStyle}><MultiLine value={data.objetivoGeneral.accion} /></td>
            <td style={cellStyle}><MultiLine value={data.objetivoGeneral.condicion} /></td>
          </tr>
        </tbody>
      </table>

      {/* 2. Objetivos particulares */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Objetivos particulares</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "16%" }}>Sujeto</th>
            <th style={{ ...thStyle, width: "28%" }}>Acción o comportamiento</th>
            <th style={{ ...thStyle, width: "28%" }}>Condición de operación</th>
            <th style={{ ...thStyle, width: "28%" }}>Temas</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: "Cognitivo", obj: data.objCognitivo },
            { label: "Psicomotor", obj: data.objPsicomotor },
            { label: "Afectivo", obj: data.objAfectivo },
          ].map(({ label, obj }) => (
            <tr key={label}>
              <td style={cellStyle}>
                <strong>{label}</strong>
                <div>{obj.sujeto || "—"}</div>
              </td>
              <td style={cellStyle}><MultiLine value={obj.accion} /></td>
              <td style={cellStyle}><MultiLine value={obj.condicion} /></td>
              <td style={cellStyle}><MultiLine value={obj.temas} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 3. Requerimientos */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Requerimientos</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "22%" }}>Instalaciones y mobiliario</th>
            <th style={{ ...thStyle, width: "20%" }}>Equipo de apoyo</th>
            <th style={{ ...thStyle, width: "22%" }}>Materiales de apoyo</th>
            <th style={{ ...thStyle, width: "16%" }}>Humanos</th>
            <th style={{ ...thStyle, width: "20%" }}>Salud / seguridad / protección civil</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}><MultiLine value={data.reqInstalaciones} /></td>
            <td style={cellStyle}><MultiLine value={data.reqEquipo} /></td>
            <td style={cellStyle}><MultiLine value={data.reqMateriales} /></td>
            <td style={cellStyle}><MultiLine value={data.reqHumanos} /></td>
            <td style={cellStyle}><MultiLine value={data.reqSeguridad} /></td>
          </tr>
        </tbody>
      </table>

      {/* 4. Evaluación */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Formas, momentos y criterios de la evaluación</div>
      {data.evaluacionDescripcion?.trim() && (
        <div style={{ ...cellStyle, border: `1px solid ${BORDER}`, background: PURPLE_SOFT, fontStyle: "italic" }}>
          <MultiLine value={data.evaluacionDescripcion} />
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
        <thead>
          <tr>
            <th style={thStyle}>Aspecto a evaluar</th>
            <th style={thStyle}>Porcentaje</th>
            <th style={thStyle}>Instrumento</th>
            <th style={thStyle}>Momento</th>
            <th style={thStyle}>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {data.evaluacionCriterios.map((c) => (
            <tr key={c.id}>
              <td style={cellStyle}>{c.aspecto || "—"}</td>
              <td style={cellStyle}>{c.porcentaje || "—"}</td>
              <td style={cellStyle}>{c.instrumento || "—"}</td>
              <td style={cellStyle}>{c.momento || "—"}</td>
              <td style={cellStyle}>{c.tipo || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. Apertura */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Apertura o encuadre</div>
      <ActivityTable rows={data.apertura} firstColLabel="Etapa del encuadre" totalLabel="Sumatoria de tiempo de la apertura" />

      {/* 6. Desarrollo */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Desarrollo</div>
      <ActivityTable rows={data.desarrollo} firstColLabel="Temas / subtemas" totalLabel="Sumatoria de tiempo del desarrollo" />

      {/* 7. Cierre */}
      <div style={{ ...sectionHeaderStyle, marginTop: 12 }}>Cierre</div>
      <ActivityTable rows={data.cierre} firstColLabel="Temas / subtemas" totalLabel="Sumatoria de tiempo del cierre" />

      {/* Total */}
      <div
        style={{
          marginTop: 12,
          padding: "8px 10px",
          border: `2px solid ${PURPLE}`,
          borderRadius: 6,
          fontWeight: 700,
          fontStyle: "italic",
          textAlign: "center",
          color: PURPLE,
        }}
      >
        Sumatoria de tiempo total: {formatMinutos(sumDuracionTotal(data))}
      </div>
    </div>
  );
}
