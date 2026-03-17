"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Plus, Trash2, Video, FileText, FileQuestion,
  BookOpen, ChevronDown, ChevronUp, ClipboardList, Globe, Lock,
  CheckCircle2, AlertCircle, ExternalLink, Pencil,
} from "lucide-react";
import {
  addSection, removeSection, addLesson, removeLesson, publishCourseById, updateCourseBasicInfo,
} from "@/app/actions/course-actions";

type LessonType = "video" | "text" | "quiz" | "assignment";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string | null;
  order: number;
}

interface Section {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level?: string | null;
  modality: string;
  courseType: string;
  price: number;
  imageUrl?: string | null;
  status: string;
  finalExam?: unknown;
  sections: Section[];
  _count: { enrollments: number };
}

interface CourseOverviewClientProps {
  course: Course;
}

const LESSON_TYPE_OPTIONS: { value: LessonType; label: string; icon: React.ReactNode }[] = [
  { value: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
  { value: "text", label: "Texto", icon: <FileText className="h-4 w-4" /> },
  { value: "quiz", label: "Quiz", icon: <FileQuestion className="h-4 w-4" /> },
  { value: "assignment", label: "Tarea", icon: <BookOpen className="h-4 w-4" /> },
];

function lessonIcon(type: LessonType) {
  switch (type) {
    case "video": return <Video className="h-4 w-4 text-muted-foreground" />;
    case "text": return <FileText className="h-4 w-4 text-muted-foreground" />;
    case "quiz": return <FileQuestion className="h-4 w-4 text-muted-foreground" />;
    case "assignment": return <BookOpen className="h-4 w-4 text-muted-foreground" />;
  }
}

function lessonTypeLabel(type: LessonType) {
  return { video: "Video", text: "Texto", quiz: "Quiz", assignment: "Tarea" }[type];
}

export function CourseOverviewClient({ course }: CourseOverviewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(course.sections.map((s) => s.id))
  );
  const [addSectionTitle, setAddSectionTitle] = useState("");
  const [addLessonState, setAddLessonState] = useState<{ sectionId: string; title: string; type: LessonType } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSections(next);
  };

  const handleAddSection = () => {
    if (!addSectionTitle.trim()) return;
    startTransition(async () => {
      await addSection(course.id, addSectionTitle.trim());
      setAddSectionTitle("");
      router.refresh();
    });
  };

  const handleRemoveSection = (sectionId: string) => {
    startTransition(async () => {
      await removeSection(course.id, sectionId);
      router.refresh();
    });
  };

  const handleAddLesson = () => {
    if (!addLessonState?.title.trim()) return;
    startTransition(async () => {
      const result = await addLesson(course.id, addLessonState.sectionId, addLessonState.title.trim(), addLessonState.type);
      setAddLessonState(null);
      router.push(`/instructor/courses/${course.id}/lessons/${result.id}`);
    });
  };

  const handleRemoveLesson = (lessonId: string) => {
    startTransition(async () => {
      await removeLesson(course.id, lessonId);
      router.refresh();
    });
  };

  const handlePublish = () => {
    setPublishError(null);
    startTransition(async () => {
      const result = await publishCourseById(course.id);
      if (result.success) {
        setPublishSuccess(true);
        router.refresh();
      } else {
        setPublishError(result.error || "Error al publicar");
      }
    });
  };

  const isPublished = course.status === "published";
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mis cursos
          </Link>
        </Button>
      </div>

      {/* Course info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <Badge variant={isPublished ? "default" : "outline"}>
                  {isPublished ? "Publicado" : course.status === "archived" ? "Archivado" : "Borrador"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
                <span>{course.category}</span>
                <span>·</span>
                <span>{course.modality}</span>
                <span>·</span>
                <span>${(course.price / 100).toLocaleString()}</span>
                <span>·</span>
                <span>{course._count.enrollments} estudiantes</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/instructor/courses/${course.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sections & Lessons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Contenido del curso</h2>
            <p className="text-sm text-muted-foreground">
              {course.sections.length} secciones · {totalLessons} lecciones
            </p>
          </div>
        </div>

        {/* Add section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Título de la nueva sección..."
                value={addSectionTitle}
                onChange={(e) => setAddSectionTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSection(); } }}
                className="flex-1"
              />
              <Button onClick={handleAddSection} disabled={!addSectionTitle.trim() || isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar sección
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections list */}
        {course.sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              Agrega tu primera sección para empezar a estructurar el curso.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {course.sections.map((section, si) => {
              const isOpen = expandedSections.has(section.id);
              const isAddingLesson = addLessonState?.sectionId === section.id;
              return (
                <Card key={section.id}>
                  {/* Section header */}
                  <CardHeader className="pb-0 pt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-semibold text-foreground">
                          {si + 1}. {section.title}
                        </span>
                        <Badge variant="outline" className="ml-1">{section.lessons.length} lecciones</Badge>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRemoveSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  {isOpen && (
                    <CardContent className="pt-3 space-y-2">
                      {/* Lessons */}
                      {section.lessons.map((lesson, li) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 group"
                        >
                          {lessonIcon(lesson.type)}
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {li + 1}. {lesson.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {lessonTypeLabel(lesson.type)}
                          </Badge>
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/instructor/courses/${course.id}/lessons/${lesson.id}`}>
                              <Pencil className="mr-1 h-3 w-3" />
                              Editar
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleRemoveLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Add lesson inline form */}
                      {isAddingLesson ? (
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                          <p className="text-sm font-semibold text-foreground">Nueva lección</p>
                          <Input
                            placeholder="Título de la lección..."
                            value={addLessonState.title}
                            onChange={(e) => setAddLessonState((prev) => prev ? { ...prev, title: e.target.value } : null)}
                            autoFocus
                          />
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {LESSON_TYPE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAddLessonState((prev) => prev ? { ...prev, type: opt.value } : null)}
                                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                                  addLessonState.type === opt.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:border-primary/30"
                                }`}
                              >
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleAddLesson}
                              disabled={!addLessonState.title.trim() || isPending}
                            >
                              Crear y editar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAddLessonState(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setAddLessonState({ sectionId: section.id, title: "", type: "video" })}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar lección
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Final Exam */}
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Examen final</p>
              <p className="text-sm text-muted-foreground">
                {course.finalExam ? "Configurado" : "Sin configurar — opcional"}
              </p>
            </div>
            {!!course.finalExam && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/instructor/courses/${course.id}/exam`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {course.finalExam ? "Editar examen" : "Configurar examen"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Publish actions */}
      <Card>
        <CardContent className="p-5 space-y-3">
          {publishError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {publishError}
            </div>
          )}
          {publishSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              ¡Curso publicado correctamente!
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {!isPublished && (
              <Button onClick={handlePublish} disabled={isPending} className="gap-2">
                <Globe className="h-4 w-4" />
                Publicar curso
              </Button>
            )}
            {isPublished && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Curso publicado
              </div>
            )}
            <Button variant="outline" asChild>
              <Link href={`/instructor/courses/${course.id}`}>
                <Lock className="mr-2 h-4 w-4" />
                Ver página del curso
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
