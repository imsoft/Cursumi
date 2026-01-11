"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Monitor, MapPin } from "lucide-react";
import type { CourseFormData } from "./course-types";

// Schema dinámico basado en modalidad
const createPricingSchema = (modality: "virtual" | "presencial") => {
  const baseSchema = {
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    duration: z.string().min(1, "Ingresa la duración"),
  };

  if (modality === "virtual") {
    return z.object({
      ...baseSchema,
      courseType: z.string().min(1, "Selecciona el tipo de curso"),
      startDate: z.string().optional(), // Solo requerido si es fechado
    }).superRefine((data, ctx) => {
      if (data.courseType === "fechado" && !data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: "La fecha de inicio es obligatoria para cursos con fechas definidas",
        });
      }
    });
  } else {
    // Presencial
    return z.object({
      ...baseSchema,
      courseType: z.literal("fechado"), // Presencial siempre es fechado
      startDate: z.string().min(1, "Selecciona una fecha de inicio"),
      maxStudents: z.coerce.number().int().positive("La capacidad debe ser mayor que 0").optional(),
    });
  }
};

type PricingFormData = z.infer<ReturnType<typeof createPricingSchema>>;

const courseTypeOptions = [
  { value: "fechado", label: "Curso con fechas definidas" },
  { value: "ondemand", label: "Curso a tu ritmo (on demand)" },
];

interface CoursePricingProps {
  data: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CoursePricing = ({ data, onUpdate, onNext, onPrevious }: CoursePricingProps) => {
  const modality = data.modality || "virtual";
  const pricingSchema = createPricingSchema(modality);
  const isPresencial = modality === "presencial";
  const isVirtual = modality === "virtual";
  
  const form = useForm<PricingFormData>({
    resolver: createZodResolver(pricingSchema),
    defaultValues: {
      price: data.price,
      ...(isPresencial && { maxStudents: data.maxStudents }),
      courseType: data.courseType || (modality === "presencial" ? "fechado" : "fechado"),
      startDate: data.startDate,
      duration: data.duration,
    } as PricingFormData,
  });

  const courseType = form.watch("courseType");
  const showStartDate = isPresencial || (isVirtual && courseType === "fechado");

  const handleSubmit = form.handleSubmit((values) => {
    onUpdate(values);
    onNext();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Precio y configuración</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isVirtual
            ? "Define el precio y configuración de tu curso virtual"
            : "Define el precio, fechas y capacidad de tu curso presencial"}
        </p>
      </div>

      {/* Modalidad Badge */}
      <Card className="border border-border bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isVirtual ? (
              <Monitor className="h-5 w-5 text-primary" />
            ) : (
              <MapPin className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-semibold text-foreground">
                Curso {isVirtual ? "Virtual" : "Presencial"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isVirtual
                  ? "Los estudiantes podrán acceder desde cualquier lugar"
                  : `Ubicación: ${data.city || "No definida"}`}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground ml-auto">
              {isVirtual ? "Virtual" : "Presencial"}
            </span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Precio - Siempre visible */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Precio</h3>
          <div>
            <Input
              label="Precio del curso *"
              type="number"
              min="0"
              step="0.01"
              placeholder="1200"
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Configuración específica por modalidad */}
        {isVirtual ? (
          // Configuración para cursos VIRTUALES
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configuración del curso virtual</h3>
            <div>
              <Select
                label="Tipo de curso *"
                options={courseTypeOptions}
                value={form.watch("courseType")}
                onChange={(e) => {
                  form.setValue("courseType", e.target.value);
                  if (e.target.value === "ondemand") {
                    form.setValue("startDate", "");
                  }
                }}
              />
              {form.formState.errors.courseType && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.courseType.message}
                </p>
              )}
            </div>

            {showStartDate && (
              <div>
                <Input
                  label="Fecha de inicio *"
                  type="date"
                  {...form.register("startDate")}
                />
                {form.formState.errors.startDate && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Input
                label="Duración estimada *"
                placeholder="4 semanas · 8 sesiones · 10 horas"
                {...form.register("duration")}
              />
              {form.formState.errors.duration && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>

            {courseType === "ondemand" && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-foreground">
                  <strong>Curso a tu ritmo:</strong> Los estudiantes podrán acceder al contenido
                  cuando lo deseen y avanzar a su propio ritmo.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Configuración para cursos PRESENCIALES
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configuración del curso presencial</h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Los cursos presenciales siempre tienen fechas definidas y requieren una capacidad máxima.
              </p>
            </div>

            <div>
              <Input
                label="Fecha de inicio *"
                type="date"
                {...form.register("startDate")}
              />
              {form.formState.errors.startDate && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Duración estimada *"
                placeholder="4 semanas · 8 sesiones · 10 horas"
                {...form.register("duration")}
              />
              {form.formState.errors.duration && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Capacidad máxima *"
                type="number"
                min="1"
                placeholder="30"
                {...form.register("maxStudents", { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Número máximo de estudiantes que pueden inscribirse
              </p>
              {isPresencial && (form.formState.errors as any).maxStudents && (
                <p className="mt-1 text-xs text-destructive">
                  {(form.formState.errors as any).maxStudents.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button type="submit">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

