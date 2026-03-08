import { NextRequest, NextResponse } from "next/server";
import { listPublishedCourses } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const courses = await listPublishedCourses({
      search: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      modality: searchParams.get("modality") ?? undefined,
      level: searchParams.get("level") ?? undefined,
    });
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError(error);
  }
}
