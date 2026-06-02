import { NextRequest, NextResponse } from "next/server";
import { getPublishedCourse } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await context.params;
    const course = await getPublishedCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }
    // SECURITY: Limit public payload to prevent leaking business intelligence 
    // (like enrollments, exact session locations, or internal IDs).
    const publicCourse = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      imageUrl: course.imageUrl,
      modality: course.modality,
      city: course.city,
      price: course.price,
    };

    return NextResponse.json(publicCourse);
  } catch (error) {
    return handleApiError(error);
  }
}
