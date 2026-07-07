/**
 * Constancia del estudiante — documento A4 horizontal de tamaño FIJO (1123×794 px).
 * Mismo lenguaje visual que la constancia de planeación didáctica (marco morado,
 * barras degradadas, logo). Solo colores fijos (hex) para no romper html2canvas;
 * NUNCA hereda el tema oscuro ni cambia con el viewport.
 */

import type { Certificate } from "@/components/student/types";

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#1f1147";
const MUTED = "#6b7280";

export const CERT_DOC_WIDTH = 1123; // A4 horizontal @ 96dpi
export const CERT_DOC_HEIGHT = 794;

const MODALITY_LABEL: Record<Certificate["modality"], string> = {
  virtual: "Curso en video",
  evento: "Curso por evento",
};

export function CertificateDocument({ certificate }: { certificate: Certificate }) {
  const isAccreditation = certificate.type === "accreditation";
  const sigH = Math.min(certificate.signatureHeight ?? 120, 160);

  const meta = [
    certificate.category,
    MODALITY_LABEL[certificate.modality] ?? certificate.modality,
    certificate.hours ? `${certificate.hours} horas` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div
      style={{
        width: CERT_DOC_WIDTH,
        height: CERT_DOC_HEIGHT,
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
          padding: "44px 88px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-512.png" alt="Cursumi" width={60} height={60} style={{ display: "block", marginBottom: 14 }} />

        <h1
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: PURPLE,
            margin: 0,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {isAccreditation ? "Constancia de acreditación" : "Constancia de participación"}
        </h1>
        <div style={{ height: 4, width: 90, background: GRADIENT, borderRadius: 3, margin: "12px 0 22px" }} />

        {/* Bloque central con margen auto arriba: reparte el espacio sobrante
            a partes iguales entre este bloque y el de la firma */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 10px" }}>
          {isAccreditation ? "Esta constancia acredita que" : "Esta constancia certifica que"}
        </p>

        <p
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: TEXT,
            margin: "0 0 10px",
            lineHeight: 1.15,
            maxWidth: 860,
          }}
        >
          {certificate.studentName}
        </p>

        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px" }}>
          {isAccreditation
            ? "ha acreditado satisfactoriamente el taller"
            : "ha participado en el taller"}
          {isAccreditation && certificate.score != null && (
            <> con una calificación de <strong style={{ color: TEXT }}>{certificate.score}</strong></>
          )}
        </p>

        <p
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: PURPLE_DARK,
            margin: "0 0 8px",
            lineHeight: 1.25,
            maxWidth: 880,
          }}
        >
          {certificate.courseTitle}
        </p>

        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{meta}</p>
        </div>

        {/* Firma — empujada hacia el fondo */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {certificate.instructorSignatureUrl ? (
            <div style={{ height: sigH, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certificate.instructorSignatureUrl}
                alt={`Firma de ${certificate.instructorName}`}
                data-signature
                crossOrigin="anonymous"
                style={{ maxHeight: sigH, maxWidth: 320, width: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
          ) : (
            <div style={{ height: sigH, marginBottom: 6 }} />
          )}
          <div style={{ borderTop: `1px solid ${TEXT}4D`, paddingTop: 8, minWidth: 280 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: 0 }}>{certificate.instructorName}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>Instructor</p>
          </div>
        </div>

        {/* Pie: fecha + folio + marca */}
        <div
          style={{
            marginTop: 18,
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Fecha de emisión</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: "2px 0 0" }}>{certificate.issueDate}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, color: PURPLE, margin: 0 }}>CURSUMI</p>
            <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>Plataforma educativa</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Número de constancia</p>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: "ui-monospace, 'Courier New', monospace", color: TEXT, margin: "2px 0 0" }}>
              {certificate.certificateNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
