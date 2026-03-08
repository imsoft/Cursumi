import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { requireRole } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { InstructorChatClient } from "@/components/chat/instructor-chat-client";

export default async function InstructorCourseMessagesPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  await requireRole(session.user.id, ["instructor", "admin"]);

  const course = await prisma.course.findFirst({
    where: { id: params.id, instructorId: session.user.id },
    select: { id: true, title: true },
  });

  if (!course) redirect("/instructor/courses");

  const conversations = await prisma.conversation.findMany({
    where: { courseId: course.id, instructorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      student: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true },
      },
    },
  });

  return (
    <InstructorChatClient
      courseId={course.id}
      courseTitle={course.title}
      conversations={conversations}
      currentUserId={session.user.id}
    />
  );
}
