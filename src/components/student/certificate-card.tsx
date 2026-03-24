"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/components/student/types";
import { Award, Calendar, Download, Share2, ExternalLink, Check } from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
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
      alert(`Descargando certificado: ${certificate.certificateNumber}`);
    }, 500);
  };

  const handleShare = async () => {
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

  return (
    <Card className="group flex h-full flex-col border border-border bg-card/90 transition-shadow hover:shadow-lg">
      {certificate.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <Image
            src={certificate.imageUrl}
            alt={certificate.courseTitle}
            fill
            className="object-cover opacity-20 transition-opacity group-hover:opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Award className="h-16 w-16 text-primary/40" />
          </div>
        </div>
      )}
      <CardHeader className="flex flex-col gap-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {certificate.courseTitle}
          </CardTitle>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border shrink-0 ${
            certificate.type === "participation"
              ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              : "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400"
          }`}>
            <Award className="mr-1 h-3 w-3" />
            {certificate.type === "participation" ? "Participación" : "Acreditación"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
            {certificate.modality}
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
            {certificate.category}
          </span>
          {certificate.hours && (
            <span className="text-xs">{certificate.hours} horas</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4 px-4 pb-4 pt-0">
        <div className="flex min-h-[80px] flex-1 flex-col justify-start space-y-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Emitido: {certificate.issueDate}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Instructor:</span> {certificate.instructorName}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Número:</span> {certificate.certificateNumber}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/certificates/${certificate.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <ExternalLink className="mr-2 h-3 w-3" />
              Ver certificado
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Descargar PDF"
          >
            <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            onClick={handleShare}
            disabled={isSharing}
            title="Compartir certificado"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Share2 className={`h-4 w-4 ${isSharing ? "animate-pulse" : ""}`} />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

