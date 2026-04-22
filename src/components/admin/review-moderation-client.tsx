"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Star,
  CheckCircle,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  course: { id: string; title: string };
}

interface Course {
  id: string;
  title: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/25"}`}
        />
      ))}
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = total > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : "—";
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div className="rounded-xl border bg-card p-5 flex gap-8 items-center flex-wrap">
      <div className="text-center min-w-[80px]">
        <p className="text-4xl font-bold tracking-tight">{avg}</p>
        <div className="flex justify-center mt-1">
          <StarRating rating={Math.round(Number(avg))} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{total} reseña{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex-1 min-w-[180px] space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-3 text-right">{star}</span>
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-4">{count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-sm min-w-[120px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{total - pending} aprobadas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">{pending} pendientes</span>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  onApprove,
  onDelete,
  loading,
  showCourse = true,
}: {
  review: Review;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  loading: string | null;
  showCourse?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const MAX_LEN = 200;
  const isLong = (review.comment?.length ?? 0) > MAX_LEN;
  const displayComment =
    isLong && !expanded ? review.comment!.slice(0, MAX_LEN) + "…" : review.comment;
  const isBusy = loading === review.id;

  return (
    <Card className="border bg-card/90">
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {review.user.name || review.user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{review.user.email}</p>
            {showCourse && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Curso:{" "}
                <span className="font-medium text-foreground">{review.course.title}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StarRating rating={review.rating} />
            <Badge variant={review.approved ? "default" : "outline"} className="text-xs">
              {review.approved ? "Aprobada" : "Pendiente"}
            </Badge>
          </div>
        </div>

        {/* Comment */}
        {review.comment ? (
          <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
            <p className="text-sm text-foreground leading-relaxed">{displayComment}</p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Ver comentario completo
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic px-1">Sin comentario escrito</p>
        )}

        {/* Footer: date + actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <div className="flex gap-2">
            {!review.approved && (
              <Button
                size="sm"
                disabled={isBusy}
                onClick={() => onApprove(review.id)}
                className="gap-1.5 h-8 text-xs"
              >
                {isBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Aprobar
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              disabled={isBusy}
              onClick={() => onDelete(review.id)}
              className="gap-1.5 h-8 text-xs"
            >
              {isBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReviewModerationClient({ courses }: { courses: Course[] }) {
  const [pending, setPending] = useState<Review[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [courseReviews, setCourseReviews] = useState<Review[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<"all" | "pending" | "approved">("all");
  const [approvingAll, setApprovingAll] = useState(false);
  const [confirmApproveAll, setConfirmApproveAll] = useState(false);

  // Load pending reviews on mount
  useEffect(() => {
    fetch("/api/admin/reviews?approved=false")
      .then((r) => r.json())
      .then((data) => { setPending(data); setLoadingPending(false); });
  }, []);

  // Load course reviews when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingCourse(true);
    setCourseFilter("all");
    fetch(`/api/admin/reviews?courseId=${selectedCourse}`)
      .then((r) => r.json())
      .then((data) => { setCourseReviews(data); setLoadingCourse(false); });
  }, [selectedCourse]);

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (!res.ok) return;
      // Update both lists
      setPending((prev) => prev.filter((r) => r.id !== id));
      setCourseReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setPending((prev) => prev.filter((r) => r.id !== id));
      setCourseReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleApproveAll = async () => {
    if (!confirmApproveAll) {
      setConfirmApproveAll(true);
      setTimeout(() => setConfirmApproveAll(false), 3000);
      return;
    }
    setApprovingAll(true);
    setConfirmApproveAll(false);
    for (const review of pending) {
      await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
    }
    setPending([]);
    setApprovingAll(false);
  };

  const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

  const filteredCourseReviews = courseReviews.filter((r) => {
    if (courseFilter === "pending") return !r.approved;
    if (courseFilter === "approved") return r.approved;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderación de Reseñas"
        description="Aprueba o elimina reseñas de alumnos, y consulta el historial por curso."
      />

      <Tabs defaultValue="pending">
        <TabsList className="w-fit">
          <TabsTrigger value="pending" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Pendientes
            {pending.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center font-semibold">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="by-course" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Por curso
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Pendientes ─────────────────────────────────────────── */}
        <TabsContent value="pending" className="mt-4 space-y-4">
          {loadingPending ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando reseñas…
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No hay reseñas pendientes"
              description="Todas las reseñas han sido moderadas."
            />
          ) : (
            <>
              {/* Bulk action */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {pending.length} reseña{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}
                </p>
                <Button
                  variant={confirmApproveAll ? "default" : "outline"}
                  size="sm"
                  disabled={approvingAll}
                  onClick={handleApproveAll}
                  className="gap-2 text-xs"
                >
                  {approvingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  {approvingAll
                    ? "Aprobando…"
                    : confirmApproveAll
                    ? `¿Confirmar aprobar ${pending.length}?`
                    : `Aprobar todas (${pending.length})`}
                </Button>
              </div>

              <div className="space-y-3">
                {pending.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                    loading={actionLoading}
                    showCourse
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Tab 2: Por curso ──────────────────────────────────────────── */}
        <TabsContent value="by-course" className="mt-4 space-y-4">
          <div className="w-80">
            <Combobox
              label="Curso"
              options={courseOptions}
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              placeholder="Selecciona un curso"
              searchPlaceholder="Buscar curso…"
              emptyText="No se encontró el curso"
            />
          </div>

          {!selectedCourse && (
            <div className="rounded-xl border border-dashed bg-card/50 p-12 flex flex-col items-center gap-2 text-muted-foreground text-sm">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p>Selecciona un curso para ver sus reseñas y calificaciones</p>
            </div>
          )}

          {selectedCourse && loadingCourse && (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando reseñas del curso…
            </div>
          )}

          {selectedCourse && !loadingCourse && (
            <>
              {/* Rating stats */}
              {courseReviews.length > 0 && (
                <RatingDistribution reviews={courseReviews} />
              )}

              {/* Filter pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {(["all", "pending", "approved"] as const).map((f) => {
                  const labels = { all: "Todas", pending: "Pendientes", approved: "Aprobadas" };
                  const counts = {
                    all: courseReviews.length,
                    pending: courseReviews.filter((r) => !r.approved).length,
                    approved: courseReviews.filter((r) => r.approved).length,
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setCourseFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        courseFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {labels[f]} ({counts[f]})
                    </button>
                  );
                })}
              </div>

              {filteredCourseReviews.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="Sin reseñas"
                  description={
                    courseFilter === "pending"
                      ? "No hay reseñas pendientes en este curso."
                      : courseFilter === "approved"
                      ? "No hay reseñas aprobadas en este curso."
                      : "Este curso aún no tiene reseñas."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredCourseReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onApprove={handleApprove}
                      onDelete={handleDelete}
                      loading={actionLoading}
                      showCourse={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
