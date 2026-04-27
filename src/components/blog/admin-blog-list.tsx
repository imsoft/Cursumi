"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Eye, EyeOff, FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  tags: string[];
  createdAt: string;
  author: { name: string | null };
}

export function AdminBlogList() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar posts");
      setPosts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("No se pudo eliminar el post.");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setToggling(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
      );
    } catch {
      alert("No se pudo actualizar el estado del post.");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Blog" description="Gestiona los artículos del blog de Cursumi." />
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo artículo
          </Link>
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && posts.length === 0 && (
        <EmptyState
          title="Sin artículos"
          description="Aún no has publicado ningún artículo."
          icon={FileText}
          action={{ label: "Crear artículo", href: "/admin/blog/new" }}
        />
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="flex items-center gap-4 py-4">
              {post.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-16 w-24 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{post.title}</h3>
                  <Badge variant={post.published ? "default" : "outline"} className="shrink-0">
                    {post.published ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  /blog/{post.slug} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  title={post.published ? "Despublicar" : "Publicar"}
                  disabled={toggling === post.id}
                  onClick={() => handleTogglePublish(post)}
                >
                  {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar"
                  onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Eliminar"
                  disabled={deleting === post.id}
                  onClick={() => handleDelete(post.id, post.title)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
