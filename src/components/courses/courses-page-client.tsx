"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiltersBar } from "@/components/courses/filters-bar";
import { CoursesPageHeader } from "@/components/courses/courses-page-header";
import { CoursesGrid } from "@/components/courses/courses-grid";
import { Course } from "@/components/courses/types";
import { Button } from "@/components/ui/button";

interface CoursesPageClientProps {
  initialCourses: Course[];
}

const defaultFilters = {
  searchText: "",
  modality: "all",
  category: "all",
  city: "all",
  order: "recientes",
};

const pageSize = 9;

export function CoursesPageClient({ initialCourses }: CoursesPageClientProps) {
  const [searchText, setSearchText] = useState(defaultFilters.searchText);
  const [modality, setModality] = useState(defaultFilters.modality);
  const [category, setCategory] = useState(defaultFilters.category);
  const [city, setCity] = useState(defaultFilters.city);
  const [order, setOrder] = useState(defaultFilters.order);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    let result = initialCourses;

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

    if (order === "populares") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (order === "calificados") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [initialCourses, searchText, modality, category, city, order]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <CoursesPageHeader />
        <div className="space-y-6 pb-16 pt-6">
          <FiltersBar
            searchText={searchText}
            modality={modality}
            category={category}
            city={city}
            order={order}
            totalResults={filteredCourses.length}
            hasFiltersApplied={hasFiltersApplied}
            onSearchChange={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            onModalityChange={(value) => {
              setModality(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setCategory(value);
              setCurrentPage(1);
            }}
            onCityChange={(value) => {
              setCity(value);
              setCurrentPage(1);
            }}
            onOrderChange={setOrder}
            onClear={handleClearFilters}
          />
          <CoursesGrid
            courses={paginatedCourses}
            hasFiltersApplied={hasFiltersApplied}
            onClearFilters={handleClearFilters}
          />

          {/* Pagination — only show when more than 1 page */}
          {totalPages > 1 && (
            <section className="mx-auto max-w-6xl px-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                <p className="text-xs text-muted-foreground">
                  Página{" "}
                  <span className="font-semibold text-foreground">
                    {safePage}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">
                    {totalPages}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="gap-1"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
