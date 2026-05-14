"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPriceMXN } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpenCheck, ExternalLink, Ban, ToggleRight } from "lucide-react";
import { ModalityBadge } from "@/components/ui/modality-badge";
import Link from "next/link";

type CourseStatus = "published" | "draft" | "archived" | "pending";
type Modality = "virtual" | "presencial" | "live";

interface AdminCourse {
  id: string;
  title: string;
  slug?: string;
  instructorId?: string;
  instructorName: string;
  category: string;
  modality: Modality;
  status: CourseStatus;
  studentsCount: number;
  price: number;
  createdAt: string;
}

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
  { value: "pending", label: "Pendientes" },
  { value: "archived", label: "Archivados / Deshabilitados" },
];

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "live", label: "En vivo" },
  { value: "presencial", label: "Presencial" },
];

const getStatusBadge = (status: CourseStatus) => {
  const config: Record<CourseStatus, { label: string; variant: "default" | "outline" | "destructive" }> = {
    published: { label: "Publicado", variant: "default" },
    draft:     { label: "Borrador",  variant: "outline" },
    pending:   { label: "Pendiente", variant: "outline" },
    archived:  { label: "Deshabilitado", variant: "destructive" },
  };
  return config[status];
};

interface DisableModalProps {
  course: AdminCourse;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

function DisableModal({ course, onClose, onConfirm }: DisableModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reason.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Deshabilitar curso</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              El instructor recibirá una notificación con el motivo. El curso dejará de ser visible para los estudiantes.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-sm font-medium text-foreground">{course.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Por {course.instructorName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Motivo <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive resize-none"
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Este mensaje se enviará como notificación al instructor.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason.trim() || loading}
            >
              <Ban className="mr-2 h-4 w-4" />
              {loading ? "Deshabilitando..." : "Deshabilitar curso"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disablingCourse, setDisablingCourse] = useState<AdminCourse | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/courses", { cache: "no-store" });
      if (!res.ok) throw new Error("No pudimos cargar los cursos");
      const data = (await res.json()) as AdminCourse[];
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const q = searchTerm.trim().toLowerCase();
        return (
          course.title.toLowerCase().includes(q) ||
          course.instructorName.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q)
        );
      })
      .filter((course) => statusFilter === "all" || course.status === statusFilter)
      .filter((course) => modalityFilter === "all" || course.modality === modalityFilter);
  }, [courses, searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all" || modalityFilter !== "all";

  const handleDisable = async (reason: string) => {
    if (!disablingCourse) return;
    await fetch(`/api/admin/courses/${disablingCourse.id}/disable`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable", reason }),
    });
    setCourses((prev) =>
      prev.map((c) => c.id === disablingCourse.id ? { ...c, status: "archived" } : c)
    );
    setDisablingCourse(null);
  };

  const handleEnable = async (course: AdminCourse) => {
    setTogglingId(course.id);
    await fetch(`/api/admin/courses/${course.id}/disable`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable" }),
    });
    setCourses((prev) =>
      prev.map((c) => c.id === course.id ? { ...c, status: "published" } : c)
    );
    setTogglingId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Cursos" description="Revisa y administra todos los cursos" />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <Input
                label="Buscar curso"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
              <Combobox label="Estado" options={statusOptions} value={statusFilter} onValueChange={setStatusFilter} />
              <Combobox label="Modalidad" options={modalityOptions} value={modalityFilter} onValueChange={setModalityFilter} />
            </div>
            <div>
              <Button variant="ghost" size="sm" className="w-full" disabled={!hasActiveFilters} onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border border-border bg-card/90">
          <CardContent className="py-12 text-center text-muted-foreground">Cargando cursos...</CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="Ningún curso coincide"
          description="Ajusta los filtros de búsqueda."
          icon={BookOpenCheck}
          secondaryAction={hasActiveFilters ? { label: "Limpiar filtros", onClick: handleClearFilters, variant: "outline" } : undefined}
        />
      ) : (
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Cursos ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const statusBadge = getStatusBadge(course.status);
                const isDisabled = course.status === "archived";
                return (
                  <div
                    key={course.id}
                    className={`flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      isDisabled ? "border-destructive/30 bg-destructive/5 opacity-80" : "border-border bg-background"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <Badge variant={statusBadge.variant === "destructive" ? "outline" : statusBadge.variant} className={statusBadge.variant === "destructive" ? "border-destructive text-destructive" : ""}>{statusBadge.label}</Badge>
                        <ModalityBadge modality={course.modality} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Por {course.instructorName} · {course.category}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>{course.studentsCount} estudiantes</span>
                        <span>{formatPriceMXN(course.price)}</span>
                        <span>Creado: {course.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {course.slug && (
                        <Link href={`/courses/${course.slug}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            Ver
                          </Button>
                        </Link>
                      )}
                      {isDisabled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnable(course)}
                          disabled={togglingId === course.id}
                        >
                          <ToggleRight className="mr-1.5 h-3.5 w-3.5" />
                          {togglingId === course.id ? "Habilitando..." : "Habilitar"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDisablingCourse(course)}
                          disabled={course.status === "draft"}
                        >
                          <Ban className="mr-1.5 h-3.5 w-3.5" />
                          Deshabilitar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {disablingCourse && (
        <DisableModal
          course={disablingCourse}
          onClose={() => setDisablingCourse(null)}
          onConfirm={handleDisable}
        />
      )}
    </div>
  );
}
