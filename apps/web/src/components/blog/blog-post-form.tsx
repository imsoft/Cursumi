"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";

const schema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(200),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  excerpt: z.string().max(500, "Máximo 500 caracteres").optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  coverImageUrl: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface BlogPostFormProps {
  initialValues?: Partial<FormValues>;
  postId?: string;
  mode: "create" | "edit";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function BlogPostForm({ initialValues, postId, mode }: BlogPostFormProps) {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, uploading } = useImageUpload({
    endpoint: "/api/upload/blog-cover",
    onSuccess: (url) => {
      form.setValue("coverImageUrl", url, { shouldDirty: true });
      setUploadError(null);
    },
    onError: (msg) => setUploadError(msg),
  });

  const form = useForm<FormValues>({
    resolver: createZodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      tags: [],
      published: false,
      ...initialValues,
    },
  });

  const title = form.watch("title");
  const tags = form.watch("tags");
  const slugTouched = form.getFieldState("slug").isDirty;

  useEffect(() => {
    if (!slugTouched && mode === "create" && title) {
      form.setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, slugTouched, mode, form]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      form.setValue("tags", [...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    form.setValue("tags", tags.filter((t) => t !== tag));
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${postId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, coverImageUrl: values.coverImageUrl || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al guardar");
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...form.register("title")} placeholder="Título del artículo" />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  placeholder="mi-primer-articulo"
                  className="font-mono text-sm"
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Extracto (opcional)</Label>
                <Textarea
                  id="excerpt"
                  {...form.register("excerpt")}
                  placeholder="Breve descripción del artículo para SEO y listados…"
                  rows={3}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-xs text-destructive">{form.formState.errors.excerpt.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Contenido</Label>
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Escribe el contenido del artículo…"
                      minHeight="320px"
                    />
                  )}
                />
                {form.formState.errors.content && (
                  <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicar</Label>
                <Controller
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <Switch
                      id="published"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {form.watch("published")
                  ? "El artículo será visible en el blog público."
                  : "Guardado como borrador — no visible públicamente."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagen de portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
              {form.watch("coverImageUrl") ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.watch("coverImageUrl")}
                    alt="Portada"
                    className="h-40 w-full rounded-md object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-md bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      Cambiar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => form.setValue("coverImageUrl", "", { shouldDirty: true })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Subiendo imagen…
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      Subir imagen de portada
                      <span className="text-xs">PNG, JPG, WebP · máx. 10 MB</span>
                    </>
                  )}
                </button>
              )}
              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="educación, tips…"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  +
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : mode === "create" ? "Crear artículo" : "Guardar cambios"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
