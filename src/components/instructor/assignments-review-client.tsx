"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface AssignmentSubmission {
  id: string;
  content: string;
  submittedAt: string;
  updatedAt: string;
  lesson: { id: string; title: string };
  enrollment: {
    student: { id: string; name: string | null; email: string; image: string | null };
  };
}

function SubmissionRow({ sub }: { sub: AssignmentSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const student = sub.enrollment.student;
  const initials = (student.name || student.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </div>
          </Avatar>
          <div>
            <p className="font-medium text-foreground text-sm">{student.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {sub.lesson.title}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(sub.submittedAt).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground mb-2 pt-3">Respuesta del alumno:</p>
          <div className="rounded-md border border-border bg-background p-3 text-sm text-foreground whitespace-pre-wrap">
            {sub.content}
          </div>
          {sub.updatedAt !== sub.submittedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Última edición: {new Date(sub.updatedAt).toLocaleDateString("es-MX", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AssignmentsReviewClient({ courseId }: { courseId: string }) {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/instructor/courses/${courseId}/assignments`)
      .then((r) => r.json())
      .then(({ submissions }) => setSubmissions(submissions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = s.enrollment.student.name?.toLowerCase() ?? "";
    const email = s.enrollment.student.email.toLowerCase();
    const lesson = s.lesson.title.toLowerCase();
    return name.includes(q) || email.includes(q) || lesson.includes(q);
  });

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Tareas entregadas</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Cargando…</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tareas entregadas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {submissions.length} {submissions.length === 1 ? "entrega" : "entregas"} en total
            </p>
          </div>
          {submissions.length > 0 && (
            <div className="relative w-full sm:w-auto sm:min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar alumno o lección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <EmptyState
            title={submissions.length === 0 ? "Sin tareas entregadas" : "Sin resultados"}
            description={
              submissions.length === 0
                ? "Los alumnos aún no han entregado tareas."
                : "No se encontraron tareas con ese criterio."
            }
            icon={ClipboardList}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => (
              <SubmissionRow key={sub.id} sub={sub} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
