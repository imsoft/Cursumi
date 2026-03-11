"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/incompatible-library */

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Monitor, MapPin } from "lucide-react";
import { useRef, useMemo, useEffect, useState } from "react";
import type { CourseFormData } from "./course-types";

const createBasicInfoSchema = (modality: "virtual" | "presencial") => {
  const baseSchema = {
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    category: z.string().min(1, "Selecciona una categoría"),
    level: z.string().min(1, "Selecciona un nivel"),
    modality: z.enum(["virtual", "presencial"]),
    imageUrl: z.string().optional(),
  };

  if (modality === "presencial") {
    return z.object({
      ...baseSchema,
      city: z.string().min(1, "La ciudad es obligatoria para cursos presenciales"),
      location: z.string().min(1, "La dirección es obligatoria para cursos presenciales"),
    });
  }

  return z.object({
    ...baseSchema,
    city: z.string().optional(),
    location: z.string().optional(),
  });
};

type BasicInfoFormData = z.infer<ReturnType<typeof createBasicInfoSchema>>;

const fallbackCategoryOptions = [
  { value: "programacion", label: "Programación" },
  { value: "marketing", label: "Marketing" },
  { value: "diseno", label: "Diseño" },
  { value: "negocios", label: "Negocios" },
  { value: "habilidades", label: "Habilidades blandas" },
];

const levelOptions = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const modalityOptions = [
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

interface CourseBasicInfoProps {
  data: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
  onNext: () => void;
}

export const CourseBasicInfo = ({ data, onUpdate, onNext }: CourseBasicInfoProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modality = data.modality || "virtual";
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategoryOptions);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats: { slug: string; name: string }[]) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoryOptions(cats.map((c) => ({ value: c.slug, label: c.name })));
        }
      })
      .catch(() => {/* use fallback */});
  }, []);
  const basicInfoSchema = createBasicInfoSchema(modality);
  
  const form = useForm<BasicInfoFormData>({
    resolver: createZodResolver(basicInfoSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      modality: data.modality,
      city: data.city,
      location: data.location,
      imageUrl: data.imageUrl,
    },
  });

  const modalityValue = form.watch("modality");
  const imageUrl = form.watch("imageUrl");
  const hasImage = useMemo(() => Boolean(imageUrl), [imageUrl]);

  // Actualizar schema cuando cambia la modalidad
  useEffect(() => {
    if (modalityValue !== modality) {
      form.clearErrors();
      if (modalityValue === "virtual") {
        form.setValue("city", "");
        form.setValue("location", "");
      }
    }
  }, [modalityValue, modality, form]);

  const handleSubmit = form.handleSubmit((values) => {
    // Asegurar que los campos de presencial se limpien si es virtual
    const updateData = modalityValue === "virtual" 
      ? { ...values, city: "", location: "" }
      : values;
    onUpdate(updateData);
    onNext();
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        form.setValue("imageUrl", reader.result as string);
        onUpdate({ imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Información básica</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configura los detalles principales de tu curso
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Input
              label="Título del curso *"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              label="Descripción *"
              rows={5}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Select
                label="Categoría *"
                options={categoryOptions}
                value={form.watch("category")}
                onChange={(e) => form.setValue("category", e.target.value)}
              />
              {form.formState.errors.category && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Select
                label="Nivel *"
                options={levelOptions}
                value={form.watch("level")}
                onChange={(e) => form.setValue("level", e.target.value)}
              />
              {form.formState.errors.level && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.level.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Modalidad del curso</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona si tu curso será virtual o presencial
            </p>
          </div>
          <div>
            <Select
              label="Modalidad *"
              options={modalityOptions}
              value={form.watch("modality")}
              onChange={(e) => {
                const newModality = e.target.value as "virtual" | "presencial";
                form.setValue("modality", newModality);
                // Limpiar campos de presencial si cambia a virtual
                if (newModality === "virtual") {
                  form.setValue("city", "");
                  form.setValue("location", "");
                  onUpdate({ modality: newModality, city: "", location: "" });
                } else {
                  onUpdate({ modality: newModality });
                }
              }}
            />
            {form.formState.errors.modality && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.modality.message}
              </p>
            )}
          </div>

          {modalityValue === "virtual" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Curso Virtual</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Los estudiantes podrán acceder al contenido desde cualquier lugar.
                    Podrás agregar links de sesión o plataforma más adelante.
                  </p>
                </div>
              </div>
            </div>
          )}

          {modalityValue === "presencial" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Curso Presencial</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Los estudiantes asistirán físicamente a las sesiones.
                      Necesitamos la ubicación exacta del curso.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    label="Ciudad *"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label="Dirección / Lugar *"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Imagen de portada</h3>
          <div className="space-y-2">
            <div className="relative">
              <div className="group flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center text-sm text-muted-foreground transition hover:border-primary/80">
                {hasImage ? (
                  <img
                    src={imageUrl}
                    alt="Portada del curso"
                    className="h-full w-full rounded-2xl object-cover object-center"
                  />
                ) : (
                  <div className="space-y-2 p-6">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="font-semibold text-foreground">Subir portada</p>
                    <p>Arrastra el archivo o haz clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground">1200x675 px recomendado (JPG/PNG)</p>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Subir portada"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            {hasImage && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Imagen lista</span>
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => {
                    form.setValue("imageUrl", "");
                    onUpdate({ imageUrl: "" });
                  }}
                >
                  Cambiar imagen
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
