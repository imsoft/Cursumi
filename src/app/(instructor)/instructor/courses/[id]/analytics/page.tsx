import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { AnalyticsDashboard } from "@/components/instructor/analytics-dashboard";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseDetailForUser(id).catch(() => null);

  if (!course) {
    return (
      <div className="p-8 text-center text-muted-foreground">Curso no encontrado.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
      </div>

      <AnalyticsDashboard courseId={id} totalEnrolled={course._count.enrollments} />
    </div>
  );
}
