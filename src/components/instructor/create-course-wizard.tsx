"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseBasicInfo } from "@/components/instructor/course-basic-info";
import { CourseSectionsManager } from "@/components/instructor/course-sections-manager";
import { CoursePricing } from "@/components/instructor/course-pricing";
import { CourseFinalExamComponent } from "@/components/instructor/course-final-exam";
import { CoursePreview } from "@/components/instructor/course-preview";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Save } from "lucide-react";
import type { CourseFormData, CourseSection, CourseLesson } from "@/components/instructor/course-types";

const steps = [
  { id: "info", label: "Información básica", icon: CheckCircle2 },
  { id: "sections", label: "Secciones y lecciones", icon: CheckCircle2 },
  { id: "exam", label: "Examen final", icon: CheckCircle2 },
  { id: "pricing", label: "Precio y configuración", icon: CheckCircle2 },
  { id: "preview", label: "Vista previa", icon: CheckCircle2 },
];

export const CreateCourseWizard = () => {
  const [currentStep, setCurrentStep] = useState("info");
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
    setCurrentStep(stepId);
  };

  const updateCourseData = (data: Partial<CourseFormData>) => {
    setCourseData((prev) => ({ ...prev, ...data }));
  };

  const handleSaveDraft = () => {
    console.log("Guardar borrador:", courseData);
    alert("Curso guardado como borrador");
  };

  const handlePublish = () => {
    console.log("Publicar curso:", courseData);
    alert("Curso publicado exitosamente");
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
          Completa los pasos para crear tu curso en Cursumi
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className="flex flex-1 items-center gap-2 rounded-lg p-2 transition hover:bg-muted"
                    disabled={status === "upcoming"}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      style={{
                        borderColor: status === "completed" ? "var(--primary)" : status === "current" ? "var(--primary)" : "var(--border)",
                        backgroundColor: status === "completed" ? "var(--primary)" : "transparent",
                        color: status === "completed" ? "var(--primary-foreground)" : status === "current" ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      {status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${status === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-8 ${status === "completed" ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border border-border bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {steps.find((s) => s.id === currentStep)?.label}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Paso {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar como borrador
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
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

