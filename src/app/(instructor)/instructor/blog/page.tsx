import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Cursumi Instructor",
  robots: { index: false, follow: false },
};

async function getPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      tags: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export default async function InstructorBlogPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Artículos, guías y recursos para crecer en tu carrera y formación."
      />

      {posts.length === 0 ? (
        <EmptyState
          title="Próximamente"
          description="Pronto publicaremos el primer artículo. ¡Vuelve más tarde!"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-44 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <CardContent className="flex flex-col gap-3 p-4">
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <h2 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  )}
                  <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                    {post.author.name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
