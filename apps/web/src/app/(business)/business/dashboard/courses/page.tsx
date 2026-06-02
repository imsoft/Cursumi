"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, BookOpenCheck, Trash2, Users, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface OrgCourse {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  modality: string;
  orgMetrics: { enrolled: number; avgProgress: number; completed: number };
}

interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  modality: string;
  level: string | null;
  visibility: string;
}

export default function BusinessCoursesPage() {
  const [orgCourses, setOrgCourses] = useState<OrgCourse[]>([]);
  const [catalog, setCatalog] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/business/courses")
      .then((r) => r.json())
      .then((d) => setOrgCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  async function searchCatalog() {
    setSearching(true);
    try {
      const res = await fetch(`/api/business/catalog?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCatalog(data.courses || []);
    } finally {
      setSearching(false);
    }
  }

  async function addCourse(courseId: string) {
    setAdding(courseId);
    try {
      const res = await fetch("/api/business/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setCatalog((prev) => prev.filter((c) => c.id !== courseId));
        // Refresh org courses
        const d = await fetch("/api/business/courses").then((r) => r.json());
        setOrgCourses(d.courses || []);
      }
    } finally {
      setAdding(null);
    }
  }

  async function removeCourse(courseId: string) {
    if (!confirm("¿Remover este curso de tu organización?")) return;
    const res = await fetch(`/api/business/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) setOrgCourses((prev) => prev.filter((c) => c.id !== courseId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cursos" description="Administra los cursos de tu organización" />

      <div>
        <Button
          onClick={() => {
            setShowCatalog(!showCatalog);
            if (!showCatalog) searchCatalog();
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar curso
        </Button>
      </div>

      {/* Course catalog browser */}
      {showCatalog && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catálogo de cursos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchCatalog();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="outline" disabled={searching} className="gap-2">
                <Search className="h-4 w-4" />
                {searching ? "Buscando..." : "Buscar"}
              </Button>
            </form>

            {catalog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searching ? "Buscando..." : "No se encontraron cursos nuevos para agregar."}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {catalog.map((course) => (
                  <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{course.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{course.category}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.modality === "virtual"
                            ? "Virtual"
                            : course.modality === "live"
                              ? "En vivo"
                              : "Presencial"}
                        </Badge>
                        {course.visibility === "business_only" && (
                          <Badge className="text-xs bg-primary/10 text-primary">Exclusivo Business</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addCourse(course.id)}
                      disabled={adding === course.id}
                    >
                      {adding === course.id ? "Agregando..." : "Agregar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Active courses */}
      <h3 className="text-lg font-bold">Cursos activos ({orgCourses.length})</h3>
      {orgCourses.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No tienes cursos aún"
          description="Agrega cursos del catálogo para empezar"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orgCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCourse(course.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.orgMetrics.enrolled} inscritos
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    {course.orgMetrics.avgProgress}% promedio
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenCheck className="h-4 w-4" />
                    {course.orgMetrics.completed} completados
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
