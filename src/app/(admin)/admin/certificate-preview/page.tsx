"use client";

import { useState, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateView } from "@/components/certificates/certificate-view";
import { CertificatePdfHint } from "@/components/certificates/certificate-pdf-hint";
import { PartyPopper, Download } from "lucide-react";
import type { Certificate } from "@/components/student/types";

const DEFAULTS: Certificate = {
  id: "preview",
  courseId: "preview",
  courseTitle: "Desarrollo Web Full Stack con Next.js",
  studentName: "Juan Carlos Ramirez Lopez",
  instructorName: "Maria Fernanda Torres",
  issueDate: new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  certificateNumber: "CUR-PREVIEW-ABCD",
  type: "accreditation",
  category: "Tecnologia",
  modality: "virtual",
  hours: 40,
};

export default function CertificatePreviewPage() {
  const [cert, setCert] = useState<Certificate>(DEFAULTS);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Vista previa certificado · Cursumi";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const update = (patch: Partial<Certificate>) =>
    setCert((prev) => ({ ...prev, ...patch }));

  const fireConfetti = useCallback(() => {
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#ef4444"];
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 }, colors });
  }, []);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-semibold text-foreground">Preview de certificado</h1>
        <p className="text-sm text-muted-foreground">
          Modifica los campos para ver como se ve el certificado con distintos datos.
        </p>
      </div>

      {/* Controls */}
      <Card className="print:hidden">
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Nombre del estudiante</label>
              <Input
                className="mt-1"
                value={cert.studentName}
                onChange={(e) => update({ studentName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Nombre del curso</label>
              <Input
                className="mt-1"
                value={cert.courseTitle}
                onChange={(e) => update({ courseTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Instructor</label>
              <Input
                className="mt-1"
                value={cert.instructorName}
                onChange={(e) => update({ instructorName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Categoria</label>
              <Input
                className="mt-1"
                value={cert.category}
                onChange={(e) => update({ category: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Horas</label>
              <Input
                className="mt-1"
                type="number"
                value={cert.hours ?? ""}
                onChange={(e) =>
                  update({ hours: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Modalidad</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cert.modality}
                onChange={(e) =>
                  update({ modality: e.target.value as "virtual" | "presencial" })
                }
              >
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={cert.type}
                onChange={(e) =>
                  update({ type: e.target.value as "accreditation" | "participation" })
                }
              >
                <option value="accreditation">Acreditacion</option>
                <option value="participation">Participacion</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">No. de certificado</label>
              <Input
                className="mt-1"
                value={cert.certificateNumber}
                onChange={(e) => update({ certificateNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={fireConfetti}>
              <PartyPopper className="mr-2 h-4 w-4" />
              Probar confetti
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-4 w-4" />
              Probar descarga PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <CertificatePdfHint />

      {/* Certificate */}
      <CertificateView certificate={cert} />
    </div>
  );
}
