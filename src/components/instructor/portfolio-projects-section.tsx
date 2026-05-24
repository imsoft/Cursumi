"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExternalLinkIcon,
  BriefcaseIcon,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  tags: string | null;
  category: string | null;
  order: number;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const PROJECT_CATEGORIES = [
  "E-commerce",
  "Landing Page",
  "App Web",
  "App Móvil",
  "Dashboard",
  "Blog / CMS",
  "SaaS",
  "Branding",
  "Otro",
] as const;

const projectSchema = z.object({
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  url: z
    .union([z.string().url("Ingresa una URL válida"), z.literal("")])
    .optional(),
  imageUrl: z
    .union([z.string().url("Ingresa una URL válida de imagen"), z.literal("")])
    .optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: PortfolioProject;
  onEdit: (p: PortfolioProject) => void;
  onDelete: (p: PortfolioProject) => void;
}) {
  const tagList = project.tags
    ? project.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="group relative flex gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">
                {project.title}
              </h3>
              {project.category && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {project.category}
                </Badge>
              )}
            </div>
            {project.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                title="Ver proyecto"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => onEdit(project)}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
              title="Editar"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="rounded p-1 text-muted-foreground hover:text-destructive"
              title="Eliminar"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {tagList.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const form = useForm<ProjectFormValues>({
    resolver: createZodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      imageUrl: "",
      tags: "",
      category: "",
      ...defaultValues,
    },
    mode: "onBlur",
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {/* Título */}
      <div>
        <Input label="Nombre del proyecto *" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <Select
          label="Categoría"
          value={form.watch("category") || ""}
          onChange={(e) => form.setValue("category", e.target.value)}
          options={[
            { value: "", label: "Selecciona una categoría" },
            ...PROJECT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
          ]}
        />
      </div>

      {/* Descripción */}
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-sm font-medium text-foreground">
            Descripción
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {(form.watch("description") ?? "").length}/500
          </span>
        </div>
        <Textarea
          className="mt-1 min-h-[80px]"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* URL del proyecto */}
      <div>
        <Input label="URL del proyecto" {...form.register("url")} />
        <p className="mt-0.5 text-xs text-muted-foreground">
          Enlace al sitio live, repo, demo, etc.
        </p>
        {form.formState.errors.url && (
          <p className="text-xs text-destructive">
            {form.formState.errors.url.message}
          </p>
        )}
      </div>

      {/* URL de imagen */}
      <div>
        <Input
          label="URL de imagen / captura de pantalla"
          {...form.register("imageUrl")}
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pega una URL de imagen (Cloudinary, Imgur, etc.) para mostrar en la
          tarjeta.
        </p>
        {form.formState.errors.imageUrl && (
          <p className="text-xs text-destructive">
            {form.formState.errors.imageUrl.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <Input
          label="Tecnologías / etiquetas (separa con comas)"
          {...form.register("tags")}
        />
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ej: Next.js, Tailwind, Stripe, PostgreSQL
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-[140px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando…" : "Guardar proyecto"}
        </Button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PortfolioProjectsSection() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(
    null
  );
  const [deletingProject, setDeletingProject] =
    useState<PortfolioProject | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/instructor/portfolio", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar el portafolio");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const openEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        const res = await fetch(
          `/api/instructor/portfolio/${editingProject.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Error al actualizar");
        }
      } else {
        const res = await fetch("/api/instructor/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Error al crear");
        }
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      const res = await fetch(
        `/api/instructor/portfolio/${deletingProject.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error al eliminar");
      setDeletingProject(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <>
      <Card className="border border-border bg-card/90 shadow-lg">
        <CardHeader className="px-6 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <BriefcaseIcon className="h-5 w-5 text-primary" />
                Portafolio de proyectos
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Muestra a tus estudiantes proyectos reales que has desarrollado.
              </p>
            </div>
            <Button onClick={openCreate} size="sm" className="shrink-0 gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Agregar proyecto
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
              <BriefcaseIcon className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-foreground">
                  Aún no tienes proyectos
                </p>
                <p className="text-sm text-muted-foreground">
                  Agrega proyectos para que los estudiantes vean tu trabajo.
                </p>
              </div>
              <Button
                onClick={openCreate}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <PlusIcon className="h-4 w-4" />
                Agregar primer proyecto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={openEdit}
                  onDelete={setDeletingProject}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar proyecto" : "Agregar proyecto"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            key={editingProject?.id ?? "new"}
            defaultValues={
              editingProject
                ? {
                    title: editingProject.title,
                    description: editingProject.description ?? "",
                    url: editingProject.url ?? "",
                    imageUrl: editingProject.imageUrl ?? "",
                    tags: editingProject.tags ?? "",
                    category: editingProject.category ?? "",
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deletingProject?.title}</strong> de tu
              portafolio. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
