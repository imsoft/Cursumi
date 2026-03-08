import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CourseChatClient } from "@/components/chat/course-chat-client";

export default async function StudentMessagesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    include: { course: { select: { title: true, instructorId: true } } },
  });

  if (!enrollment) redirect(`/dashboard/my-courses`);

  const conversation = await prisma.conversation.findUnique({
    where: {
      courseId_studentId_instructorId: {
        courseId,
        studentId: session.user.id,
        instructorId: enrollment.course.instructorId,
      },
    },
  });

  return (
    <CourseChatClient
      courseId={courseId}
      courseTitle={enrollment.course.title}
      conversationId={conversation?.id ?? null}
      currentUserId={session.user.id}
    />
  );
}
