"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count: { courses: number };
}

const createSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  order: z.coerce.number().int().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const form = useForm<CreateValues>({
    resolver: createZodResolver(createSchema),
    defaultValues: { name: "", slug: "", order: undefined },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar categorías");
      setCategories(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (values: CreateValues) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear categoría");
      }
      form.reset({ name: "", slug: "", order: undefined });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const onDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setDeleting(null);
    }
  };

  // Auto-generate slug from name
  const watchName = form.watch("name");
  const autoSlug = watchName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Gestiona las categorías de cursos"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Nueva categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onCreate)} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-36">
              <Input
                label="Nombre"
                placeholder="Programación"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex-1 min-w-36">
              <Input
                label="Slug"
                placeholder={autoSlug || "programacion"}
                {...form.register("slug", { value: form.watch("slug") || autoSlug })}
              />
              {form.formState.errors.slug && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="w-24">
              <Input
                label="Orden"
                type="number"
                placeholder="1"
                {...form.register("order")}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin categorías aún.</p>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      slug: {cat.slug} · orden: {cat.order} · {cat._count.courses} cursos
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(cat.id)}
                    disabled={deleting === cat.id || cat._count.courses > 0}
                    title={cat._count.courses > 0 ? "No se puede eliminar: tiene cursos asociados" : "Eliminar"}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
