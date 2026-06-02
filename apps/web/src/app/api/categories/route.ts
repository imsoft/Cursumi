import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
