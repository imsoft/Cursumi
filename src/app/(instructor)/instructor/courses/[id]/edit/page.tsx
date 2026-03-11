"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";
import type { CourseFormData } from "@/components/instructor/course-types";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/instructor/courses/${courseId}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Curso no encontrado");
        }
        const data = await res.json();
        const mapped: CourseFormData = {
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level || "principiante",
          modality: data.modality,
          city: data.city || "",
          location: data.location || "",
          courseType: data.courseType,
          startDate: data.startDate ? data.startDate.slice(0, 10) : "",
          duration: data.duration || "",
          price: data.price || 0,
          maxStudents: data.maxStudents || undefined,
          imageUrl: data.imageUrl || "",
          sections: (data.sections || []).map((section: any, idx: number) => ({
            id: section.id,
            title: section.title,
            description: section.description || "",
            order: section.order || idx + 1,
            lessons: (section.lessons || []).map((lesson: any, lidx: number) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || "",
              type: lesson.type,
              duration: lesson.duration || "",
              order: lesson.order || lidx + 1,
              videoUrl: lesson.videoUrl || "",
              content: lesson.content || "",
              files: Array.isArray(lesson.attachments) ? lesson.attachments : [],
              resources: Array.isArray(lesson.resources) ? lesson.resources : [],
            })),
          })),
        };
        setCourse(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos cargar el curso");
      }
    };
    load();
  }, [courseId]);

  if (error || !course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Curso no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              {error || "El curso que buscas no existe o ha sido eliminado."}
            </p>
            <Button asChild>
              <Link href="/instructor/courses">Volver a mis cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Editar curso</h1>
        <p className="text-muted-foreground">
          Actualiza contenido, secciones y precio de &quot;{course.title}&quot;
        </p>
      </div>

      <CreateCourseWizard initialData={course} />
    </div>
  );
}
