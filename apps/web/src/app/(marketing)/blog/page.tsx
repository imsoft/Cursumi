import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Newspaper, User } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Cursumi",
  description:
    "Artículos, guías y recursos de educación online, formación presencial y aprendizaje profesional.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog de Cursumi",
    description: "Artículos, guías y recursos de educación online y formación profesional.",
    type: "website",
  },
};

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({
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
  } catch {
    // Sin BD disponible (ej: CI con DATABASE_URL fake) → lista vacía
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Blog de Cursumi</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Artículos, guías y recursos para crecer en tu carrera y formación.
        </p>
      </div>

      {posts.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle>Próximamente</EmptyTitle>
            <EmptyDescription>Pronto publicaremos el primer artículo. ¡Vuelve más tarde!</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className={`grid gap-6 ${posts.length === 1 ? "max-w-lg mx-auto" : posts.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
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

      {posts.length > 0 && posts.length < 6 && (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-10 text-center">
          <Newspaper className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="font-semibold text-foreground">Más artículos en camino</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publicamos guías, tutoriales y recursos de formación regularmente. ¡Vuelve pronto!
          </p>
        </div>
      )}
    </main>
  );
}
