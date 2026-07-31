import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { getLessonForStudent } from "@/lib/course-service";
import { LessonViewerClient } from "@/components/lesson-viewer/lesson-viewer-client";
import { createMuxPlaybackToken } from "@/lib/mux-token";
import { getMuxPlaybackId } from "@/lib/video-url";

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
    sidebarSections,
    currentSectionGateActivities,
    sectionGateCompletion,
    isLastLessonInSection,
    nextLessonSectionId,
    currentSectionId,
    hasFinalExam,
    savedQuizScore,
    savedQuizAnswers,
    savedQuizResult,
  } = data;

  // Token de reproducción firmado. Se emite AQUÍ porque llegar a este punto ya
  // significa que getLessonForStudent validó la inscripción. Vale null si el
  // video no es de Mux o si todavía no hay llaves de firma configuradas, y en
  // ese caso el reproductor se comporta como siempre.
  const muxPlaybackId = lesson.videoUrl ? getMuxPlaybackId(lesson.videoUrl) : null;
  const muxPlaybackToken = muxPlaybackId ? createMuxPlaybackToken(muxPlaybackId) : null;

  return (
    <LessonViewerClient
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description ?? null,
        type: lesson.type,
        content: lesson.content ?? null,
        videoUrl: lesson.videoUrl ?? null,
        duration: lesson.duration ?? null,
        attachments: Array.isArray(lesson.attachments)
          ? (lesson.attachments as {
              id: string;
              name: string;
              type: string;
              url: string;
              size?: number;
            }[])
          : null,
        resources: Array.isArray(lesson.resources)
          ? (lesson.resources as { id: string; title: string; url: string; type: string }[])
          : null,
      }}
      courseId={courseId}
      muxPlaybackToken={muxPlaybackToken}
      sections={sidebarSections.map((s) => ({
        id: s.id,
        title: s.title,
        gateTotal: s.gateTotal,
        gatesPassed: s.gatesPassed,
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
      currentSectionGateActivities={currentSectionGateActivities}
      sectionGateCompletion={sectionGateCompletion}
      isLastLessonInSection={isLastLessonInSection}
      nextLessonSectionId={nextLessonSectionId}
      currentSectionId={currentSectionId}
      hasFinalExam={hasFinalExam}
      savedQuizScore={savedQuizScore}
      savedQuizAnswers={savedQuizAnswers as Record<string, number | number[]> | null}
      savedQuizResult={savedQuizResult}
    />
  );
}
