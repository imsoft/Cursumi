"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Star, CheckCircle, Trash2, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  course: { id: string; title: string };
}

interface ReviewModerationClientProps {
  initialReviews: Review[];
}

export function ReviewModerationClient({ initialReviews }: ReviewModerationClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderación de Reseñas"
        description={`${reviews.length} reseña${reviews.length !== 1 ? "s" : ""} pendiente${reviews.length !== 1 ? "s" : ""} de aprobación`}
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No hay reseñas pendientes"
          description="Todas las reseñas han sido moderadas."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border border-border bg-card/90">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {review.user.name || review.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{review.user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Curso: <span className="font-medium">{review.course.title}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3">
                    {review.comment}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id)}
                    disabled={loading === review.id}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(review.id)}
                    disabled={loading === review.id}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
