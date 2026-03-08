"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { formatPriceMXN } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import type { Course } from "@/components/courses/types";

interface Category {
  slug: string;
  name: string;
}

interface ExploreClientProps {
  courses: Course[];
  categories: Category[];
  enrolledCourseIds: string[];
  initialFilters: {
    q: string;
    category: string;
    modality: string;
    level: string;
  };
}

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

const levelOptions = [
  { value: "all", label: "Todos los niveles" },
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

export function ExploreClient({
  courses,
  categories,
  enrolledCourseIds,
  initialFilters,
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryOptions = [
    { value: "all", label: "Todas las categorías" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const enrolledSet = new Set(enrolledCourseIds);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/dashboard/explore?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/dashboard/explore");
  };

  const hasActiveFilters =
    initialFilters.q !== "" ||
    initialFilters.category !== "all" ||
    initialFilters.modality !== "all" ||
    initialFilters.level !== "all";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Explorar cursos"
        description="Descubre nuevos cursos y expande tus conocimientos en Cursumi."
      />

      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              label="Buscar curso"
              placeholder="Buscar por título o descripción..."
              defaultValue={initialFilters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
            />
          </div>
          <div className="grid w-full gap-4 md:w-auto md:grid-cols-3">
            <Select
              label="Categoría"
              options={categoryOptions}
              value={initialFilters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            />
            <Select
              label="Modalidad"
              options={modalityOptions}
              value={initialFilters.modality}
              onChange={(e) => updateFilter("modality", e.target.value)}
            />
            <Select
              label="Nivel"
              options={levelOptions}
              value={initialFilters.level}
              onChange={(e) => updateFilter("level", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full md:w-auto"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {courses.length} {courses.length === 1 ? "curso" : "cursos"}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-muted-foreground">
              No hay cursos que coincidan con los filtros.
            </div>
          )}
          {courses.map((course) => {
            const isEnrolled = enrolledSet.has(course.id);
            const href = isEnrolled
              ? `/dashboard/my-courses/${course.id}`
              : `/dashboard/explore/${course.id}`;
            return (
              <Link key={course.id} href={href} className="block h-full">
                <Card className="group flex h-full flex-col border border-border bg-card/90 transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer">
                  {course.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="flex flex-col gap-3 px-4 pt-4">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-border bg-background px-3 py-1 font-semibold uppercase tracking-widest text-muted-foreground">
                        {course.modality}
                      </span>
                      <span className="rounded-full border border-border bg-background px-3 py-1 font-semibold uppercase tracking-widest text-muted-foreground">
                        {course.category}
                      </span>
                      {course.level && (
                        <span className="rounded-full border border-border bg-background px-3 py-1 font-semibold uppercase tracking-widest text-muted-foreground">
                          {course.level}
                        </span>
                      )}
                    </div>
                    {course.instructorName && (
                      <p className="text-xs text-muted-foreground">Por {course.instructorName}</p>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto flex items-center justify-between px-4 pb-4 pt-0">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPriceMXN(course.price ?? 0)}
                    </span>
                    <Button size="sm" className="pointer-events-none">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {isEnrolled ? "Ver curso" : "Ver detalles"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
