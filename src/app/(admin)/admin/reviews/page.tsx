import { prisma } from "@/lib/prisma";
import { ReviewModerationClient } from "@/components/admin/review-moderation-client";

export const metadata = { title: "Moderación de Reseñas | Admin" };

export default async function AdminReviewsPage() {
  const courses = await prisma.course.findMany({
    where: {
      status: "published",
      reviews: { some: {} },
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return <ReviewModerationClient courses={courses} />;
}
