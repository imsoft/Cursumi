"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { formatPriceMXN } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen, Search } from "lucide-react";

const SEARCH_DEBOUNCE_MS = 350;
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
  const [searchInput, setSearchInput] = useState(initialFilters.q);

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

  useEffect(() => {
    setSearchInput(initialFilters.q);
  }, [initialFilters.q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== initialFilters.q) {
        updateFilter("q", searchInput);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, updateFilter, initialFilters.q]);

  const clearFilters = () => {
    setSearchInput("");
    router.push("/dashboard/explore");
  };

  const hasActiveFilters =
    searchInput !== "" ||
    initialFilters.category !== "all" ||
    initialFilters.modality !== "all" ||
    initialFilters.level !== "all";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Explorar cursos"
        description="Descubre cursos y sigue aprendiendo."
      />

      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              label="Buscar"
              placeholder="Nombre del curso, categoría..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
            <div className="col-span-full">
              <EmptyState
                icon={Search}
                title="Ningún curso coincide con tu búsqueda"
                description="Cambia los filtros o el texto de búsqueda y vuelve a intentar."
                action={{ label: "Limpiar filtros", onClick: clearFilters, variant: "outline" }}
              />
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      {isEnrolled ? "Ir al curso" : "Ver detalles del curso"}
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
