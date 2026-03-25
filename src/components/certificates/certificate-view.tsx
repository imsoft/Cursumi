"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Calendar } from "lucide-react";
import type { Certificate } from "@/components/student/types";

interface CertificateViewProps {
  certificate: Certificate;
}

export function CertificateView({ certificate }: CertificateViewProps) {
  return (
    <Card data-certificate className="border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 shadow-xl">
      <CardContent className="p-8 md:p-12 print:p-4">
        <div className="space-y-8 print:space-y-4">
          {/* Header del certificado */}
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
                {certificate.type === "participation"
                  ? "RECONOCIMIENTO DE PARTICIPACIÓN"
                  : "CERTIFICADO DE ACREDITACIÓN"}
              </h1>
              <p className="text-muted-foreground">
                {certificate.type === "participation"
                  ? "Este reconocimiento certifica que"
                  : "Este certificado acredita que"}
              </p>
            </div>
          </div>

          {/* Nombre del estudiante */}
          <div className="text-center py-6 border-y-2 border-primary/30">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {certificate.studentName}
            </h2>
            <p className="text-lg text-muted-foreground">
              {certificate.type === "participation"
                ? "ha participado en el curso"
                : "ha completado exitosamente el curso"}
            </p>
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

          {/* Detalles adicionales: siempre 2 columnas (impresión no usa breakpoint md) */}
          <div
            data-certificate-meta
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-border print:grid-cols-2 print:gap-8 print:pt-4"
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
          <div className="text-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Número de certificado</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {certificate.certificateNumber}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border print:pt-3">
            <div className="flex items-end justify-between gap-4 print:gap-6">
              <div className="text-center flex-1 min-w-0">
                <div className="h-12 print:h-10 border-b border-foreground/20 mb-1"></div>
                <p className="text-xs text-muted-foreground">{certificate.instructorName}</p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="h-12 print:h-10 border-b border-foreground/20 mb-1"></div>
                <p className="text-xs text-muted-foreground">Cursumi</p>
                <p className="text-xs text-muted-foreground">Plataforma de Educación</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
