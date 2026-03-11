"use client";
/* eslint-disable @next/next/no-img-element */

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";

import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const createCourseSchema = z
  .object({
    title: z.string().min(3, "El título es obligatorio"),
    description: z.string().min(10, "La descripción es obligatoria"),
    category: z.string().min(1, "Selecciona una categoría"),
    level: z.string().min(1, "Selecciona un nivel"),
    modality: z.enum(["virtual", "presencial"], "Selecciona una modalidad"),
    city: z.string().optional(),
    location: z.string().optional(),
    courseType: z.string().min(1, "Selecciona el tipo de curso"),
    startDate: z.string().min(1, "Selecciona una fecha de inicio"),
    duration: z.string().min(1, "Ingresa la duración estimada"),
    price: z.coerce.number("Ingresa un precio válido").positive("El precio debe ser mayor a 0"),
    maxStudents: z
      .coerce.number()
      .int()
      .positive("La capacidad debe ser mayor que 0")
      .optional(),
    imageUrl: z.string().url("Ingresa una URL válida").optional(),
    isDraft: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modality === "presencial") {
      if (!data.city) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["city"],
          message: "La ciudad es obligatoria para cursos presenciales",
        });
      }
      if (!data.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "La dirección es obligatoria para cursos presenciales",
        });
      }
    }
  });

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

const categoryOptions = [
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

const courseTypeOptions = [
  { value: "fechado", label: "Curso con fechas definidas" },
  { value: "ondemand", label: "Curso a tu ritmo (on demand)" },
];

export const CreateCourseForm = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateCourseFormValues>({
    resolver: createZodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "programacion",
      level: "principiante",
      modality: "virtual",
      courseType: "fechado",
      startDate: "",
      duration: "",
      price: 0,
      maxStudents: undefined,
      imageUrl: "",
      isDraft: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const modalityValue = form.watch("modality");

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setStatusMessage(null);
      const res = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No pudimos crear el curso");
      }
      setStatusMessage(values.isDraft ? "Curso guardado como borrador" : "Curso publicado");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el curso");
    }
  });

  const handleDraft = () => {
    form.setValue("isDraft", true);
    handleSubmit();
  };

  const handlePublish = () => {
    form.setValue("isDraft", false);
    handleSubmit();
  };

  return (
    <Card className="border border-border bg-card/80 shadow-lg">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-3xl font-bold text-foreground">Crear nuevo curso</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Configura los detalles de tu curso virtual o presencial en Cursumi.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {statusMessage && <p className="text-sm text-green-600">{statusMessage}</p>}
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 pt-0">
        <form className="space-y-6" onSubmit={handlePublish}>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Datos básicos del curso</h2>
            <div className="space-y-4">
              <div>
                <Input
                  label="Título del curso *"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <Textarea
                  label="Descripción *"
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
                    {...form.register("category")}
                  />
                  {form.formState.errors.category && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <Select label="Nivel *" options={levelOptions} {...form.register("level")} />
                  {form.formState.errors.level && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.level.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Modalidad y ubicación</h2>
            <div className="space-y-4">
              <div>
                <Select
                  label="Modalidad *"
                  options={modalityOptions}
                  {...form.register("modality")}
                />
                {form.formState.errors.modality && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.modality.message}
                  </p>
                )}
              </div>
              {modalityValue === "virtual" && (
                <p className="text-sm text-muted-foreground">
                  Más adelante podrás agregar links de sesión o plataforma.
                </p>
              )}
              {modalityValue === "presencial" && (
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
                      label="Dirección / lugar *"
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
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Fechas / duración</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Select
                  label="Tipo de curso *"
                  options={courseTypeOptions}
                  {...form.register("courseType")}
                />
                {form.formState.errors.courseType && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.courseType.message}
                  </p>
                )}
              </div>
              <div>
                <Input label="Fecha de inicio *" type="date" {...form.register("startDate")} />
                {form.formState.errors.startDate && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Duración estimada *"
                  {...form.register("duration")}
                />
                {form.formState.errors.duration && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.duration.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Precio y capacidad</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Input
                  label="Precio *"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Capacidad máxima"
                  type="number"
                  min="1"
                  {...form.register("maxStudents", { valueAsNumber: true })}
                />
                {form.formState.errors.maxStudents && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.maxStudents.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Imagen / portada</h2>
            <ImagePreviewSection
              imageUrl={form.watch("imageUrl")}
              onFileSelect={(value) => {
                if (value) {
                  const reader = new FileReader();
                  reader.onload = () => form.setValue("imageUrl", reader.result as string);
                  reader.readAsDataURL(value);
                }
              }}
              onClear={() => form.setValue("imageUrl", "")}
            />
            <div>
              <Input
                label="URL de imagen"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                {...form.register("isDraft")}
              />
              Guardar como borrador
            </label>
            <p className="text-xs text-muted-foreground">
              Activa esta opción si deseas guardar el curso sin publicarlo inmediatamente.
            </p>
          </section>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDraft}
              disabled={form.formState.isSubmitting}
            >
              Guardar como borrador
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handlePublish}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creando curso..." : "Crear curso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface ImagePreviewSectionProps {
  imageUrl?: string;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
}

const ImagePreviewSection = ({ imageUrl, onFileSelect, onClear }: ImagePreviewSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasImage = useMemo(() => Boolean(imageUrl), [imageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  return (
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
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Portada del curso</p>
              <p>Arrastra el archivo o haz clic para seleccionar.</p>
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
          onChange={handleFileChange}
        />
      </div>
      {hasImage && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Imagen lista</span>
          <button type="button" className="text-primary underline" onClick={onClear}>
            Cambiar imagen
          </button>
        </div>
      )}
    </div>
  );
};
