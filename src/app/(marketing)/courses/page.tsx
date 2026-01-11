 "use client";

import { useMemo, useState } from "react";

import { FiltersBar } from "@/components/courses/filters-bar";
import { CoursesPageHeader } from "@/components/courses/courses-page-header";
import { CoursesGrid } from "@/components/courses/courses-grid";
import { Course } from "@/components/courses/types";
import { Button } from "@/components/ui/button";

const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Productividad con IA",
    modality: "virtual",
    category: "negocios",
    city: "Online",
    description: "Aprende flujos de trabajo respaldados por IA para proyectos reales.",
    duration: "6 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c2",
    title: "Bootcamp Full Stack",
    modality: "presencial",
    category: "programacion",
    city: "CDMX",
    description: "8 semanas intensivas creando aplicaciones reales con mentorías diarias.",
    duration: "8 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c3",
    title: "Marketing de contenidos 360",
    modality: "virtual",
    category: "marketing",
    city: "Online",
    description: "Planifica campañas con métricas, storytelling y automatización.",
    duration: "5 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c4",
    title: "Diseño de producto centrado en usuario",
    modality: "virtual",
    category: "diseno",
    city: "Online",
    description: "Define experiencias digitales con investigación y prototipos validados.",
    duration: "4 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c5",
    title: "Finanzas para founders",
    modality: "presencial",
    category: "negocios",
    city: "Monterrey",
    description: "Estrategias de pricing, levantamiento y métricas clave para tu startup.",
    duration: "3 sesiones",
    imageUrl:
      "https://images.unsplash.com/photo-1489314173051-235f2cb89e63?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c6",
    title: "Estrategias de UX Research",
    modality: "presencial",
    category: "diseno",
    city: "Guadalajara",
    description: "Taller práctico con usuarios reales y análisis cuantitativo.",
    duration: "3 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c7",
    title: "Planificación Agile para equipos",
    modality: "virtual",
    category: "negocios",
    city: "Online",
    description: "Aplica frameworks ágiles para coordinar equipos híbridos y remotos.",
    duration: "4 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c8",
    title: "Introducción a Python para data",
    modality: "presencial",
    category: "programacion",
    city: "CDMX",
    description: "Laboratorio con datasets reales y guía de mentores senior.",
    duration: "6 clases",
    imageUrl:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c9",
    title: "Branded storytelling para equipos de marketing",
    modality: "virtual",
    category: "marketing",
    city: "Online",
    description: "Construye narrativas consistentes con frameworks de marca.",
    duration: "4 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c10",
    title: "Estrategias de growth para productos digitales",
    modality: "presencial",
    category: "marketing",
    city: "Guadalajara",
    description: "Sesiones prácticas para escalar funnels con datos reales.",
    duration: "5 semanas",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
];

const pageSize = 6;

const defaultFilters = {
  searchText: "",
  modality: "all",
  category: "all",
  city: "all",
  order: "recientes",
};

export default function CoursesPage() {
  const [searchText, setSearchText] = useState(defaultFilters.searchText);
  const [modality, setModality] = useState(defaultFilters.modality);
  const [category, setCategory] = useState(defaultFilters.category);
  const [city, setCity] = useState(defaultFilters.city);
  const [order, setOrder] = useState(defaultFilters.order);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    let result = mockCourses;

    if (searchText.trim()) {
      const term = searchText.trim().toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term),
      );
    }

    if (modality !== "all") {
      result = result.filter((course) => course.modality === modality);
    }

    if (category !== "all") {
      result = result.filter((course) => course.category === category);
    }

    if (city !== "all") {
      result = result.filter((course) => course.city === city);
    }

    // Placeholder ordering: just keep the array as is for now.
    return result;
  }, [searchText, modality, category, city, order]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCourses = filteredCourses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const hasFiltersApplied =
    searchText.trim() !== "" ||
    modality !== defaultFilters.modality ||
    category !== defaultFilters.category ||
    city !== defaultFilters.city;

  const handleClearFilters = () => {
    setSearchText(defaultFilters.searchText);
    setModality(defaultFilters.modality);
    setCategory(defaultFilters.category);
    setCity(defaultFilters.city);
    setOrder(defaultFilters.order);
    setCurrentPage(1);
  };

  const handleModalityChange = (value: string) => {
    setModality(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setCurrentPage(1);
  };

  const handleOrderChange = (value: string) => {
    setOrder(value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-6 pb-16 pt-6">
        <CoursesPageHeader />
        <FiltersBar
          searchText={searchText}
          modality={modality}
          category={category}
          city={city}
          order={order}
          onSearchChange={(value) => {
            setSearchText(value);
            setCurrentPage(1);
          }}
          onModalityChange={handleModalityChange}
          onCategoryChange={handleCategoryChange}
          onCityChange={handleCityChange}
          onOrderChange={handleOrderChange}
          onClear={handleClearFilters}
        />
        <CoursesGrid
          courses={paginatedCourses}
          hasFiltersApplied={hasFiltersApplied}
          onClearFilters={handleClearFilters}
        />
        <section className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Página {safePage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

