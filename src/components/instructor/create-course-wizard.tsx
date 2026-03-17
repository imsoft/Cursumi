"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseBasicInfo } from "@/components/instructor/course-basic-info";
import { CourseSectionsManager } from "@/components/instructor/course-sections-manager";
import { CoursePricing } from "@/components/instructor/course-pricing";
import { CourseFinalExamComponent } from "@/components/instructor/course-final-exam";
import { CoursePreview } from "@/components/instructor/course-preview";
import { CheckCircle2, Save, Loader2 } from "lucide-react";
import type { CourseFormData } from "@/components/instructor/course-types";
import { createCourseDraft, publishCourse } from "@/app/actions/course-actions";

const AUTO_SAVE_INTERVAL_MS = 30_000;

const steps = [
  { id: "info", label: "Información básica", icon: CheckCircle2 },
  { id: "sections", label: "Secciones y lecciones", icon: CheckCircle2 },
  { id: "exam", label: "Examen final", icon: CheckCircle2 },
  { id: "pricing", label: "Precio y configuración", icon: CheckCircle2 },
  { id: "preview", label: "Vista previa", icon: CheckCircle2 },
];

type SaveStatus = "idle" | "saving" | "saved";

export const CreateCourseWizard = ({ initialData }: { initialData?: CourseFormData }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("info");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const savedAtRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "programacion",
    level: "principiante",
    modality: "virtual",
    city: "",
    location: "",
    courseType: "fechado",
    startDate: "",
    duration: "",
    price: 0,
    maxStudents: undefined,
    imageUrl: "",
    sections: [],
  });

  useEffect(() => {
    if (initialData) {
      setCourseData(initialData);
    }
  }, [initialData]);

  const courseDataRef = useRef(courseData);
  courseDataRef.current = courseData;

  const performAutoSave = () => {
    const data = courseDataRef.current;
    // No guardar borrador vacío por timer: solo si ya existe id o hay título
    if (!data.id && !data.title?.trim()) return;
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const result = await createCourseDraft(data);
        const id = result && typeof result === "object" && "id" in result ? result.id : undefined;
        if (id && !data.id) {
          setCourseData((prev) => ({ ...prev, id }));
        }
        setSaveStatus("saved");
        if (savedAtRef.current) clearTimeout(savedAtRef.current);
        savedAtRef.current = setTimeout(() => {
          setSaveStatus("idle");
          savedAtRef.current = null;
        }, 2500);
      } catch {
        setSaveStatus("idle");
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(performAutoSave, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (savedAtRef.current) clearTimeout(savedAtRef.current);
    };
  }, []);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStep(prevStep.id);
    }
  };

  const handleStepClick = (stepId: string) => {
    if (stepId !== currentStep) {
      performAutoSave();
      setCurrentStep(stepId);
    }
  };

  const updateCourseData = (data: Partial<CourseFormData>) => {
    setCourseData((prev) => ({ ...prev, ...data }));
  };

  const handleSaveDraft = () => {
    setStatusMessage(null);
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const result = await createCourseDraft(courseData);
        const id = result && typeof result === "object" && "id" in result ? result.id : undefined;
        const isNew = !courseData.id;
        if (id && isNew) {
          setCourseData((prev) => ({ ...prev, id }));
        }
        setSaveStatus("saved");
        router.push(id && isNew ? `/instructor/courses/${id}/edit` : "/instructor/courses");
      } catch {
        setSaveStatus("idle");
      }
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      await publishCourse(courseData);
      router.push("/instructor/courses");
    });
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Crear nuevo curso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Completa los pasos para publicar tu curso
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className="flex flex-1 items-center gap-1.5 rounded-lg p-1.5 transition hover:bg-muted sm:gap-2 sm:p-2"
                    disabled={status === "upcoming"}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:h-8 sm:w-8"
                      style={{
                        borderColor: status === "completed" ? "var(--primary)" : status === "current" ? "var(--primary)" : "var(--border)",
                        backgroundColor: status === "completed" ? "var(--primary)" : "transparent",
                        color: status === "completed" ? "var(--primary-foreground)" : status === "current" ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      {status === "completed" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`hidden text-sm font-medium sm:inline ${status === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-4 shrink-0 sm:w-8 ${status === "completed" ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border border-border bg-card/90">
        <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {steps.find((s) => s.id === currentStep)?.label}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Paso {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sm text-green-600">Guardado</span>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="flex items-center gap-2"
              disabled={isPending}
            >
              <Save className="h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar como borrador"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {statusMessage && (
            <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              {statusMessage}
            </div>
          )}
          <Tabs
            value={currentStep}
            onValueChange={(value) => {
              if (value !== currentStep) {
                performAutoSave();
                setCurrentStep(value);
              }
            }}
            className="w-full"
          >
            <TabsContent value="info" className="mt-0">
              <CourseBasicInfo
                data={courseData}
                onUpdate={updateCourseData}
                onNext={handleNext}
              />
            </TabsContent>

            <TabsContent value="sections" className="mt-0">
              <CourseSectionsManager
                sections={courseData.sections || []}
                onUpdate={(sections) => updateCourseData({ sections })}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>

            <TabsContent value="exam" className="mt-0">
              <CourseFinalExamComponent
                data={courseData}
                onUpdate={updateCourseData}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <CoursePricing
                data={courseData}
                onUpdate={updateCourseData}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <CoursePreview
                courseData={courseData}
                onPrevious={handlePrevious}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
