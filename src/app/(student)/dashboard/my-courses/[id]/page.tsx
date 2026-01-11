"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, PlayCircle, CheckCircle2, Lock, Clock, Calendar, MapPin, User, BookOpen, FileText, FileQuestion, ChevronRight, ChevronLeft } from "lucide-react";

// Tipos para el curso detallado
type CourseSection = {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
};

type CourseLesson = {
  id: string;
  title: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  duration?: string;
  order: number;
  completed: boolean;
  locked: boolean;
  videoUrl?: string;
  content?: string;
  sectionId: string;
};

type CourseDetail = {
  id: string;
  title: string;
  description: string;
  modality: "virtual" | "presencial";
  instructorName: string;
  category: string;
  progress: number;
  status: "in-progress" | "completed" | "not-started";
  purchaseDate: string;
  startDate: string;
  endDate?: string;
  totalSessions?: number;
  completedSessions?: number;
  nextSession?: string;
  imageUrl?: string;
  price: number;
  city?: string;
  location?: string;
  sections: CourseSection[];
};

// Mock data - En producción esto vendría de una API
const getCourseDetail = (id: string): CourseDetail | null => {
  const courses: Record<string, CourseDetail> = {
    "1": {
      id: "1",
      title: "Introducción a JavaScript",
      description: "Aprende los fundamentos de JavaScript desde cero. Este curso te llevará desde los conceptos básicos hasta la programación orientada a objetos y el manejo del DOM.",
      modality: "virtual",
      instructorName: "Ana López",
      category: "Programación",
      progress: 45,
      status: "in-progress",
      purchaseDate: "15 de octubre, 2024",
      startDate: "20 de octubre, 2024",
      totalSessions: 12,
      completedSessions: 5,
      nextSession: "25 de noviembre · 7:00 PM",
      imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
      price: 1500,
      sections: [
        {
          id: "sec-1",
          title: "Fundamentos de JavaScript",
          description: "Conceptos básicos y sintaxis del lenguaje",
          order: 1,
          lessons: [
            {
              id: "les-1",
              title: "¿Qué es JavaScript?",
              description: "Introducción al lenguaje y su historia",
              type: "video",
              duration: "15 min",
              order: 1,
              completed: true,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-1",
            },
            {
              id: "les-2",
              title: "Variables y tipos de datos",
              description: "Aprende sobre let, const, var y los tipos primitivos",
              type: "video",
              duration: "20 min",
              order: 2,
              completed: true,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-1",
            },
            {
              id: "les-3",
              title: "Operadores y expresiones",
              description: "Operadores aritméticos, lógicos y de comparación",
              type: "video",
              duration: "18 min",
              order: 3,
              completed: true,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-1",
            },
            {
              id: "les-4",
              title: "Ejercicio práctico: Calculadora",
              description: "Pon en práctica lo aprendido creando una calculadora",
              type: "assignment",
              duration: "30 min",
              order: 4,
              completed: false,
              locked: false,
              content: "Crea una calculadora básica que pueda sumar, restar, multiplicar y dividir dos números. Sube tu código en el siguiente campo.",
              sectionId: "sec-1",
            },
          ],
        },
        {
          id: "sec-2",
          title: "Estructuras de control",
          description: "Condicionales, bucles y control de flujo",
          order: 2,
          lessons: [
            {
              id: "les-5",
              title: "If, else y switch",
              description: "Aprende a tomar decisiones en tu código",
              type: "video",
              duration: "22 min",
              order: 1,
              completed: true,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-2",
            },
            {
              id: "les-6",
              title: "Bucles for, while y do-while",
              description: "Repite código de manera eficiente",
              type: "video",
              duration: "25 min",
              order: 2,
              completed: false,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-2",
            },
            {
              id: "les-7",
              title: "Quiz: Estructuras de control",
              description: "Evalúa tu conocimiento",
              type: "quiz",
              duration: "15 min",
              order: 3,
              completed: false,
              locked: false,
              content: "Responde las siguientes preguntas sobre estructuras de control en JavaScript.",
              sectionId: "sec-2",
            },
          ],
        },
        {
          id: "sec-3",
          title: "Funciones y scope",
          description: "Aprende a crear y usar funciones",
          order: 3,
          lessons: [
            {
              id: "les-8",
              title: "Declaración de funciones",
              description: "Function declarations, expressions y arrow functions",
              type: "video",
              duration: "28 min",
              order: 1,
              completed: false,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-3",
            },
            {
              id: "les-9",
              title: "Parámetros y argumentos",
              description: "Cómo pasar datos a las funciones",
              type: "video",
              duration: "20 min",
              order: 2,
              completed: false,
              locked: false,
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sectionId: "sec-3",
            },
          ],
        },
      ],
    },
  };

  return courses[id] || null;
};

