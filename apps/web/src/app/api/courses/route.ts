import { NextRequest, NextResponse } from "next/server";
import { listPublishedCourses } from "@/lib/course-service";
import { handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const pageRaw = parseInt(searchParams.get("page") ?? "1");
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 1000) : 1;
    const minPrice = minPriceRaw ? parseInt(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? parseInt(maxPriceRaw) : undefined;
    const result = await listPublishedCourses({
      search: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      modality: searchParams.get("modality") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      instructor: searchParams.get("instructor") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    }, page);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
