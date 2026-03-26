"use client";
/* eslint-disable @next/next/no-img-element */

import { Button } from "@/components/ui/button";
import { formatPriceMXN } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Send, AlertCircle, MapPin } from "lucide-react";
import type { CourseFormData } from "./course-types";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { ModalityBadge } from "@/components/ui/modality-badge";
import { MODALITY_CONFIG } from "@/lib/modality";
import { CourseStatusPanel } from "./course-status-panel";
import { getCourseCompletion } from "@/lib/course-completion";

interface CoursePreviewProps {
  courseData: CourseFormData;
  onPrevious: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const CoursePreview = ({
  courseData,
  onPrevious,
  onSaveDraft,
  onPublish,
}: CoursePreviewProps) => {
  const totalLessons = courseData.sections?.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  ) || 0;

  const { canPublish, required } = getCourseCompletion(courseData);
  const missingRequired = required.filter((r) => !r.fulfilled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Vista previa del curso</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa toda la información antes de publicar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column — course content */}
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Info */}
            <Card className={`border border-border bg-card/90 border-t-4 ${courseData.modality === "presencial" ? "border-t-emerald-500" : "border-t-blue-500"}`}>
              <CardHeader>
                <CardTitle>Información del curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseData.imageUrl && (
                  <img
                    src={courseData.imageUrl}
                    alt={courseData.title}
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-foreground">{courseData.title}</h3>
                  <RichTextRenderer content={courseData.description} className="mt-2 text-sm text-muted-foreground" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ModalityBadge modality={courseData.modality} size="sm" />
                  <Badge>{courseData.category}</Badge>
                  <Badge variant="outline">{courseData.level}</Badge>
                </div>
                {courseData.modality === "presencial" && courseData.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>{courseData.city}{courseData.location ? ` — ${courseData.location}` : ""}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card className="border border-border bg-card/90">
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Precio</p>
                  <p className="text-2xl font-bold text-primary">{formatPriceMXN(courseData.price)}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo de curso:</span>
                    <span className="font-medium">{courseData.courseType === "fechado" ? "Con fechas" : "A tu ritmo"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha de inicio:</span>
                    <span className="font-medium">{courseData.startDate || "No definida"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{courseData.duration || "No definida"}</span>
                  </div>
                  {courseData.maxStudents && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacidad máxima:</span>
                      <span className="font-medium">{courseData.maxStudents} estudiantes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sections Preview */}
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle>Estructura del curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    {courseData.sections?.length || 0} secciones
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalLessons} lecciones en total
                  </p>
                </div>
                {courseData.sections && courseData.sections.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.sections.map((section, sectionIndex) => (
                      <div
                        key={section.id}
                        className="rounded-lg border border-border bg-muted/20 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">
                            {sectionIndex + 1}. {section.title}
                          </span>
                          <Badge variant="outline">{section.lessons.length} lecciones</Badge>
                        </div>
                        {section.description && (
                          <RichTextRenderer content={section.description} className="text-sm text-muted-foreground mb-3" />
                        )}
                        <div className="space-y-2">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 text-sm text-muted-foreground pl-4"
                            >
                              <span>
                                {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </span>
                              {lesson.duration && (
                                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                  {lesson.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay secciones definidas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — status panel */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CourseStatusPanel courseData={courseData} />
        </div>
      </div>

      {/* Publish error summary */}
      {!canPublish && missingRequired.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            <div className="text-sm text-destructive">
              <p className="font-semibold">No puedes publicar todavía:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {missingRequired.map((item) => (
                  <li key={item.key}>{item.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Guardar borrador
          </Button>
          <Button
            onClick={onPublish}
            disabled={!canPublish}
            title={!canPublish ? "Completa los campos requeridos para publicar" : undefined}
          >
            <Send className="mr-2 h-4 w-4" />
            Publicar curso
          </Button>
        </div>
      </div>
    </div>
  );
};