const getLessonIcon = (type: CourseLesson["type"]) => {
  switch (type) {
    case "video":
      return PlayCircle;
    case "text":
      return BookOpen;
    case "quiz":
      return FileQuestion;
    case "assignment":
      return FileText;
    default:
      return BookOpen;
  }
};

const getLessonTypeLabel = (type: CourseLesson["type"]) => {
  switch (type) {
    case "video":
      return "Video";
    case "text":
      return "Lectura";
    case "quiz":
      return "Quiz";
    case "assignment":
      return "Tarea";
    default:
      return "Lección";
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const course = getCourseDetail(id);
  const lessonIdFromUrl = searchParams.get("lesson");

  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | undefined>(undefined);

  // Obtener todas las lecciones aplanadas
  const allLessons = useMemo(() => {
    return course?.sections.flatMap((section) => section.lessons) || [];
  }, [course?.sections]);
  
  // Encontrar la lección seleccionada o la primera disponible
  useEffect(() => {
    if (!course) return;
    
    const lessons = course.sections.flatMap((section) => section.lessons);
    if (lessons.length === 0) return;
    
    let lesson: CourseLesson | undefined;
    if (lessonIdFromUrl) {
      lesson = lessons.find((l) => l.id === lessonIdFromUrl);
    }
    // Si no hay lección en URL, mostrar la primera no bloqueada
    if (!lesson) {
      lesson = lessons.find((l) => !l.locked);
    }
    
    // Solo actualizar si la lección realmente cambió
    const newLessonId = lesson?.id;
    const currentLessonId = selectedLesson?.id;
    
    if (newLessonId !== currentLessonId) {
      setSelectedLesson(lesson);
    }
  }, [lessonIdFromUrl, id, course?.id]);

  if (!course) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Curso no encontrado</h1>
        <p className="text-muted-foreground mb-4">El curso que buscas no existe o no tienes acceso a él.</p>
        <Link href="/dashboard/my-courses">
          <Button>Volver a mis cursos</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const completedLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.filter((lesson) => lesson.completed).length,
    0
  );

  // Encontrar la próxima lección no completada
  const nextLesson = course.sections
    .flatMap((section) => section.lessons)
    .find((lesson) => !lesson.completed && !lesson.locked);

  // Encontrar lección anterior y siguiente
  const currentLessonIndex = selectedLesson 
    ? allLessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLessonInList = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;

  const handleLessonSelect = (lesson: CourseLesson) => {
    if (!lesson.locked) {
      setSelectedLesson(lesson);
      // Actualizar URL sin recargar
      window.history.pushState({}, "", `?lesson=${lesson.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis cursos
          </Button>
        </Link>
      </div>

      {/* Layout de dos columnas: Video/Contenido a la izquierda, Lecciones a la derecha */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Columna izquierda: Video/Contenido de la lección */}
        <div className="space-y-6">
          {selectedLesson ? (
            <Card className="border border-border bg-card/90">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{getLessonTypeLabel(selectedLesson.type)}</Badge>
                      {selectedLesson.duration && (
                        <span className="text-sm text-muted-foreground">{selectedLesson.duration}</span>
                      )}
                      {selectedLesson.completed && (
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completada
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {selectedLesson.title}
                    </CardTitle>
                    {selectedLesson.description && (
                      <p className="text-muted-foreground mt-2">{selectedLesson.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video o contenido según el tipo */}
                {selectedLesson.type === "video" && selectedLesson.videoUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      src={selectedLesson.videoUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedLesson.title}
                    />
                  </div>
                )}

                {selectedLesson.type === "text" && selectedLesson.content && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="rounded-lg border border-border bg-muted/20 p-6">
                      <div className="whitespace-pre-wrap text-foreground">{selectedLesson.content}</div>
                    </div>
                  </div>
                )}

                {selectedLesson.type === "quiz" && (
                  <div className="rounded-lg border border-border bg-muted/20 p-6">
                    <p className="text-foreground mb-4">{selectedLesson.content || "Responde las siguientes preguntas:"}</p>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-border bg-background p-4">
                        <p className="font-medium text-foreground mb-2">Pregunta 1</p>
                        <p className="text-sm text-muted-foreground mb-3">¿Cuál es la sintaxis correcta para declarar una variable en JavaScript?</p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="quiz-1" className="h-4 w-4" />
                            <span className="text-sm">var x = 5;</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="quiz-1" className="h-4 w-4" />
                            <span className="text-sm">variable x = 5;</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="quiz-1" className="h-4 w-4" />
                            <span className="text-sm">x := 5;</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <Button className="mt-4">Enviar respuestas</Button>
                  </div>
                )}

                {selectedLesson.type === "assignment" && (
                  <div className="rounded-lg border border-border bg-muted/20 p-6">
                    <p className="text-foreground mb-4">{selectedLesson.content}</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Sube tu código o archivo
                        </label>
                        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Arrastra y suelta tu archivo aquí
                          </p>
                          <Button variant="outline" size="sm">
                            Seleccionar archivo
                          </Button>
                        </div>
                      </div>
                      <Button>Enviar tarea</Button>
                    </div>
                  </div>
                )}

                {/* Navegación entre lecciones */}
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    {previousLesson && !previousLesson.locked && (
                      <Button
                        variant="outline"
                        onClick={() => handleLessonSelect(previousLesson)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Lección anterior
                      </Button>
                    )}
                  </div>
                  <div>
                    {nextLessonInList && !nextLessonInList.locked && (
                      <Button
                        onClick={() => handleLessonSelect(nextLessonInList)}
                      >
                        Siguiente lección
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border bg-card/90">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <PlayCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Selecciona una lección
                </h3>
                <p className="text-muted-foreground">
                  Elige una lección del menú lateral para comenzar
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: Lista de lecciones */}
        <div className="space-y-4">
          <Card className="border border-border bg-card/90 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Contenido del curso</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.sections.length} secciones · {totalLessons} lecciones
              </p>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                {course.sections.map((section, sectionIndex) => {
                  const sectionCompletedLessons = section.lessons.filter((l) => l.completed).length;
                  
                  return (
                    <div key={section.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">
                          {sectionIndex + 1}. {section.title}
                        </h4>
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                          {sectionCompletedLessons}/{section.lessons.length}
                        </span>
                      </div>
                      <div className="space-y-1 pl-2 border-l-2 border-border">
                        {section.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((lesson) => {
                            const Icon = getLessonIcon(lesson.type);
                            const isSelected = selectedLesson?.id === lesson.id;
                            const isNextLesson = nextLesson?.id === lesson.id;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => handleLessonSelect(lesson)}
                                disabled={lesson.locked}
                                className={`w-full text-left p-2 rounded-lg border transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 border-primary/30"
                                    : lesson.completed
                                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30"
                                    : lesson.locked
                                    ? "bg-muted/30 border-border opacity-60 cursor-not-allowed"
                                    : isNextLesson
                                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                    : "bg-background border-border hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0">
                                    {lesson.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : lesson.locked ? (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Icon className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {lesson.title}
                                    </p>
                                    {lesson.duration && (
                                      <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información principal del curso - Movida al final */}
      <Card className="border border-border bg-card/90 overflow-hidden">
        {course.imageUrl && (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader className="px-6 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline">{course.modality}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                {course.status === "completed" && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completado
                  </span>
                )}
                {course.status === "in-progress" && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-orange-600 hover:bg-orange-700 text-white">
                    <Clock className="mr-1 h-3 w-3" />
                    En progreso
                  </span>
                )}
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                {course.title}
              </CardTitle>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Por {course.instructorName}</span>
                </div>
                {course.modality === "presencial" && course.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{course.city}</span>
                  </div>
                )}
                {course.nextSession && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Próxima sesión: {course.nextSession}</span>
                  </div>
                )}
              </div>
            </div>
            {nextLesson && (
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handleLessonSelect(nextLesson)}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continuar curso
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Progreso del curso</span>
                <span className="font-semibold text-foreground">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2.5 rounded-full" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {completedLessons} de {totalLessons} lecciones completadas
                </span>
                {course.completedSessions && course.totalSessions && (
                  <span>
                    {course.completedSessions} de {course.totalSessions} sesiones completadas
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 pt-2">
              {course.startDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de inicio</p>
                  <p className="text-sm font-medium text-foreground">{course.startDate}</p>
                </div>
              )}
              {course.purchaseDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de compra</p>
                  <p className="text-sm font-medium text-foreground">{course.purchaseDate}</p>
                </div>
              )}
              {course.endDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de finalización</p>
                  <p className="text-sm font-medium text-foreground">{course.endDate}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

