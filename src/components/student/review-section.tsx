"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface ReviewSectionProps {
  courseId: string;
  canReview?: boolean; // user is enrolled and has >50% progress
  userHasReviewed?: boolean;
}

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className="disabled:cursor-default"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ courseId, canReview, userHasReviewed }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAverage(data.average);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar reseña");
      setShowForm(false);
      setComment("");
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Reseñas
            {total > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({total})
              </span>
            )}
          </CardTitle>
          {total > 0 && (
            <div className="flex items-center gap-1">
              <StarRating value={Math.round(average)} readonly />
              <span className="text-sm font-semibold text-foreground">{average}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {canReview && !userHasReviewed && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Dejar una reseña
          </Button>
        )}

        {showForm && (
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">Calificación</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {submitError && <p className="text-xs text-destructive">{submitError}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Enviando..." : "Publicar reseña"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando reseñas...</p>
        ) : reviews.length === 0 ? (
          <EmptyState
            title="Sin reseñas"
            description="Sé el primero en dejar una reseña para este curso."
            icon={Star}
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="space-y-1 border-b border-border pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly />
                  <span className="text-sm font-medium text-foreground">
                    {review.user.name || "Anónimo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
