import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listMyCourses } from "@/app/actions/course-actions";
import { MyCoursesClient } from "@/components/student/my-courses-client";

export default async function MyCoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const courses = await listMyCourses();

  return <MyCoursesClient courses={courses} />;
}
