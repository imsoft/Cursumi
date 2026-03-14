import { NextRequest, NextResponse } from "next/server";
import { listPublishedCourses } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") ?? "1");
    const result = await listPublishedCourses({
      search: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      modality: searchParams.get("modality") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      instructor: searchParams.get("instructor") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      minPrice: minPriceRaw ? parseInt(minPriceRaw) : undefined,
      maxPrice: maxPriceRaw ? parseInt(maxPriceRaw) : undefined,
    }, page);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
