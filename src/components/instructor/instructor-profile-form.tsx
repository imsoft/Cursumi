"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const instructorProfileSchema = z.object({
  fullName: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  city: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  teachingYears: z.preprocess(
    (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().min(0, "No puede ser negativo").optional(),
  ),
  website: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
  linkedinUrl: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().url("Ingresa una URL válida"), z.literal("")]).optional(),
});

export type InstructorProfileFormValues = z.infer<typeof instructorProfileSchema>;

interface InstructorProfileFormProps {
  onSaved?: () => void;
}

export const InstructorProfileForm = ({ onSaved }: InstructorProfileFormProps) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<InstructorProfileFormValues>({
    resolver: createZodResolver(instructorProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      city: "",
      headline: "",
      bio: "",
      specialties: "",
      teachingYears: undefined,
      website: "",
      linkedinUrl: "",
      instagramUrl: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/instructor/profile", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No pudimos cargar tu perfil");
        }
        const data = await res.json();
        form.reset({
          fullName: data.fullName || "",
          email: data.email || "",
          city: data.city || "",
          headline: data.headline || "",
          bio: data.bio || "",
          specialties: data.specialties || "",
          teachingYears: data.teachingYears || undefined,
          website: data.website || "",
          linkedinUrl: data.linkedinUrl || "",
          instagramUrl: data.instagramUrl || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar perfil");
      }
    };
    load();
  }, [form]);

  const onSubmit = async (values: InstructorProfileFormValues) => {
    try {
      setError(null);
      setStatusMessage(null);
      const res = await fetch("/api/instructor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No pudimos actualizar el perfil");
      }
      setStatusMessage("Perfil actualizado");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    }
  };

  return (
    <Card className="border border-border bg-card/90 shadow-lg">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-2xl font-bold text-foreground">Información básica</CardTitle>
        <p className="text-sm text-muted-foreground">
          Actualiza tu información para que tus estudiantes te conozcan mejor.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {statusMessage && <p className="text-sm text-green-600">{statusMessage}</p>}
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-8 pt-0">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input label="Nombre completo *" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Input label="Correo electrónico *" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input label="Ciudad / ubicación" {...form.register("city")} />
            </div>
            <div>
              <Input label="Título profesional" {...form.register("headline")} />
            </div>
          </div>
          <div>
            <Textarea label="Biografía *" {...form.register("bio")} />
            {form.formState.errors.bio && (
              <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>
          <Separator />
          <div>
            <Input
              label="Especialidades (separa con comas)"
              {...form.register("specialties")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Años enseñando"
                type="number"
                min="0"
                {...form.register("teachingYears")}
              />
              {form.formState.errors.teachingYears && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.teachingYears.message}
                </p>
              )}
            </div>
            <div>
              <Input label="Sitio web" {...form.register("website")} />
              {form.formState.errors.website && (
                <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
              )}
            </div>
            <div>
              <Input label="LinkedIn" {...form.register("linkedinUrl")} />
              {form.formState.errors.linkedinUrl && (
                <p className="text-xs text-destructive">{form.formState.errors.linkedinUrl.message}</p>
              )}
            </div>
            <div>
              <Input label="Instagram" {...form.register("instagramUrl")} />
              {form.formState.errors.instagramUrl && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.instagramUrl.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto sm:min-w-[120px]">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto sm:min-w-[140px]" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
