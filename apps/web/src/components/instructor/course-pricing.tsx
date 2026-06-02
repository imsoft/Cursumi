"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createZodResolver } from "@/lib/form-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";
import type { CourseFormData, CourseSessionData } from "./course-types";
import { formatPriceMXN } from "@/lib/utils";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { MODALITY_CONFIG } from "@/lib/modality";
import { formatMexicoLocation } from "@/lib/mexico-location-helpers";
import { CourseSessionsManager } from "./course-sessions-manager";

const createPricingSchema = (modality: "virtual" | "presencial" | "live") => {
  const baseSchema = {
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    duration: z.string().min(1, "Ingresa la duración"),
  };

  if (modality === "virtual") {
    return z.object({
      ...baseSchema,
      courseType: z.string().default("ondemand"),
    });
  }
  // presencial o en vivo: sesiones fechadas
  return z.object({
    ...baseSchema,
    courseType: z.literal("fechado"),
  });
};

type PricingFormData = z.infer<ReturnType<typeof createPricingSchema>>;

interface CoursePricingProps {
  data: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CoursePricing = ({ data, onUpdate, onNext, onPrevious }: CoursePricingProps) => {
  const [platformFeePercent, setPlatformFeePercent] = useState(15);

  useEffect(() => {
    fetch("/api/platform-fee")
      .then((r) => r.json())
      .then((j: { platformFeePercent?: number }) => {
        if (typeof j.platformFeePercent === "number") {
          setPlatformFeePercent(j.platformFeePercent);
        }
      })
      .catch(() => {});
  }, []);

  const modality = data.modality || "virtual";
  const pricingSchema = createPricingSchema(modality);
  const isPresencial = modality === "presencial";
  const isLive = modality === "live";
  const isVirtual = modality === "virtual";
  const usesSessions = isPresencial || isLive;
  const modalityUi = modality === "presencial" ? "presencial" : modality === "live" ? "live" : "virtual";

  const form = useForm<PricingFormData>({
    resolver: createZodResolver(pricingSchema),
    defaultValues: {
      price: data.price,
      duration: data.duration,
      courseType: usesSessions ? "fechado" : (data.courseType || "ondemand"),
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
          {isVirtual && "Define el precio de tu curso con vídeos a demanda"}
          {isPresencial && "Define el precio, sedes y sesiones de tu curso presencial"}
          {isLive && "Define el precio y las sesiones en vivo con enlace de reunión"}
        </p>
      </div>

      {/* Modalidad Badge */}
      <Card className={`border-2 ${MODALITY_CONFIG[modalityUi].color.border} bg-muted/20`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {MODALITY_CONFIG[modalityUi].label}
              </p>
              <p className="text-sm text-muted-foreground">
                {isVirtual && "Los estudiantes avanzan el contenido a su ritmo"}
                {isPresencial &&
                  `Ubicación general: ${formatMexicoLocation(data.city, data.state) || "—"}${data.location ? ` · ${data.location}` : ""}`}
                {isLive && "Cada sesión incluye fecha, hora y enlace de videollamada"}
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
                    {formatPriceMXN(Math.round(watchedPrice * (1 - platformFeePercent / 100)))}
                  </strong>{" "}
                  por cada venta
                  <span className="text-xs text-muted-foreground ml-1">
                    (comisión plataforma {platformFeePercent}%)
                  </span>
                </span>
              </div>
            )}
            {usesSessions && watchedPrice === 0 && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Inscripción gratuita</p>
                <p className="text-xs text-muted-foreground">
                  Opcional: define un código para que solo quienes lo conozcan puedan inscribirse (por ejemplo lo compartes en clase).
                </p>
                <PasswordInput
                  label="Código de inscripción"
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

        {usesSessions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {isLive ? "Sesiones en vivo" : "Sesiones presenciales"}
            </h3>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                {isLive
                  ? "Para cada sesión indica fecha, horario, cupo y el enlace de Meet, Zoom, Teams u otra herramienta."
                  : "Agrega los lugares, fechas y horarios donde se impartirá tu curso. Cada sesión tiene su propia capacidad máxima."}
              </p>
            </div>
            <CourseSessionsManager
              variant={isLive ? "live" : "presencial"}
              sessions={data.courseSessions ?? []}
              onChange={(sessions) => onUpdate({ courseSessions: sessions })}
              isFree={watchedPrice === 0}
            />
            {(data.courseSessions ?? []).length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {isLive
                  ? "Agrega al menos una sesión en vivo con enlace de reunión."
                  : "Agrega al menos una sesión para tu curso presencial."}
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
