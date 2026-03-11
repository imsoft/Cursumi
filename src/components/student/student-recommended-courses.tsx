"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recommendation } from "@/components/student/types";

interface StudentRecommendationsProps {
  recommendations: Recommendation[];
}

export const StudentRecommendedCourses = ({ recommendations }: StudentRecommendationsProps) => {
  return (
    <Card className="flex h-full flex-col border border-border bg-card/90">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Recomendados para ti</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Cursos que podrían interesarte.</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3 px-4 pb-4 pt-0">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="group flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            {rec.imageUrl && (
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={rec.imageUrl}
                  alt={rec.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-3">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground leading-tight">{rec.title}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{rec.category}</p>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">{rec.modality}</span>
                </div>
              </div>
              <div className="mt-auto">
                <Link href={`/courses/${rec.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full px-4 py-2">
                    Ver curso
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

