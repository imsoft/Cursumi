import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart, ArrowRight, Clock, MapPin } from "lucide-react";
import { getCachedSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { ModalityOverlayBadge } from "@/components/ui/modality-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import { stripHtml } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mis guardados | Cursumi",
  robots: { index: false, follow: false },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80";

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
          city: true,
          state: true,
          duration: true,
          imageUrl: true,
          instructor: { select: { name: true } },
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
          action={{ label: "Explorar cursos", href: "/dashboard/explore" }}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ course }) => {
            const borderClass =
              course.modality === "presencial"
                ? "border-l-emerald-500"
                : course.modality === "live"
                  ? "border-l-violet-500"
                  : "border-l-blue-500";
            const city = formatMexicoLocation(course.city, course.state) || "Online";
            const imageUrl = course.imageUrl || FALLBACK_IMAGE;
            const href = `/dashboard/explore/${course.slug || course.id}`;

            return (
              <div key={course.id} className="group relative">
                {/* WishlistButton overlay — sibling of the Link so no nesting */}
                <div className="absolute top-3 right-3 z-10">
                  <WishlistButton courseId={course.id} isLoggedIn={true} size="sm" />
                </div>

                <Link
                  href={href}
                  className={`flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 border-l-4 ${borderClass}`}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3">
                      <ModalityOverlayBadge modality={course.modality} />
                    </span>
                    <span className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
                      {course.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    {city && city !== "Online" && (
                      <div className="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {city}
                      </div>
                    )}
                    <h3 className="text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {stripHtml(course.description)}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      {course.duration ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-1 text-xs font-bold text-primary">
                        Ver detalles
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
