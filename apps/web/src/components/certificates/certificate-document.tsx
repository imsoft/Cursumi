/**
 * Constancia del estudiante — documento A4 horizontal de tamaño FIJO (1123×794 px).
 * Fondo con bloques diagonales (marca de agua tenue + franja inferior) y doble
 * firma (instructor + dirección de la plataforma). Solo colores fijos (hex)
 * para no romper html2canvas; NUNCA hereda el tema oscuro ni cambia con el viewport.
 */

import type { Certificate } from "@/components/student/types";

const PURPLE = "#6d28d9";
const PURPLE_DARK = "#4300d0";
const PURPLE_LIGHT = "#a400e3";
const GRADIENT = `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_LIGHT} 100%)`;
const TEXT = "#1f1147";
const MUTED = "#6b7280";
const WASH = "#f1ecfc"; // lavanda muy claro para el triángulo superior

export const CERT_DOC_WIDTH = 1123; // A4 horizontal @ 96dpi
export const CERT_DOC_HEIGHT = 794;

const MODALITY_LABEL: Record<Certificate["modality"], string> = {
  virtual: "Curso en video",
  evento: "Curso por evento",
};

/** Una firma con nombre y rol debajo, usada tanto para instructor como para dirección. */
function SignatureBlock({
  name,
  role,
  signatureUrl,
  height,
}: {
  name: string;
  role: string;
  signatureUrl?: string | null;
  height: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 240 }}>
      {signatureUrl ? (
        <div style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureUrl}
            alt={`Firma de ${name}`}
            data-signature
            crossOrigin="anonymous"
            style={{ maxHeight: height, maxWidth: 220, width: "auto", objectFit: "contain", display: "block" }}
          />
        </div>
      ) : (
        <div style={{ height, marginBottom: 6 }} />
      )}
      <div style={{ borderTop: `1px solid ${TEXT}4D`, paddingTop: 8, width: "100%", textAlign: "center" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: 0 }}>{name}</p>
        <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>{role}</p>
      </div>
    </div>
  );
}

export function CertificateDocument({ certificate }: { certificate: Certificate }) {
  const isAccreditation = certificate.type === "accreditation";
  const sigH = Math.min(certificate.signatureHeight ?? 100, 130);
  const hasAdminSignature = !!certificate.adminSignatureUrl;

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
      }}
    >
      {/* ── Fondo decorativo: bloques diagonales ── */}
      {/* Triángulo esquina superior izquierda: base morada + relleno lavanda
          ligeramente más chico encima → deja un borde diagonal morado fino.
          Usamos DOS rellenos sólidos con clip-path (nada de box-shadow inset:
          html2canvas no lo soporta igual que un navegador y lo pinta sólido). */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 524,
          height: 504,
          background: PURPLE_LIGHT,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 516,
          height: 496,
          background: WASH,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      {/* Franja diagonal inferior con degradado de marca — puramente decorativa,
          el contenido nunca la invade (ver padding-bottom más abajo) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          background: GRADIENT,
          clipPath: "polygon(0 55%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* ── Contenido ── */}
      <div
        style={{
          position: "relative",
          height: "100%",
          boxSizing: "border-box",
          padding: "50px 90px 92px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-512.png" alt="Cursumi" width={56} height={56} style={{ display: "block", marginBottom: 12 }} />

        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: PURPLE,
            margin: 0,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {isAccreditation ? "Constancia de acreditación" : "Constancia de participación"}
        </h1>
        <div style={{ height: 4, width: 90, background: GRADIENT, borderRadius: 3, margin: "12px 0 20px" }} />

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

        {/* Firmas — empujadas hacia el fondo; una o dos columnas según haya dirección */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: hasAdminSignature ? 72 : 0,
          }}
        >
          <SignatureBlock
            name={certificate.instructorName}
            role="Instructor"
            signatureUrl={certificate.instructorSignatureUrl}
            height={sigH}
          />
          {hasAdminSignature && (
            <SignatureBlock
              name={certificate.adminName ?? "Cursumi"}
              role="Dirección de Cursumi"
              signatureUrl={certificate.adminSignatureUrl}
              height={sigH}
            />
          )}
        </div>

        {/* Pie: fecha + marca + folio */}
        <div
          style={{
            marginTop: 20,
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
