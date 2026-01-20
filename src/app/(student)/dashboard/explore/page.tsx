"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { formatPriceMXN } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: "virtual" | "presencial";
  instructorName?: string;
  price?: number;
  imageUrl?: string;
  level?: string;
}

const categoryOptions = [
  { value: "all", label: "Todas las categorías" },
  { value: "Programación", label: "Programación" },
  { value: "Marketing", label: "Marketing" },
  { value: "Diseño", label: "Diseño" },
  { value: "Negocios", label: "Negocios" },
  { value: "Habilidades blandas", label: "Habilidades blandas" },
];

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

const levelOptions = [
  { value: "all", label: "Todos los niveles" },
  { value: "Principiante", label: "Principiante" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
];

export default function ExploreCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [coursesRes, myCoursesRes] = await Promise.all([
          fetch("/api/courses", { cache: "no-store" }),
          fetch("/api/me/courses", { cache: "no-store" }),
        ]);
        if (!coursesRes.ok) {
          throw new Error("No se pudieron cargar los cursos");
        }
        const coursesData = (await coursesRes.json()) as Course[];
        setCourses(coursesData);

        if (myCoursesRes.ok) {
          const myCourses = (await myCoursesRes.json()) as { id: string }[];
          setPurchasedCourseIds(myCourses.map((c) => c.id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar cursos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase() || "");

      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const matchesModality = modalityFilter === "all" || course.modality === modalityFilter;
      const matchesLevel = levelFilter === "all" || (course.level || "all") === levelFilter;

      return matchesSearch && matchesCategory && matchesModality && matchesLevel;
    });
  }, [courses, searchTerm, categoryFilter, modalityFilter, levelFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" || categoryFilter !== "all" || modalityFilter !== "all" || levelFilter !== "all";

  // Función para obtener la ruta correcta según si el curso está comprado
  const getCourseLink = (courseId: string) => {
    return purchasedCourseIds.includes(courseId)
      ? `/dashboard/my-courses/${courseId}`
      : `/dashboard/explore/${courseId}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Explorar cursos"
        description="Descubre nuevos cursos y expande tus conocimientos en Cursumi."
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              label="Buscar curso"
              placeholder="Buscar por título, descripción o instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid w-full gap-4 md:w-auto md:grid-cols-3">
            <Select
              label="Categoría"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
            <Select
              label="Modalidad"
              options={modalityOptions}
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
            />
            <Select
              label="Nivel"
              options={levelOptions}
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full md:w-auto"
              disabled={!hasActiveFilters}
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setModalityFilter("all");
                setLevelFilter("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando cursos..." : `Mostrando ${filteredCourses.length} ${filteredCourses.length === 1 ? "curso" : "cursos"}`}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {!loading && filteredCourses.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-muted-foreground">
              No hay cursos publicados aún.
            </div>
          )}
          {filteredCourses.map((course) => {
            const isPurchased = purchasedCourseIds.includes(course.id);
            return (
            <Link key={course.id} href={getCourseLink(course.id)} className="block h-full">
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
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                      {course.modality}
                    </span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                      {course.category}
                    </span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                      {course.level}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs">Por {course.instructorName}</span>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between px-4 pb-4 pt-0">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      {formatPriceMXN(course.price || 0)}
                    </span>
                  </div>
                  <Button size="sm" className="pointer-events-none">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {isPurchased ? "Ver curso" : "Ver detalles"}
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
