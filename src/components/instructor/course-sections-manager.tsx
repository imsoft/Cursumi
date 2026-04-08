"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical,
  FileText,
  Video,
  BookOpen,
  FileQuestion,
  Gamepad2,
  ClipboardCheck,
} from "lucide-react";
import type {
  CourseSection,
  CourseLesson,
} from "./course-types";
import { LessonEditor } from "./lesson-editor";
import { LessonStatusBadge } from "./lesson-status-badge";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

interface CourseSectionsManagerProps {
  sections: CourseSection[];
  onUpdate: (sections: CourseSection[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CourseSectionsManager = ({
  sections,
  onUpdate,
  onNext,
  onPrevious,
}: CourseSectionsManagerProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<{ sectionId: string; lessonId: string } | null>(null);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: CourseSection = {
      id: crypto.randomUUID(),
      title: newSectionTitle.trim(),
      description: "",
      order: sections.length + 1,
      lessons: [],
    };

    onUpdate([...sections, newSection]);
    setNewSectionTitle("");
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const updateSection = (sectionId: string, updates: Partial<CourseSection>) => {
    onUpdate(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSection = (sectionId: string) => {
    onUpdate(sections.filter((s) => s.id !== sectionId));
  };

  const addLesson = (sectionId: string) => {
    const newLesson: CourseLesson = {
      id: crypto.randomUUID(),
      title: "Nueva lección",
      type: "video",
      order: sections.find((s) => s.id === sectionId)?.lessons.length || 0,
    };

    updateSection(sectionId, {
      lessons: [...(sections.find((s) => s.id === sectionId)?.lessons || []), newLesson],
    });

    setEditingLesson({ sectionId, lessonId: newLesson.id });
  };

  const updateLesson = (sectionId: string, lessonId: string, updates: Partial<CourseLesson>) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updatedLessons = section.lessons.map((l) =>
      l.id === lessonId ? { ...l, ...updates } : l
    );

    updateSection(sectionId, { lessons: updatedLessons });
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      lessons: section.lessons.filter((l) => l.id !== lessonId),
    });
  };

  const getLessonIcon = (type: CourseLesson["type"]) => {
    switch (type) {
      case "video":
        return Video;
      case "text":
        return FileText;
      case "quiz":
        return FileQuestion;
      case "assignment":
        return BookOpen;
      case "section_quiz":
        return ClipboardCheck;
      case "section_minigame":
        return Gamepad2;
      default:
        return FileText;
    }
  };

  const getLessonTypeLabel = (type: CourseLesson["type"]) => {
    switch (type) {
      case "video":
        return "Video";
      case "text":
        return "Texto";
      case "quiz":
        return "Quiz";
      case "assignment":
        return "Tarea";
      case "section_quiz":
        return "Test";
      case "section_minigame":
        return "Minijuego";
      default:
        return "Lección";
    }
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const gateClosingLessons = sections.reduce(
    (acc, s) =>
      acc + s.lessons.filter((l) => l.type === "section_quiz" || l.type === "section_minigame").length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Secciones y lecciones</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Organiza el contenido de tu curso en secciones y lecciones
        </p>
      </div>

      <div className="space-y-4">
        {/* Add New Section */}
        <Card className="border border-border bg-card/90">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSection();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addSection} disabled={!newSectionTitle.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar sección
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sections List */}
        {sections.length === 0 ? (
          <Card className="border border-dashed border-border bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground">No hay secciones aún</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Agrega tu primera sección para comenzar a estructurar tu curso
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.id);

              return (
                <Card key={section.id} className="border border-border bg-card/90">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                    <CardHeader className="px-6 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {sectionIndex + 1}. {section.title}
                            </CardTitle>
                            <Badge variant="outline">{section.lessons.length} lecciones</Badge>
                            {section.quiz && section.quiz.questions.length > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary">
                                Test
                              </span>
                            )}
                            {section.minigame && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                                {section.minigame.type === "memory" ? "Memoria" : section.minigame.type === "hangman" ? "Ahorcado" : section.minigame.type === "match" ? "Conectar" : "Ordenar"}
                              </span>
                            )}
                          </div>
                          {section.description && (
                            <RichTextRenderer content={section.description} className="text-sm text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <ConfirmDeleteButton
                            onConfirm={() => deleteSection(section.id)}
                            message={`Se eliminará la sección "${section.title}" y todas sus lecciones. Esta acción no se puede deshacer.`}
                          />
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        {/* Section Details */}
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                          <Input
                            label="Título de la sección"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          />
                          <label className="text-sm font-medium text-foreground">Descripción (opcional)</label>
                          <RichTextEditor
                            value={section.description || ""}
                            onChange={(html) => updateSection(section.id, { description: html })}
                            placeholder="Describe esta sección…"
                            minHeight="80px"
                          />
                        </div>

                        <Separator />

                        {/* Lessons */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">Lecciones</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addLesson(section.id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar lección
                            </Button>
                          </div>

                          {section.lessons.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                              <p className="text-sm text-muted-foreground">
                                No hay lecciones en esta sección
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {section.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, lessonIndex) => {
                                  const Icon = getLessonIcon(lesson.type);
                                  const isEditing =
                                    editingLesson?.sectionId === section.id &&
                                    editingLesson?.lessonId === lesson.id;

                                  if (isEditing) {
                                    return (
                                      <LessonEditor
                                        key={lesson.id}
                                        lesson={lesson}
                                        onSave={(updates) => {
                                          updateLesson(section.id, lesson.id, updates);
                                          setEditingLesson(null);
                                        }}
                                        onCancel={() => setEditingLesson(null)}
                                      />
                                    );
                                  }

                                  return (
                                    <Card
                                      key={lesson.id}
                                      className="border border-border bg-background"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <GripVertical className="mt-1 h-4 w-4 text-muted-foreground" />
                                          <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <Icon className="h-4 w-4 text-muted-foreground" />
                                              <span className="font-medium text-foreground">
                                                {lessonIndex + 1}. {lesson.title}
                                              </span>
                                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                                {getLessonTypeLabel(lesson.type)}
                                              </span>
                                              {lesson.duration && (
                                                <span className="text-xs text-muted-foreground">
                                                  {lesson.duration}
                                                </span>
                                              )}
                                              <LessonStatusBadge lesson={lesson} />
                                            </div>
                                            {lesson.description && (
                                              <RichTextRenderer content={lesson.description} className="mt-1 text-sm text-muted-foreground" />
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setEditingLesson({
                                                  sectionId: section.id,
                                                  lessonId: lesson.id,
                                                })
                                              }
                                            >
                                              Editar
                                            </Button>
                                            <ConfirmDeleteButton
                                              onConfirm={() => deleteLesson(section.id, lesson.id)}
                                              message={`Se eliminará la lección "${lesson.title}". Esta acción no se puede deshacer.`}
                                            />
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <Card className="border border-border bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                {sections.length} {sections.length === 1 ? "sección" : "secciones"}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalLessons} {totalLessons === 1 ? "lección" : "lecciones"} en total
                {gateClosingLessons > 0 && (
                  <span>
                    {" "}
                    · {gateClosingLessons}{" "}
                    {gateClosingLessons === 1 ? "lección de cierre" : "lecciones de cierre"} (test o minijuego)
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={sections.length === 0}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
