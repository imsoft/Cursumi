import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listMyCourses, listRecommendationsForUser } from "@/app/actions/course-actions";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const courses = await listMyCourses();
  const recommendations = await listRecommendationsForUser();

  return (
    <StudentDashboardClient
      name={session.user.name || "Usuario"}
      courses={courses}
      recommendations={recommendations}
    />
  );
}
