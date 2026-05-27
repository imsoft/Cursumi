"use client";

import { Clock, User, Calendar } from "lucide-react";
import type { Certificate } from "@/components/student/types";

interface CertificateViewProps {
  certificate: Certificate;
}

// Colores fijos del tema claro — el certificado NUNCA hereda el tema oscuro
const L = {
  bg:           "#ffffff",
  bgGrad:       "linear-gradient(to bottom right, #ffffff, #f3f0ff)",
  fg:           "#0f0a1e",
  primary:      "#7c3aed",
  muted:        "#f4f4f8",
  mutedFg:      "#6b6b80",
  border:       "#e4e4ea",
  cardBorder:   "rgba(124,58,237,0.2)",
};

export function CertificateView({ certificate }: CertificateViewProps) {
  const isAccreditation = certificate.type === "accreditation";
  const sigH = certificate.signatureHeight ?? 64;

  return (
    <div
      data-certificate
      style={{
        background:   L.bgGrad,
        border:       `2px solid ${L.cardBorder}`,
        borderRadius: "0.75rem",
        boxShadow:    "0 10px 40px rgba(0,0,0,0.12)",
        color:        L.fg,
        colorScheme:  "light",
      }}
    >
      <div className="p-8 md:p-14 print:p-0">
        <div className="space-y-8 md:space-y-10">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/cursumi.svg"
                alt="Cursumi"
                width={160}
                height={46}
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: L.fg }}
              >
                {isAccreditation
                  ? "CONSTANCIA DE ACREDITACIÓN"
                  : "CONSTANCIA DE PARTICIPACIÓN"}
              </h1>
              <p style={{ color: L.mutedFg }}>
                {isAccreditation
                  ? "Esta constancia acredita que"
                  : "Esta constancia certifica que"}
              </p>
            </div>
          </div>

          {/* Nombre del estudiante */}
          <div className="text-center py-6">
            <h2
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: L.primary }}
            >
              {certificate.studentName}
            </h2>
            <p className="text-lg" style={{ color: L.mutedFg }}>
              {isAccreditation
                ? "ha acreditado satisfactoriamente el taller"
                : "ha participado en el taller"}
            </p>
            {isAccreditation && certificate.score != null && (
              <p className="text-lg mt-1" style={{ color: L.mutedFg }}>
                con una calificación de{" "}
                <span className="font-semibold" style={{ color: L.fg }}>
                  {certificate.score}
                </span>
              </p>
            )}
          </div>

          {/* Información del curso */}
          <div className="text-center space-y-4">
            <h3
              className="text-2xl md:text-3xl font-semibold"
              style={{ color: L.fg }}
            >
              {certificate.courseTitle}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span
                className="inline-flex items-center rounded-md px-4 py-1 text-sm font-medium"
                style={{
                  border:     `1px solid ${L.border}`,
                  background: L.bg,
                  color:      L.fg,
                }}
              >
                {certificate.category}
              </span>
              <span
                className="inline-flex items-center rounded-md px-4 py-1 text-sm font-medium"
                style={{
                  border:     `1px solid ${L.border}`,
                  background: L.bg,
                  color:      L.fg,
                }}
              >
                {certificate.modality}
              </span>
              {certificate.hours && (
                <span
                  className="inline-flex items-center rounded-md px-4 py-1 text-sm font-medium"
                  style={{
                    border:     `1px solid ${L.border}`,
                    background: L.bg,
                    color:      L.fg,
                  }}
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {certificate.hours} horas
                </span>
              )}
            </div>
          </div>

          {/* Detalles: instructor + fecha en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 print:grid-cols-2 print:gap-8 print:pt-4">
            <div className="min-w-0 text-left">
              <div className="flex items-start gap-2 text-sm" style={{ color: L.mutedFg }}>
                <User className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">Instructor:</span>{" "}
                  <span className="font-medium" style={{ color: L.fg }}>
                    {certificate.instructorName}
                  </span>
                </div>
              </div>
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-start gap-2 text-sm" style={{ color: L.mutedFg }}>
                <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">Fecha de emisión:</span>{" "}
                  <span className="font-medium" style={{ color: L.fg }}>
                    {certificate.issueDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Número de certificado */}
          <div className="text-center pt-6">
            <p className="text-xs mb-1" style={{ color: L.mutedFg }}>
              Número de constancia
            </p>
            <p className="text-sm font-mono font-semibold" style={{ color: L.fg }}>
              {certificate.certificateNumber}
            </p>
          </div>

          {/* Firma del instructor (única) */}
          <div className="pt-6 print:pt-3">
            <div className="flex justify-center">
              <div className="text-center" style={{ minWidth: 200 }}>
                {certificate.instructorSignatureUrl ? (
                  <div
                    className="flex items-end justify-center mb-1"
                    style={{ height: sigH }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={certificate.instructorSignatureUrl}
                      alt={`Firma de ${certificate.instructorName}`}
                      data-signature
                      className="w-auto object-contain"
                      style={{ maxHeight: sigH }}
                    />
                  </div>
                ) : (
                  <div className="mb-1" style={{ height: sigH }} />
                )}
                <div
                  className="pt-1"
                  style={{ borderTop: `1px solid ${L.fg}4D` }}
                >
                  <p className="text-xs" style={{ color: L.mutedFg }}>
                    {certificate.instructorName}
                  </p>
                  <p className="text-xs" style={{ color: L.mutedFg }}>
                    Instructor
                  </p>
                </div>
              </div>
            </div>

            {/* CURSUMI centrado debajo de la firma */}
            <div className="text-center mt-6 print:mt-4">
              <p
                className="text-sm font-bold tracking-wide"
                style={{ color: L.fg }}
              >
                CURSUMI
              </p>
              <p className="text-xs" style={{ color: L.mutedFg }}>
                Plataforma educativa
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
