import { InstructorCoursesClient } from "@/components/instructor/instructor-courses-client";
import { listInstructorCourses } from "@/app/actions/course-actions";

export default async function InstructorCoursesPage() {
  const courses = await listInstructorCourses();
  const normalized = courses.map((course) => ({
    ...course,
    nextSession: course.nextSession || undefined,
  }));
  return <InstructorCoursesClient initialCourses={normalized} />;
}
