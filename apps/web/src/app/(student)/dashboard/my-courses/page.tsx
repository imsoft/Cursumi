import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { listMyCourses } from "@/app/actions/course-actions";
import { MyCoursesClient } from "@/components/student/my-courses-client";

export default async function MyCoursesPage() {
  const session = await getCachedSession();
  if (!session) {
    redirect("/login");
  }

  const courses = await listMyCourses();

  return <MyCoursesClient courses={courses} />;
}
