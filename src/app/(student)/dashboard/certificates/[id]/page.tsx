"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Certificate } from "@/components/student/types";
import { ArrowLeft, Download, Share2, Calendar, Award, Clock, User, Check } from "lucide-react";

// Mock data - En producción esto vendría de una API
const mockCertificates: Record<string, Certificate> = {
  "cert-1": {
    id: "cert-1",
    courseId: "4",
    courseTitle: "Marketing de contenidos",
    studentName: "Brandon García",
    instructorName: "Luis Herrera",
    issueDate: "30 de septiembre, 2024",
    certificateNumber: "CUR-2024-001234",
    category: "Marketing",
    modality: "virtual",
    hours: 40,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  "cert-2": {
    id: "cert-2",
    courseId: "6",
    courseTitle: "Fotografía digital",
    studentName: "Brandon García",
    instructorName: "María González",
    issueDate: "15 de septiembre, 2024",
    certificateNumber: "CUR-2024-001189",
    category: "Diseño",
    modality: "presencial",
    hours: 32,
    imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
  },
  "cert-3": {
    id: "cert-3",
    courseId: "8",
    courseTitle: "Copywriting persuasivo",
    studentName: "Brandon García",
    instructorName: "Laura Fernández",
    issueDate: "25 de agosto, 2024",
    certificateNumber: "CUR-2024-001045",
    category: "Marketing",
    modality: "virtual",
    hours: 24,
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
  },
};

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const { id } = use(params);
  const certificate = mockCertificates[id];
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simular descarga (en producción, esto generaría un PDF real)
    setTimeout(() => {
      setIsDownloading(false);
      // En producción, aquí se generaría y descargaría el PDF
      // Por ahora, solo mostramos un mensaje
      alert(`Descargando certificado: ${certificate?.certificateNumber}`);
    }, 500);
  };

  const handleShare = async () => {
    if (!certificate) return;
    
    setIsSharing(true);
    const url = `${window.location.origin}/dashboard/certificates/${certificate.id}`;
    
    try {
      if (navigator.share) {
        // Usar Web Share API si está disponible
        await navigator.share({
          title: `Certificado: ${certificate.courseTitle}`,
          text: `He completado el curso "${certificate.courseTitle}" en Cursumi`,
          url: url,
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // El usuario canceló el compartir o hubo un error
      console.error("Error al compartir:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!certificate) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard/certificates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a certificados
          </Button>
        </Link>
        <Card className="border border-border bg-card/90">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 px-4">
            <Award className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Certificado no encontrado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                El certificado que buscas no existe o no tienes acceso a él.
              </p>
            </div>
            <Link href="/dashboard/certificates">
              <Button variant="default">Ver mis certificados</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/certificates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a certificados
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Share2 className={`mr-2 h-4 w-4 ${isSharing ? "animate-pulse" : ""}`} />
                Compartir
              </>
            )}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className={`mr-2 h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
            {isDownloading ? "Descargando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-xl">
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
                <h1 className="text-3xl font-bold text-foreground mb-2">CERTIFICADO DE COMPLETACIÓN</h1>
                <p className="text-muted-foreground">Este certificado acredita que</p>
              </div>
            </div>

            {/* Nombre del estudiante */}
            <div className="text-center py-6 border-y-2 border-primary/30">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {certificate.studentName}
              </h2>
              <p className="text-lg text-muted-foreground">ha completado exitosamente el curso</p>
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
                  <span className="font-medium">Fecha de emisión:</span>
                </div>
                <p className="text-foreground font-medium">{certificate.issueDate}</p>
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
                  <p className="text-xs text-muted-foreground">Plataforma de Educación</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Información del certificado</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Número de certificado</p>
                <p className="font-mono font-medium">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fecha de emisión</p>
                <p className="font-medium">{certificate.issueDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Curso</p>
                <p className="font-medium">{certificate.courseTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Instructor</p>
                <p className="font-medium">{certificate.instructorName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

