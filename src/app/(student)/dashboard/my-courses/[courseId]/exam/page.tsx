import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ExamPageClient } from "@/components/student/exam-page-client";
import type { CourseFinalExam } from "@/components/instructor/course-types";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: session.user.id } },
    include: {
      examSubmission: true,
      course: { select: { title: true, finalExam: true } },
    },
  });

  if (!enrollment) redirect(`/dashboard/my-courses`);

  const finalExam = enrollment.course.finalExam as CourseFinalExam | null;
  if (!finalExam) redirect(`/dashboard/my-courses/${courseId}`);

  return (
    <ExamPageClient
      courseId={courseId}
      courseTitle={enrollment.course.title}
      exam={finalExam}
      existingSubmission={
        enrollment.examSubmission
          ? {
              score: enrollment.examSubmission.score,
              passed: enrollment.examSubmission.passed,
            }
          : null
      }
    />
  );
}
