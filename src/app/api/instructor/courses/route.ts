import { NextRequest, NextResponse } from "next/server";
import { getInstructorCourses, createCourse } from "@/lib/course-service";
import { handleApiError, requireRole, requireSession } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const courses = await getInstructorCourses(session.user.id);
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await requireRole(session.user.id, ["instructor", "admin"]);
    const data = await req.json();
    const status = data.isDraft ? "draft" : "published";
    const course = await createCourse(session.user.id, { ...data, status });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
