"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";
import type { CourseFormData, CourseSessionData } from "./course-types";
import { formatPriceMXN } from "@/lib/utils";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { MODALITY_CONFIG } from "@/lib/modality";
import { CourseSessionsManager } from "./course-sessions-manager";

const PLATFORM_FEE_PERCENT = 15; // debe coincidir con src/lib/stripe.ts

const createPricingSchema = (modality: "virtual" | "presencial") => {
  const baseSchema = {
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    duration: z.string().min(1, "Ingresa la duración"),
  };

  if (modality === "virtual") {
    return z.object({
      ...baseSchema,
      courseType: z.string().default("ondemand"),
    });
  } else {
    // Para presencial, las fechas/capacidad se manejan por sesión, no aquí
    return z.object({
      ...baseSchema,
      courseType: z.literal("fechado"),
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
    } as PricingFormData,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedPrice = form.watch("price");

  const handleSubmit = form.handleSubmit((values) => {
    onUpdate({
      ...values,
      freeJoinCode: data.freeJoinCode,
      clearFreeJoinCode: data.clearFreeJoinCode,
    });
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
      <Card className={`border-2 ${MODALITY_CONFIG[modality === "presencial" ? "presencial" : "virtual"].color.border} bg-muted/20`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {MODALITY_CONFIG[modality === "presencial" ? "presencial" : "virtual"].label}
              </p>
              <p className="text-sm text-muted-foreground">
                {isVirtual
                  ? "Los estudiantes podrán acceder desde cualquier lugar"
                  : `Ubicación: ${data.city || "No definida"}`}
              </p>
            </div>
            <ModalityBadge modality={modality} size="md" />
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
            {isPresencial && watchedPrice === 0 && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Inscripción gratuita</p>
                <p className="text-xs text-muted-foreground">
                  Opcional: define un código para que solo quienes lo conozcan puedan inscribirse (por ejemplo lo compartes en clase).
                </p>
                <Input
                  label="Código de inscripción"
                  type="password"
                  autoComplete="new-password"
                  value={data.freeJoinCode ?? ""}
                  onChange={(e) =>
                    onUpdate({ freeJoinCode: e.target.value, clearFreeJoinCode: false })
                  }
                  placeholder={data.hasJoinCode ? "Nuevo código o vacío para no cambiar" : "Ej. TALLER2025"}
                />
                {data.hasJoinCode && (
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-input"
                      checked={!!data.clearFreeJoinCode}
                      onChange={(e) => onUpdate({ clearFreeJoinCode: e.target.checked })}
                    />
                    <span>Quitar el código (cualquiera podrá inscribirse sin código)</span>
                  </label>
                )}
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

        {/* Sesiones presenciales */}
        {isPresencial && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Sesiones presenciales</h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Agrega los lugares, fechas y horarios donde se impartirá tu curso. Cada sesión tiene su propia capacidad máxima.
              </p>
            </div>
            <CourseSessionsManager
              sessions={data.courseSessions ?? []}
              onChange={(sessions) => onUpdate({ courseSessions: sessions })}
            />
            {(data.courseSessions ?? []).length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Agrega al menos una sesión para tu curso presencial.
              </p>
            )}
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
