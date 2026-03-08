import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { listInstructorCourses } from "@/app/actions/course-actions";
import { InstructorDashboardClient } from "@/components/instructor/instructor-dashboard-client";

export default async function InstructorDashboardPage() {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const courses = await listInstructorCourses();

  return (
    <InstructorDashboardClient
      name={session.user.name || "Instructor"}
      courses={courses}
    />
  );
}
