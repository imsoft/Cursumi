"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type AppStatus = "pending" | "approved" | "rejected";

interface Application {
  id: string;
  status: AppStatus;
  headline: string | null;
  bio: string | null;
  reason: string;
  rejectionReason: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

const statusConfig: Record<AppStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: <Clock className="h-3 w-3" /> },
  approved: { label: "Aprobada", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: <XCircle className="h-3 w-3" /> },
};

export default function InstructorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppStatus | "all">("pending");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<string | null>(null); // ID de la app siendo rechazada
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/instructor-applications?status=${filter}`);
      const data = await res.json();
      setApplications(data.applications ?? []);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/instructor-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) await fetchApplications();
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/instructor-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectionReason.trim() }),
      });
      if (res.ok) {
        setRejecting(null);
        setRejectionReason("");
        await fetchApplications();
      }
    } finally {
      setProcessing(null);
    }
  };

  const pending = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes de instructor"
        description="Revisa y gestiona las solicitudes para convertirse en instructor"
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "all" ? "Todas" : statusConfig[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Cargando solicitudes...</div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No hay solicitudes"
          description={filter === "pending" ? "No hay solicitudes pendientes por revisar." : "No hay solicitudes en esta categoría."}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expanded.has(app.id);
            const status = statusConfig[app.status];
            const isProcessing = processing === app.id;
            const isRejectingThis = rejecting === app.id;

            return (
              <Card key={app.id} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground uppercase">
                        {app.user.name?.slice(0, 2) ?? <User className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{app.user.name ?? "Sin nombre"}</p>
                        <p className="text-sm text-muted-foreground truncate">{app.user.email}</p>
                        {app.headline && (
                          <p className="text-xs text-muted-foreground truncate">{app.headline}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      <button
                        onClick={() => toggleExpand(app.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solicitado el {new Date(app.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t border-border pt-4">
                    <div className="space-y-3 text-sm">
                      {app.bio && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Sobre el solicitante</p>
                          <RichTextRenderer content={app.bio} className="text-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">¿Por qué quiere ser instructor?</p>
                        <p className="text-foreground whitespace-pre-wrap">{app.reason}</p>
                      </div>
                      {app.rejectionReason && (
                        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                          <p className="font-medium text-red-700 dark:text-red-300 mb-1">Motivo de rechazo</p>
                          <p className="text-red-600 dark:text-red-400">{app.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Acciones solo para pendientes */}
                    {app.status === "pending" && (
                      <div className="space-y-3 pt-2">
                        {!isRejectingThis ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              {isProcessing ? "Procesando..." : "Aprobar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setRejecting(app.id); setRejectionReason(""); }}
                              disabled={isProcessing}
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Rechazar
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Motivo del rechazo *</label>
                            <Textarea
                              placeholder="Explica al solicitante por qué no fue aprobado..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                              maxLength={500}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(app.id)}
                                disabled={!rejectionReason.trim() || isProcessing}
                              >
                                {isProcessing ? "Enviando..." : "Confirmar rechazo"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setRejecting(null); setRejectionReason(""); }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
