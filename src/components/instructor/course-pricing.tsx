"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Monitor, MapPin, TrendingUp } from "lucide-react";
import type { CourseFormData } from "./course-types";
import { formatPriceMXN } from "@/lib/utils";

const PLATFORM_FEE_PERCENT = 15; // debe coincidir con src/lib/stripe.ts

const createPricingSchema = (modality: "virtual" | "presencial") => {
  const baseSchema = {
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    duration: z.string().min(1, "Ingresa la duración"),
  };

  if (modality === "virtual") {
    return z.object({
      ...baseSchema,
      courseType: z.string().default("ondemand"),
    });
  } else {
    return z.object({
      ...baseSchema,
      courseType: z.literal("fechado"),
      startDate: z.string().min(1, "Selecciona una fecha de inicio"),
      maxStudents: z.coerce.number().int().positive("La capacidad debe ser mayor que 0").optional(),
    });
  }
};

type PricingFormData = z.infer<ReturnType<typeof createPricingSchema>>;

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
      duration: data.duration,
      courseType: isPresencial ? "fechado" : (data.courseType || "ondemand"),
      ...(isPresencial && { startDate: data.startDate, maxStudents: data.maxStudents }),
    } as PricingFormData,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedPrice = form.watch("price");

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
            ? "Define el precio de tu curso virtual"
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
        {/* Precio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Precio</h3>
          <div>
            <Input
              label="Precio del curso *"
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
            {watchedPrice > 0 && !form.formState.errors.price && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>
                  Recibirás{" "}
                  <strong>
                    {formatPriceMXN(Math.round(watchedPrice * (1 - PLATFORM_FEE_PERCENT / 100)))}
                  </strong>{" "}
                  por cada venta
                  <span className="text-xs text-muted-foreground ml-1">
                    (comisión plataforma {PLATFORM_FEE_PERCENT}%)
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Duración — siempre visible */}
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

        {/* Configuración presencial */}
        {isPresencial && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configuración del curso presencial</h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Los cursos presenciales siempre tienen fechas definidas y requieren una capacidad máxima.
              </p>
            </div>

            <div>
              <Input
                label="Fecha de inicio *"
                type="date"
                {...form.register("startDate")}
              />
              {"startDate" in form.formState.errors && form.formState.errors.startDate && (
                <p className="mt-1 text-xs text-destructive">
                  {(form.formState.errors.startDate as { message?: string }).message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Capacidad máxima *"
                type="number"
                min="1"
                {...form.register("maxStudents", { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Número máximo de estudiantes que pueden inscribirse
              </p>
              {"maxStudents" in form.formState.errors && form.formState.errors.maxStudents && (
                <p className="mt-1 text-xs text-destructive">
                  {(form.formState.errors.maxStudents as { message?: string }).message}
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
