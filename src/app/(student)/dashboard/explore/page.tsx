"use client";

import { useState } from "react";
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
  instructorName: string;
  price: number;
  imageUrl?: string;
  level: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Bootcamp Full Stack",
    description: "Aprende desarrollo web completo desde cero hasta convertirte en un desarrollador full stack",
    category: "Programación",
    modality: "virtual",
    instructorName: "Carlos Méndez",
    price: 2500,
    level: "Intermedio",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  },
  {
    id: "2",
    title: "Habilidades blandas para equipos remotos",
    description: "Desarrolla habilidades de comunicación y colaboración para equipos distribuidos",
    category: "Habilidades blandas",
    modality: "virtual",
    instructorName: "Ana Martínez",
    price: 1200,
    level: "Principiante",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
  },
  {
    id: "3",
    title: "Presentaciones efectivas",
    description: "Domina el arte de presentar ideas de forma clara y persuasiva",
    category: "Marketing",
    modality: "presencial",
    instructorName: "Laura Fernández",
    price: 1800,
    level: "Intermedio",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
  },
  {
    id: "4",
    title: "Python para Data Science",
    description: "Aprende Python y sus librerías para análisis de datos y machine learning",
    category: "Programación",
    modality: "virtual",
    instructorName: "Roberto Silva",
    price: 2000,
    level: "Avanzado",
    imageUrl: "https://images.unsplash.com/photo-1528595077908-5f13e1f1f14a?w=800&h=450&fit=crop",
  },
  {
    id: "5",
    title: "Diseño de interfaces modernas",
    description: "Crea interfaces de usuario atractivas y funcionales con las últimas tendencias",
    category: "Diseño",
    modality: "virtual",
    instructorName: "Natalia Soto",
    price: 1500,
    level: "Intermedio",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
  },
  {
    id: "6",
    title: "Estrategias de marketing digital",
    description: "Aprende a crear campañas efectivas en redes sociales y plataformas digitales",
    category: "Marketing",
    modality: "presencial",
    instructorName: "Luis Herrera",
    price: 2200,
    level: "Intermedio",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  },
];

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

// IDs de cursos comprados (en producción esto vendría de una API o contexto)
// Estos son los IDs de los cursos que el estudiante ya tiene comprados
const purchasedCourseIds = ["1", "2", "3", "4", "5", "6", "7", "8"];

export default function ExploreCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesModality = modalityFilter === "all" || course.modality === modalityFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesModality && matchesLevel;
  });

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
            Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? "curso" : "cursos"}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <span className="text-2xl font-bold text-foreground">{formatPriceMXN(course.price)}</span>
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

