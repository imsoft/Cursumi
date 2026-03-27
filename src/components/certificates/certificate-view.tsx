"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Calendar } from "lucide-react";
import type { Certificate } from "@/components/student/types";

interface CertificateViewProps {
  certificate: Certificate;
}

export function CertificateView({ certificate }: CertificateViewProps) {
  const isAccreditation = certificate.type === "accreditation";
  const sigH = certificate.signatureHeight ?? 64;

  return (
    <Card data-certificate className="border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 shadow-xl">
      <CardContent className="p-8 md:p-14 print:p-0">
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
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isAccreditation
                  ? "CONSTANCIA DE ACREDITACIÓN"
                  : "CONSTANCIA DE PARTICIPACIÓN"}
              </h1>
              <p className="text-muted-foreground">
                {isAccreditation
                  ? "Esta constancia acredita que"
                  : "Esta constancia certifica que"}
              </p>
            </div>
          </div>

          {/* Nombre del estudiante */}
          <div className="text-center py-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {certificate.studentName}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isAccreditation
                ? <>ha acreditado satisfactoriamente el taller</>
                : "ha participado en el taller"}
            </p>
            {isAccreditation && certificate.score != null && (
              <p className="text-lg text-muted-foreground mt-1">
                con una calificación de <span className="font-semibold text-foreground">{certificate.score}</span>
              </p>
            )}
          </div>

          {/* Información del curso */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
              {certificate.courseTitle}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center rounded-md border border-border bg-background px-4 py-1 text-sm font-medium">
                {certificate.category}
              </span>
              <span className="inline-flex items-center rounded-md border border-border bg-background px-4 py-1 text-sm font-medium">
                {certificate.modality}
              </span>
              {certificate.hours && (
                <span className="inline-flex items-center rounded-md border border-border bg-background px-4 py-1 text-sm font-medium">
                  <Clock className="mr-1 h-3 w-3" />
                  {certificate.hours} horas
                </span>
              )}
            </div>
          </div>

          {/* Detalles: instructor + fecha en 2 columnas */}
          <div
            data-certificate-meta
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 print:grid-cols-2 print:gap-8 print:pt-4"
          >
            <div className="min-w-0 text-left">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">Instructor:</span>{" "}
                  <span className="text-foreground font-medium">{certificate.instructorName}</span>
                </div>
              </div>
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">Fecha de emisión:</span>{" "}
                  <span className="text-foreground font-medium">{certificate.issueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Número de certificado */}
          <div className="text-center pt-6">
            <p className="text-xs text-muted-foreground mb-1">Número de constancia</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {certificate.certificateNumber}
            </p>
          </div>

          {/* Firmas: instructor + administrador */}
          <div className="pt-6 print:pt-3">
            <div className="flex items-end justify-between gap-4 print:gap-6">
              <div className="text-center flex-1 min-w-0">
                {certificate.instructorSignatureUrl ? (
                  <div className="flex items-end justify-center mb-1" style={{ height: sigH }}>
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
                  <div className="mb-1" style={{ height: sigH }}></div>
                )}
                <div className="border-t border-foreground/30 pt-1">
                  <p className="text-xs text-muted-foreground">{certificate.instructorName}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
              <div className="text-center flex-1 min-w-0">
                {certificate.adminSignatureUrl ? (
                  <div className="flex items-end justify-center mb-1" style={{ height: sigH }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={certificate.adminSignatureUrl}
                      alt="Firma del administrador"
                      data-signature
                      className="w-auto object-contain"
                      style={{ maxHeight: sigH }}
                    />
                  </div>
                ) : (
                  <div className="mb-1" style={{ height: sigH }}></div>
                )}
                <div className="border-t border-foreground/30 pt-1">
                  <p className="text-xs text-muted-foreground">Diseñador del taller</p>
                </div>
              </div>
            </div>

            {/* CURSUMI centrado debajo de las firmas */}
            <div className="text-center mt-6 print:mt-4">
              <p className="text-sm font-bold text-foreground tracking-wide">CURSUMI</p>
              <p className="text-xs text-muted-foreground">Plataforma educativa</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
