"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface Application {
  id: string;
  status: "pending" | "approved" | "rejected";
  headline: string | null;
  bio: string | null;
  reason: string | null;
  rejectionReason: string | null;
  createdAt: Date | string;
}

interface BecomeInstructorClientProps {
  application: Application | null;
}

export function BecomeInstructorClient({ application: initialApplication }: BecomeInstructorClientProps) {
  const router = useRouter();
  const [application, setApplication] = useState(initialApplication);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(!initialApplication || initialApplication.status === "rejected");

  const [headline, setHeadline] = useState(initialApplication?.headline ?? "");
  const [bio, setBio] = useState(initialApplication?.bio ?? "");
  const [reason, setReason] = useState(initialApplication?.reason ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/instructor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, bio, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar la solicitud");
        return;
      }
      setApplication(data.application);
      setShowForm(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  // Estado: pendiente
  if (application?.status === "pending") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <PageHeader />
        <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="flex items-start gap-4 p-6">
            <Clock className="h-8 w-8 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Solicitud en revisión</p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Tu solicitud fue enviada el{" "}
                {new Date(application.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . El equipo de Cursumi la revisará pronto y recibirás una notificación con la decisión.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tu solicitud</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Título profesional</p>
              <p className="text-foreground">{application.headline}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Sobre ti</p>
              <p className="text-foreground">{application.bio}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Por qué quieres ser instructor</p>
              <p className="text-foreground">{application.reason}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado: rechazada
  if (application?.status === "rejected" && !showForm) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <PageHeader />
        <Card className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="flex items-start gap-4 p-6">
            <XCircle className="h-8 w-8 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Solicitud no aprobada</p>
              {application.rejectionReason && (
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  Motivo: {application.rejectionReason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => { setShowForm(true); setError(null); }}>
          Volver a solicitar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Formulario (nueva solicitud o re-solicitud)
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <PageHeader />

      {application?.status === "rejected" && (
        <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Tu solicitud anterior fue rechazada. Puedes enviar una nueva.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Solicitud para ser instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Input
                label="Título profesional *"
                placeholder="Ej: Desarrollador web con 5 años de experiencia"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={120}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{headline.length}/120</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Sobre ti *</label>
              <Textarea
                placeholder="Cuéntanos tu experiencia, formación y habilidades..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/1000</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">¿Por qué quieres ser instructor? *</label>
              <Textarea
                placeholder="Explica qué temas enseñarías, tu metodología y por qué te interesa compartir tu conocimiento..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{reason.length}/2000</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !headline.trim() || bio.length < 10 || reason.length < 20}
              className="w-full"
            >
              {submitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convertirse en instructor</h1>
          <p className="text-sm text-muted-foreground">
            Comparte tu conocimiento y crea cursos para estudiantes de Cursumi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { icon: CheckCircle, text: "Crea y publica cursos" },
          { icon: CheckCircle, text: "Llega a más estudiantes" },
          { icon: CheckCircle, text: "Genera ingresos" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
