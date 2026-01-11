"use client";

import { useState, useMemo } from "react";
import { formatPriceMXN } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpenCheck, Search } from "lucide-react";

type CourseStatus = "published" | "draft" | "archived" | "pending";
type Modality = "virtual" | "presencial";

interface AdminCourse {
  id: string;
  title: string;
  instructorName: string;
  category: string;
  modality: Modality;
  status: CourseStatus;
  studentsCount: number;
  price: number;
  createdAt: string;
}

const mockCourses: AdminCourse[] = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    instructorName: "Ana López",
    category: "Programación",
    modality: "virtual",
    status: "published",
    studentsCount: 45,
    price: 299,
    createdAt: "15 de octubre, 2024",
  },
  {
    id: "2",
    title: "Diseño UX práctico",
    instructorName: "Natalia Soto",
    category: "Diseño",
    modality: "presencial",
    status: "published",
    studentsCount: 32,
    price: 499,
    createdAt: "10 de octubre, 2024",
  },
  {
    id: "3",
    title: "Marketing digital avanzado",
    instructorName: "Luis Herrera",
    category: "Marketing",
    modality: "virtual",
    status: "pending",
    studentsCount: 0,
    price: 399,
    createdAt: "5 de noviembre, 2024",
  },
  {
    id: "4",
    title: "Bootcamp Full Stack",
    instructorName: "Carlos Méndez",
    category: "Programación",
    modality: "presencial",
    status: "draft",
    studentsCount: 0,
    price: 1299,
    createdAt: "1 de noviembre, 2024",
  },
  {
    id: "5",
    title: "Fotografía profesional",
    instructorName: "María González",
    category: "Diseño",
    modality: "presencial",
    status: "published",
    studentsCount: 28,
    price: 599,
    createdAt: "20 de septiembre, 2024",
  },
];

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
  { value: "pending", label: "Pendientes" },
  { value: "archived", label: "Archivados" },
];

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

const getStatusBadge = (status: CourseStatus) => {
  const config: Record<CourseStatus, { label: string; variant: "default" | "outline" }> = {
    published: { label: "Publicado", variant: "default" },
    draft: { label: "Borrador", variant: "outline" },
    pending: { label: "Pendiente", variant: "outline" },
    archived: { label: "Archivado", variant: "outline" },
  };
  return config[status];
};

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  const filteredCourses = useMemo(() => {
    return mockCourses
      .filter((course) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.instructorName.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower)
        );
      })
      .filter((course) => {
        if (statusFilter === "all") return true;
        return course.status === statusFilter;
      })
      .filter((course) => {
        if (modalityFilter === "all") return true;
        return course.modality === modalityFilter;
      });
  }, [searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all" || modalityFilter !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Cursos"
        description="Administra y revisa todos los cursos de la plataforma"
      />

      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <Input
                label="Buscar curso"
                placeholder="Buscar por título, instructor o categoría..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
              <Select
                label="Estado"
                options={statusOptions}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              />
              <Select
                label="Modalidad"
                options={modalityOptions}
                value={modalityFilter}
                onChange={(event) => setModalityFilter(event.target.value)}
              />
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={!hasActiveFilters}
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No se encontraron cursos"
          description="Intenta ajustar los filtros de búsqueda."
          icon={BookOpenCheck}
          secondaryAction={
            hasActiveFilters
              ? {
                  label: "Limpiar filtros",
                  onClick: handleClearFilters,
                  variant: "outline",
                }
              : undefined
          }
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
                return (
                  <div
                    key={course.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        <Badge variant="outline">{course.modality}</Badge>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                      <Button variant="outline" size="sm">
                        {course.status === "pending" ? "Revisar" : "Editar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

