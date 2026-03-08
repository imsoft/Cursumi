import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { listMyCourses, listRecommendationsForUser } from "@/app/actions/course-actions";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";
import { prisma } from "@/lib/prisma";
import { parseDurationToMinutes } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const [courses, recommendations, completedLessons] = await Promise.all([
    listMyCourses(),
    listRecommendationsForUser(),
    prisma.lessonProgress.findMany({
      where: { enrollment: { studentId: session.user.id } },
      include: { lesson: { select: { duration: true } } },
    }),
  ]);

  const totalMinutes = completedLessons.reduce(
    (acc, lp) => acc + parseDurationToMinutes(lp.lesson.duration),
    0
  );
  const hoursWatched = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : totalMinutes > 0
    ? `${totalMinutes}m`
    : "0h";

  return (
    <StudentDashboardClient
      name={session.user.name || "Usuario"}
      courses={courses}
      recommendations={recommendations}
      hoursWatched={hoursWatched}
    />
  );
}
