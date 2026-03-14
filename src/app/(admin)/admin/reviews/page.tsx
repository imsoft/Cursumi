import { prisma } from "@/lib/prisma";
import { ReviewModerationClient } from "@/components/admin/review-moderation-client";

export const metadata = { title: "Moderación de Reseñas | Admin" };

export default async function AdminReviewsPage() {

  const raw = await prisma.review.findMany({
    where: { approved: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      approved: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  const reviews = raw.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return <ReviewModerationClient initialReviews={reviews} />;
}
