import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/session";
import { getUserRole } from "@/lib/user-service";
import { InstructorAnonymousQuestionsClient } from "@/components/instructor/instructor-anonymous-questions-client";

export const metadata = {
  title: "Preguntas anónimas | Instructor",
};

export default async function InstructorAnonymousQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCachedSession();
  if (!session) notFound();

  const role = await getUserRole(session.user.id);
  const course = await prisma.course.findFirst({
    where: {
      id,
      ...(role === "admin" ? {} : { instructorId: session.user.id }),
    },
    select: {
      title: true,
      modality: true,
      courseSessions: {
        orderBy: { date: "asc" },
        select: {
          id: true,
          city: true,
          location: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  if (!course) notFound();

  if (course.modality !== "presencial") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Las preguntas anónimas solo están disponibles para cursos en modalidad presencial.
        </p>
      </div>
    );
  }

  const sessions = course.courseSessions.map((s) => ({
    ...s,
    date: s.date.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/instructor/courses/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al curso
        </Link>
      </Button>
      <InstructorAnonymousQuestionsClient courseTitle={course.title} sessions={sessions} />
    </div>
  );
}
