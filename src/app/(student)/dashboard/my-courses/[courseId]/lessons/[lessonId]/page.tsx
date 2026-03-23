import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { getLessonForStudent } from "@/lib/course-service";
import { LessonViewerClient } from "@/components/lesson-viewer/lesson-viewer-client";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const session = await getCachedSession();
  if (!session) redirect("/login");

  const data = await getLessonForStudent(lessonId, session.user.id);
  if (!data) redirect(`/dashboard/my-courses/${courseId}`);

  const {
    lesson,
    completedIds,
    prevLesson,
    nextLesson,
    sections,
    sectionQuiz,
    sectionQuizPassed,
    sectionMinigame,
    sectionMinigamePassed,
    isLastLessonInSection,
    passedSectionIds,
    nextLessonSectionId,
    currentSectionId,
    hasFinalExam,
  } = data;

  return (
    <LessonViewerClient
      lesson={{
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content ?? null,
        videoUrl: lesson.videoUrl ?? null,
        duration: lesson.duration ?? null,
        attachments: Array.isArray(lesson.attachments) ? (lesson.attachments as { id: string; name: string; type: string; url: string; size?: number }[]) : null,
        resources: Array.isArray(lesson.resources) ? (lesson.resources as { id: string; title: string; url: string; type: string }[]) : null,
      }}
      courseId={courseId}
      sections={sections.map((s) => ({
        id: s.id,
        title: s.title,
        hasQuiz: !!(s.quiz && (s.quiz as { questions?: unknown[] }).questions?.length),
        quizPassed: passedSectionIds.has(s.id),
        hasMinigame: !!(s.minigame && (s.minigame as { type?: string }).type),
        minigamePassed: passedSectionIds.has(s.id),
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          duration: l.duration ?? null,
          completed: completedIds.has(l.id),
        })),
      }))}
      completedIds={Array.from(completedIds)}
      prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      sectionQuiz={sectionQuiz}
      sectionQuizPassed={sectionQuizPassed}
      sectionMinigame={sectionMinigame}
      sectionMinigamePassed={sectionMinigamePassed}
      isLastLessonInSection={isLastLessonInSection}
      nextLessonSectionId={nextLessonSectionId}
      currentSectionId={currentSectionId}
      hasFinalExam={hasFinalExam}
    />
  );
}
