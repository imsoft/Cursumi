import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyCourseDetail } from "@/app/actions/course-actions";
import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/session";
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
  MapPin,
  Clock,
  GraduationCap,
  Award,
  Lock,
} from "lucide-react";
import type { LessonType } from "@/generated/prisma";
import { EnrolledWelcomeBanner } from "@/components/student/enrolled-welcome-banner";
import { CourseCoverImage } from "@/components/courses/course-cover-image";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { formatPriceMXN } from "@/lib/utils";
import { formatDateLongMX, formatDateShortMX } from "@/lib/date-format";

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

  const {
    course,
    progress,
    lessonProgress,
    examSubmission,
    sectionQuizSubmissions,
    session: enrolledSession,
  } = detail as typeof detail & {
    lessonProgress?: { lessonId: string }[];
    examSubmission?: { passed: boolean; score: number } | null;
    sectionQuizSubmissions?: { sectionId: string; passed: boolean }[];
  };

  const completedIds = new Set((lessonProgress ?? []).map((lp: { lessonId: string }) => lp.lessonId));
  const passedSectionIds = new Set(
    (sectionQuizSubmissions ?? []).filter((s) => s.passed).map((s) => s.sectionId),
  );

  // Find first uncompleted lesson for "Continue" button
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0];
  const firstLesson = allLessons[0];

  // Final exam logic
  const finalExam = course.finalExam as { questions?: unknown[] } | null;
  const hasFinalExam = !!(finalExam?.questions?.length);
  const allLessonsCompleted = allLessons.length > 0 && allLessons.every((l) => completedIds.has(l.id));

  // Check all section gates are passed
  const allGatesPassed = course.sections.every((s) => {
    const hasQuiz = !!(s.quiz && (s.quiz as { questions?: unknown[] }).questions?.length);
    const hasMinigame = !!(s.minigame && (s.minigame as { type?: string }).type);
    if (!hasQuiz && !hasMinigame) return true;
    return passedSectionIds.has(s.id);
  });

  const canTakeExam = hasFinalExam && allLessonsCompleted && allGatesPassed;
  const examPassed = examSubmission?.passed ?? false;

  // Fetch certificate if exam was submitted
  const session = await getCachedSession();
  const certificate = session
    ? await prisma.certificate.findFirst({
        where: { courseId, userId: session.user.id },
        select: { id: true, type: true },
      })
    : null;

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

      <Card className="overflow-hidden border border-border bg-card/90">
        <CourseCoverImage imageUrl={course.imageUrl} title={course.title} />
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ModalityBadge modality={course.modality} size="md" />
            <Badge variant="outline">{course.category}</Badge>
            {course.level && (
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {course.level}
              </Badge>
            )}
          </div>
          <div>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {course.instructor?.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- URL de proveedor OAuth / variada
                <img
                  src={course.instructor.image}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {(course.instructor?.name || "I").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Instructor</p>
                <p className="font-medium text-foreground">{course.instructor?.name || "Instructor"}</p>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Valor del curso: </span>
              <span className="font-semibold text-foreground">{formatPriceMXN(course.price)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progreso</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 rounded-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {course.duration && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Duración: {course.duration}</span>
              </div>
            )}
            {course.startDate && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Inicio: {formatDateShortMX(new Date(course.startDate))}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>Inscritos en la plataforma: {course._count.enrollments}</span>
            </div>
            {course.modality === "presencial" && (course.city || course.location) && (
              <div className="flex items-start gap-2 text-sm text-foreground sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {[course.city, course.location].filter(Boolean).join(" · ")}
                </span>
              </div>
            )}
          </div>

          {enrolledSession && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">Tu sesión presencial</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {enrolledSession.city} — {enrolledSession.location}
              </p>
              <p className="mt-2 text-sm text-foreground">
                <Calendar className="mr-1 inline h-4 w-4" />
                {formatDateLongMX(new Date(enrolledSession.date))}
                {enrolledSession.startTime && enrolledSession.endTime && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {enrolledSession.startTime} – {enrolledSession.endTime}
                  </span>
                )}
              </p>
            </div>
          )}

          {course.modality === "presencial" &&
            course.courseSessions &&
            course.courseSessions.length > 0 &&
            !enrolledSession && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Sesiones programadas</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {course.courseSessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap gap-x-2 gap-y-1">
                      <span className="font-medium text-foreground">{s.city}</span>
                      <span>·</span>
                      <span>{formatDateShortMX(new Date(s.date))}</span>
                      <span className="text-xs">
                        ({s._count.enrollments}/{s.maxStudents} inscritos)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          {/* Examen final */}
          {hasFinalExam && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Examen final</p>
                  {examPassed ? (
                    <p className="text-sm text-green-600">
                      Aprobado con {examSubmission?.score}% — ¡Felicidades!
                    </p>
                  ) : canTakeExam ? (
                    <p className="text-sm text-muted-foreground">
                      Completaste todas las lecciones y actividades. Ya puedes presentar el examen final.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Completa todas las lecciones, tests y minijuegos de cada sección para desbloquear el examen.
                    </p>
                  )}
                </div>
                {examPassed ? (
                  <Badge variant="default" className="shrink-0 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Aprobado
                  </Badge>
                ) : canTakeExam ? (
                  <Button asChild>
                    <Link href={`/dashboard/my-courses/${courseId}/exam`}>
                      Presentar examen
                    </Link>
                  </Button>
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Certificado */}
          {certificate && (
            <div className="rounded-lg border-2 border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20 p-5">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {certificate.type === "accreditation"
                      ? "Certificado de acreditación"
                      : "Reconocimiento de participación"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {certificate.type === "accreditation"
                      ? "Has aprobado el curso exitosamente. Descarga tu certificado."
                      : "Completaste el curso. Descarga tu reconocimiento de participación."}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/certificates/${certificate.id}`}>
                    Ver certificado
                  </Link>
                </Button>
              </div>
            </div>
          )}

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
