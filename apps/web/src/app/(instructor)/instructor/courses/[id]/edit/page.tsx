import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseOverviewClient } from "@/components/instructor/course-overview-client";
import { getCourseDetailForEditPage } from "@/lib/get-instructor-course-for-edit";
import { serializeInstructorCourseForOverview } from "@/lib/serialize-instructor-course-overview";
import { getPlanningExpedientStatus } from "@/lib/planning/completion";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourseDetailForEditPage(id);

  if (!course) {
    return (
      <div className="space-y-6">
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

  // Objeto plano serializable (sin Date/BigInt) — el spread ...course rompía tras router.refresh()
  const serializedCourse = serializeInstructorCourseForOverview(course);

  const isPlanningModality = course.modality === "evento" || course.modality === "virtual";
  const planning = isPlanningModality
    ? await getPlanningExpedientStatus(course.id, course.modality as "evento" | "virtual").catch(() => ({
        total: 0,
        completed: 0,
        isComplete: true,
        missing: [],
      }))
    : { total: 0, completed: 0, isComplete: true, missing: [] };

  return <CourseOverviewClient course={serializedCourse} planning={planning} />;
}
