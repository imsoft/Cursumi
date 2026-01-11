"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";

// Mock data - en producción vendría de una API
const mockCourseData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Introducción a JavaScript",
    description: "Aprende los fundamentos de JavaScript desde cero.",
    category: "Programación",
    level: "Principiante",
    modality: "virtual",
    city: "",
    location: "",
    courseType: "fechado",
    startDate: "2024-10-20",
    duration: "8 semanas",
    price: 1500,
    maxStudents: 50,
    imageUrl: "",
    sections: [],
  },
  "2": {
    id: "2",
    title: "Copywriting efectivo",
    description: "Domina el arte de escribir textos persuasivos.",
    category: "Marketing",
    level: "Intermedio",
    modality: "virtual",
    city: "",
    location: "",
    courseType: "fechado",
    startDate: "2024-12-01",
    duration: "6 semanas",
    price: 2000,
    maxStudents: 30,
    imageUrl: "",
    sections: [],
  },
};

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const course = mockCourseData[courseId];

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Curso no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              El curso que buscas no existe o ha sido eliminado.
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
          Actualiza la información de tu curso "{course.title}"
        </p>
      </div>

      <CreateCourseWizard />
    </div>
  );
}

