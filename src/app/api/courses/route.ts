import { NextResponse } from "next/server";
import { listPublishedCourses } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const courses = await listPublishedCourses();
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}
