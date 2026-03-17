import { getCourseExamForEdit } from "@/app/actions/course-actions";
import { ExamPageClient } from "@/components/instructor/exam-page-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExamEditPage({ params }: Props) {
  const { id: courseId } = await params;
  const exam = await getCourseExamForEdit(courseId).catch(() => null);

  return <ExamPageClient courseId={courseId} exam={exam} />;
}
