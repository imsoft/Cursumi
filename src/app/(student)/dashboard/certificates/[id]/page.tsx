"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Certificate } from "@/components/student/types";
import { ArrowLeft, Download, Share2, Award, Check } from "lucide-react";
import { CertificateView } from "@/components/certificates/certificate-view";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#ef4444"];
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    // Big burst in the center
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/me/certificates/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Certificado no encontrado");
        }
        const data = (await res.json()) as Certificate;
        setCertificate(data);
        if (isNew) {
          // Small delay so the page renders first
          setTimeout(() => fireConfetti(), 300);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos cargar el certificado");
      }
    };
    load();
  }, [id, isNew, fireConfetti]);

  const handleDownload = () => {
    setIsDownloading(true);
    // Use browser's print-to-PDF. A global @media print CSS hides nav elements.
    window.print();
    setTimeout(() => setIsDownloading(false), 1000);
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

  if (error || !certificate) {
    return (
      <div className="space-y-6">
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
                {error || "El certificado que buscas no existe o no tienes acceso a él."}
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
    <div className="space-y-6">
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

      <CertificateView certificate={certificate} />

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
