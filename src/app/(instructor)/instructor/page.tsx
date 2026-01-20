import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listInstructorCourses } from "@/app/actions/course-actions";
import { InstructorDashboardClient } from "@/components/instructor/instructor-dashboard-client";

export default async function InstructorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
