"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, User, Calendar } from "lucide-react";
import type { Certificate } from "@/components/student/types";

interface CertificateViewProps {
  certificate: Certificate;
}

export function CertificateView({ certificate }: CertificateViewProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-xl print:shadow-none print:border-0">
      <CardContent className="p-8 md:p-12">
        <div className="space-y-8">
          {/* Header del certificado */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Award className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {certificate.type === "participation"
                  ? "RECONOCIMIENTO DE PARTICIPACI\u00D3N"
                  : "CERTIFICADO DE ACREDITACI\u00D3N"}
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

          {/* Informaci\u00F3n del curso */}
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

          {/* Detalles adicionales */}
          <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">Instructor:</span>
              </div>
              <p className="text-foreground font-medium">{certificate.instructorName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Fecha de emisi\u00F3n:</span>
              </div>
              <p className="text-foreground font-medium">{certificate.issueDate}</p>
            </div>
          </div>

          {/* N\u00FAmero de certificado */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">N\u00FAmero de certificado</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {certificate.certificateNumber}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="h-16 border-b border-foreground/20 mb-2"></div>
                <p className="text-xs text-muted-foreground">{certificate.instructorName}</p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
              <div className="text-center flex-1">
                <div className="h-16 border-b border-foreground/20 mb-2"></div>
                <p className="text-xs text-muted-foreground">Cursumi</p>
                <p className="text-xs text-muted-foreground">Plataforma de Educaci\u00F3n</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
