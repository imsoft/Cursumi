import { notFound, redirect } from "next/navigation";
import { getLessonForEdit } from "@/app/actions/course-actions";
import { LessonPageClient } from "@/components/instructor/lesson-page-client";

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonEditPage({ params }: Props) {
  const { id: courseId, lessonId } = await params;
  const lesson = await getLessonForEdit(courseId, lessonId).catch(() => null);

  if (!lesson) notFound();

  return <LessonPageClient courseId={courseId} lesson={lesson} />;
}
