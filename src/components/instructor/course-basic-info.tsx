"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/incompatible-library */

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Loader2 } from "lucide-react";
import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useImageUpload } from "@/hooks/use-image-upload";
import type { CourseFormData } from "./course-types";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { MODALITY_CONFIG } from "@/lib/modality";
import { MexicoStateCityFields } from "@/components/location/mexico-state-city-fields";
import { findStateForMunicipality } from "@/lib/mexico-location-helpers";

const createBasicInfoSchema = (modality: "virtual" | "presencial" | "live") => {
  const baseSchema = {
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    category: z.string().min(1, "Selecciona una categoría"),
    level: z.string().min(1, "Selecciona un nivel"),
    modality: z.enum(["virtual", "presencial", "live"]),
    imageUrl: z.string().optional(),
  };

  if (modality === "presencial") {
    return z.object({
      ...baseSchema,
      state: z.string().min(1, "Selecciona un estado"),
      city: z.string().min(1, "Selecciona una ciudad o municipio"),
      location: z.string().min(1, "La dirección es obligatoria para cursos presenciales"),
    });
  }

  // virtual y en vivo: sin sede obligatoria (en vivo define enlace por sesión)
  return z.object({
    ...baseSchema,
    state: z.string().optional(),
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
      state: data.state ?? "",
      city: data.city,
      location: data.location,
      imageUrl: data.imageUrl,
    },
  });

  useEffect(() => {
    if (modality === "presencial" && !(data.state ?? "").trim() && (data.city ?? "").trim()) {
      const inferred = findStateForMunicipality(data.city!);
      if (inferred) form.setValue("state", inferred);
    }
  }, [modality, data.state, data.city, form]);

  const imageUrl = form.watch("imageUrl");
  const hasImage = useMemo(() => Boolean(imageUrl), [imageUrl]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSuccess = useCallback(
    (url: string) => {
      form.setValue("imageUrl", url);
      onUpdate({ imageUrl: url });
      setUploadError(null);
    },
    [form, onUpdate],
  );

  const { upload, uploading } = useImageUpload({
    onSuccess: handleUploadSuccess,
    onError: setUploadError,
  });

  const handleSubmit = form.handleSubmit((values) => {
    onUpdate(values);
    onNext();
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload(file);
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
            <label className="text-sm font-medium text-foreground">Descripción *</label>
            <RichTextEditor
              value={form.watch("description") ?? ""}
              onChange={(html) => form.setValue("description", html, { shouldValidate: true })}
              placeholder="Describe tu curso…"
              className="mt-1"
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

        {modality === "live" && (
          <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-4">
            <h3 className="text-sm font-semibold text-foreground">Clases en vivo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              En el paso de precio y sesiones podrás agregar cada fecha y el enlace de Meet, Zoom, Teams u otra herramienta.
            </p>
          </div>
        )}

        {modality === "presencial" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ubicación del curso</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Indica dónde se realizará el curso presencial
              </p>
            </div>
            <MexicoStateCityFields
              state={form.watch("state") ?? ""}
              city={form.watch("city") ?? ""}
              onStateChange={(v) => form.setValue("state", v, { shouldValidate: true })}
              onCityChange={(v) => form.setValue("city", v, { shouldValidate: true })}
              stateError={form.formState.errors.state?.message}
              cityError={form.formState.errors.city?.message}
            />
            <div>
              <Input
                label="Dirección / Lugar *"
                placeholder="Ej: Av. Reforma 222, Col. Juárez"
                {...form.register("location")}
              />
              {form.formState.errors.location && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Imagen de portada</h3>
          <div className="space-y-2">
            <div className="relative">
              <div className="group flex aspect-video w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 text-center text-sm text-muted-foreground transition hover:border-primary/80">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="font-semibold text-foreground">Subiendo imagen...</p>
                  </div>
                ) : hasImage ? (
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
                    <p className="text-xs text-muted-foreground">1920×1080 px recomendado (JPG/PNG/WebP)</p>
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
            {uploadError && (
              <p className="text-xs text-destructive">{uploadError}</p>
            )}
            {hasImage && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Imagen lista — Tamaño recomendado: 1920×1080 px (16:9)</span>
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
