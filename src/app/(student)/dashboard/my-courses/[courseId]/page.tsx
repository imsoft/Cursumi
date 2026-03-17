import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyCourseDetail } from "@/app/actions/course-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import type { LessonType } from "@/generated/prisma";
import { EnrolledWelcomeBanner } from "@/components/student/enrolled-welcome-banner";

const lessonIcon = (type: LessonType) => {
  switch (type) {
    case "video": return <PlayCircle className="h-4 w-4 text-primary" />;
    case "text": return <FileText className="h-4 w-4 text-primary" />;
    case "quiz": return <HelpCircle className="h-4 w-4 text-primary" />;
    case "assignment": return <ClipboardList className="h-4 w-4 text-primary" />;
  }
};

export default async function MyCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { courseId } = await params;
  const { enrolled } = await searchParams;
  const detail = await getMyCourseDetail(courseId);
  if (!detail) {
    redirect("/dashboard/my-courses");
  }

  const { course, progress, lessonProgress } = detail as typeof detail & {
    lessonProgress?: { lessonId: string }[];
  };

  const completedIds = new Set((lessonProgress ?? []).map((lp: { lessonId: string }) => lp.lessonId));

  // Find first uncompleted lesson for "Continue" button
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0];
  const firstLesson = allLessons[0];

  return (
    <div className="space-y-6">
      {enrolled === "true" && (
        <EnrolledWelcomeBanner courseId={courseId} firstLessonId={firstLesson?.id} />
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/my-courses" className="underline">
          Mis cursos
        </Link>
        <span>/</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      <Card className="border border-border bg-card/90">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.modality}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <CardTitle className="text-3xl">{course.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Instructor: {course.instructor?.name || "Instructor"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progreso</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 rounded-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {course.startDate && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {new Date(course.startDate).toLocaleDateString("es-MX")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="h-4 w-4" />
              <span>Inscritos: {course._count.enrollments}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contenido del curso</h4>
            {course.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                El curso aún no tiene secciones publicadas.
              </p>
            ) : (
              <div className="space-y-3">
                {course.sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {sectionIndex + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{section.title}</p>
                        {section.description && (
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {section.lessons.map((lesson) => {
                        const done = completedIds.has(lesson.id);
                        return (
                          <Link
                            key={lesson.id}
                            href={`/dashboard/my-courses/${courseId}/lessons/${lesson.id}`}
                            className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
                          >
                            {done ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              lessonIcon(lesson.type)
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{lesson.title}</p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                              )}
                            </div>
                            {done && (
                              <span className="text-xs text-green-600">Completada</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {nextLesson && (
            <div className="flex justify-end">
              <Button asChild>
                <Link href={`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`}>
                  {progress === 0 ? "Comenzar curso" : "Continuar curso"}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
