/**
 * Plantilla visual de la Constancia / reconocimiento (A4 vertical).
 * Solo colores fijos (hex) para no romper html2canvas.
 */

import type { ConstanciaData } from "@/lib/planning/constancia";

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#1f1147";
const MUTED = "#6b7280";

const A4_W = 794;
const A4_H = 1123;

export function ConstanciaDocument({ data }: { data: ConstanciaData }) {
  return (
    <div
      style={{
        width: A4_W,
        height: A4_H,
        background: "#ffffff",
        color: TEXT,
        fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        padding: 28,
      }}
    >
      {/* Marco decorativo */}
      <div
        style={{
          position: "absolute",
          inset: 20,
          border: `2px solid ${PURPLE}`,
          borderRadius: 12,
        }}
      />
      <div style={{ position: "absolute", left: 20, right: 20, top: 20, height: 8, background: GRADIENT, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, height: 8, background: GRADIENT, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }} />

      <div
        style={{
          position: "relative",
          height: "100%",
          boxSizing: "border-box",
          padding: "72px 72px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-512.png" alt="Cursumi" width={72} height={72} style={{ display: "block", marginBottom: 28 }} />

        <h1
          style={{
            fontSize: 46,
            fontWeight: 900,
            color: PURPLE,
            margin: "0 0 4px",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Constancia
        </h1>
        <div style={{ height: 4, width: 90, background: GRADIENT, borderRadius: 3, margin: "10px 0 40px" }} />

        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 14px" }}>Se otorga la presente constancia a</p>

        <p
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: TEXT,
            margin: "0 0 8px",
            minHeight: 40,
            borderBottom: data.recipientName ? "none" : `1px solid ${PURPLE}55`,
            minWidth: 420,
            paddingBottom: 6,
          }}
        >
          {data.recipientName || " "}
        </p>

        <p style={{ fontSize: 15, color: MUTED, margin: "26px 0 8px" }}>por su participación en el curso</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: PURPLE, margin: "0 0 18px", maxWidth: 560, lineHeight: 1.3 }}>
          {data.courseName || "—"}
        </p>

        <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.8, maxWidth: 540 }}>
          {[
            data.durationLabel && `con una duración de ${data.durationLabel}`,
            data.location && `impartido en ${data.location}`,
            data.date && `el ${data.date}`,
          ]
            .filter(Boolean)
            .join(", ") || " "}
        </p>

        <div style={{ flex: 1 }} />

        {/* Firma */}
        <div style={{ width: 300, marginBottom: 8 }}>
          <div style={{ borderTop: `1.5px solid ${TEXT}`, marginBottom: 8 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{data.issuerName || "—"}</p>
          <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>{data.issuerRole || " "}</p>
        </div>

        {/* Folio / estándar */}
        <div style={{ marginTop: 14, fontSize: 10, color: MUTED, lineHeight: 1.5 }}>
          {data.folio ? <div>Folio: {data.folio}</div> : null}
          {data.standard ? <div>{data.standard}</div> : null}
          <div style={{ marginTop: 4, fontWeight: 700, color: PURPLE }}>
            cursumi.com<span style={{ margin: "0 6px", color: MUTED }}>·</span>@cursumi
          </div>
        </div>
      </div>
    </div>
  );
}
