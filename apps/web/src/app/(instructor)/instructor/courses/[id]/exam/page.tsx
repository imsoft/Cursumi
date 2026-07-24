import { getCourseExamForEdit } from "@/app/actions/course-actions";
import { ExamPageClient } from "@/components/instructor/exam-page-client";
import { getCourseLessonOptions } from "@/lib/course-service-instructor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExamEditPage({ params }: Props) {
  const { id: courseId } = await params;
  const [exam, lessons] = await Promise.all([
    getCourseExamForEdit(courseId).catch(() => null),
    getCourseLessonOptions(courseId).catch(() => []),
  ]);

  return <ExamPageClient courseId={courseId} exam={exam} lessons={lessons} />;
}
