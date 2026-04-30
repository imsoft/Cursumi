import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Heart, ArrowRight } from "lucide-react";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { formatPriceMXN } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Mis guardados | Cursumi",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await getCachedSession();
  if (!session) redirect("/login");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          modality: true,
          category: true,
          price: true,
          imageUrl: true,
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
        <h1 className="text-2xl font-black">Mis guardados</h1>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Aún no tienes cursos guardados"
          description="Cuando encuentres un curso que te llame la atención, guárdalo aquí con el ícono de corazón para acceder rápido después."
          action={{ label: "Explorar cursos", href: "/courses" }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ course }) => (
            <div
              key={course.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 transition-shadow hover:shadow-md"
            >
              {course.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <WishlistButton courseId={course.id} isLoggedIn={true} size="sm" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ModalityBadge modality={course.modality} />
                  <span className="text-xs text-muted-foreground">{course.category}</span>
                </div>
                <h2 className="font-semibold text-foreground line-clamp-2 mb-1">{course.title}</h2>
                {course.instructor?.name && (
                  <p className="text-xs text-muted-foreground mb-3">Por {course.instructor.name}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-bold text-foreground">{formatPriceMXN(course.price)}</span>
                  <Link
                    href={`/courses/${course.slug || course.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Ver curso
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
