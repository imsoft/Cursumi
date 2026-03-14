import { listPublishedCourses } from "@/lib/course-service";
import { prisma } from "@/lib/prisma";
import { getCachedSession } from "@/lib/session";
import { ExploreClient } from "@/components/student/explore-client";

interface SearchParams {
  q?: string;
  category?: string;
  modality?: string;
  level?: string;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

export default async function ExploreCoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const session = await getCachedSession();
  const page = filters.page ? parseInt(filters.page) : 1;

  const [{ courses, total, hasMore }, categories, enrollments] = await Promise.all([
    listPublishedCourses({
      search: filters.q,
      category: filters.category,
      modality: filters.modality,
      level: filters.level,
      sortBy: filters.sortBy,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    }, page),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    session
      ? prisma.enrollment.findMany({
          where: { studentId: session.user.id },
          select: { courseId: true },
        })
      : [],
  ]);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  return (
    <ExploreClient
      courses={courses}
      total={total}
      hasMore={hasMore}
      currentPage={page}
      categories={categories}
      enrolledCourseIds={Array.from(enrolledCourseIds)}
      initialFilters={{
        q: filters.q ?? "",
        category: filters.category ?? "all",
        modality: filters.modality ?? "all",
        level: filters.level ?? "all",
        sortBy: filters.sortBy ?? "newest",
      }}
    />
  );
}
