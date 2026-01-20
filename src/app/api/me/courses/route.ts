import { NextResponse } from "next/server";
import { listStudentCourses } from "@/lib/course-service";
import { handleApiError, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    const courses = await listStudentCourses(session.user.id);
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}
