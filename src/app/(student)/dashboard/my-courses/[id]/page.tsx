import { redirect } from "next/navigation";
import { getMyCourseDetail } from "@/app/actions/course-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, PlayCircle } from "lucide-react";

type SectionWithLessons = {
  id: string;
  title: string;
  description: string | null;
  lessons: {
    id: string;
    title: string;
    duration: string | null;
  }[];
};

export default async function MyCourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getMyCourseDetail(params.id);
  if (!detail) {
    redirect("/dashboard/my-courses");
  }

  const { course, progress } = detail;
  const sections = course.sections as SectionWithLessons[];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="underline">Mis cursos</span>
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
                <span>Inicio: {course.startDate.toISOString()}</span>
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
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                El curso aún no tiene secciones publicadas.
              </p>
            ) : (
              <div className="space-y-3">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="rounded-lg border border-border bg-muted/20 p-4">
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
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
                        >
                          <PlayCircle className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{lesson.title}</p>
                            {lesson.duration && (
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button>
              Continuar curso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
