"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  ChevronRight,
  GripVertical,
  FileText,
  Video,
  BookOpen,
  FileQuestion,
  Gamepad2,
  ClipboardCheck,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { CourseSection, CourseLesson } from "./course-types";
import { LessonEditor } from "./lesson-editor";
import { LessonStatusBadge } from "./lesson-status-badge";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface CourseSectionsManagerProps {
  sections: CourseSection[];
  onUpdate: (sections: CourseSection[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  courseId?: string;
}

const LESSON_ICONS: Record<CourseLesson["type"], React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: FileQuestion,
  assignment: BookOpen,
  section_quiz: ClipboardCheck,
  section_minigame: Gamepad2,
};

const LESSON_LABELS: Record<CourseLesson["type"], string> = {
  video: "Video",
  text: "Texto",
  quiz: "Quiz",
  assignment: "Tarea",
  section_quiz: "Test",
  section_minigame: "Minijuego",
};

export const CourseSectionsManager = ({
  sections,
  onUpdate,
  onNext,
  onPrevious,
  courseId,
}: CourseSectionsManagerProps) => {
  // Drill-down state: null = section list, string = section detail, {sId,lId} = lesson editor
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Inline rename state
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? null;

  // ── Section operations ────────────────────────────────────────────────────

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const section: CourseSection = {
      id: crypto.randomUUID(),
      title: newSectionTitle.trim(),
      description: "",
      order: sections.length + 1,
      lessons: [],
    };
    onUpdate([...sections, section]);
    setNewSectionTitle("");
    setActiveSectionId(section.id);
  };

  const deleteSection = (sectionId: string) => {
    onUpdate(sections.filter((s) => s.id !== sectionId));
    if (activeSectionId === sectionId) setActiveSectionId(null);
  };

  const startRename = (section: CourseSection) => {
    setRenamingSectionId(section.id);
    setRenameValue(section.title);
  };

  const confirmRename = () => {
    if (!renamingSectionId || !renameValue.trim()) return;
    onUpdate(sections.map((s) => s.id === renamingSectionId ? { ...s, title: renameValue.trim() } : s));
    setRenamingSectionId(null);
  };

  // ── Lesson operations ─────────────────────────────────────────────────────

  const addLesson = (sectionId: string) => {
    const newLesson: CourseLesson = {
      id: crypto.randomUUID(),
      title: "Nueva lección",
      type: "video",
      order: sections.find((s) => s.id === sectionId)?.lessons.length ?? 0,
    };
    onUpdate(sections.map((s) =>
      s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s
    ));
    setEditingLessonId(newLesson.id);
  };

  const saveLesson = (sectionId: string, lessonId: string, updates: Partial<CourseLesson>) => {
    onUpdate(sections.map((s) =>
      s.id === sectionId
        ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l) }
        : s
    ));
    setEditingLessonId(null);
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    onUpdate(sections.map((s) =>
      s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
    ));
    if (editingLessonId === lessonId) setEditingLessonId(null);
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  // ── Lesson detail (editor) ────────────────────────────────────────────────

  if (activeSectionId && editingLessonId) {
    const lesson = activeSection?.lessons.find((l) => l.id === editingLessonId);
    if (lesson && activeSection) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEditingLessonId(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a {activeSection.title}
          </button>
          <LessonEditor
            lesson={lesson}
            courseId={courseId}
            onSave={(updates) => saveLesson(activeSectionId, editingLessonId, updates)}
            onCancel={() => setEditingLessonId(null)}
          />
        </div>
      );
    }
  }

  // ── Section detail (lesson list) ──────────────────────────────────────────

  if (activeSection) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={() => setActiveSectionId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a secciones
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{activeSection.title}</h2>
            <p className="text-sm text-muted-foreground">{activeSection.lessons.length} lecciones</p>
          </div>
          <Button size="sm" onClick={() => addLesson(activeSection.id)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar lección
          </Button>
        </div>

        {activeSection.lessons.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><FileText /></EmptyMedia>
              <EmptyTitle>Sin lecciones</EmptyTitle>
              <EmptyDescription>Agrega la primera lección a esta sección</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {activeSection.lessons
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((lesson, idx) => {
                const Icon = LESSON_ICONS[lesson.type] ?? FileText;
                return (
                  <Card key={lesson.id} className="border border-border bg-card">
                    <CardContent className="flex items-center gap-3 p-4">
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {idx + 1}. {lesson.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {LESSON_LABELS[lesson.type]}
                          </span>
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          )}
                          <LessonStatusBadge lesson={lesson} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLessonId(lesson.id)}
                          className="text-xs"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <ConfirmDeleteButton
                          onConfirm={() => deleteLesson(activeSection.id, lesson.id)}
                          message={`Se eliminará "${lesson.title}". Esta acción no se puede deshacer.`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => setActiveSectionId(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a secciones
          </Button>
        </div>
      </div>
    );
  }

  // ── Section list ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Secciones y lecciones</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Organiza el contenido de tu curso en secciones. Entra a cada sección para agregar lecciones.
        </p>
      </div>

      {/* Add section */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSection(); } }}
              className="flex-1"
            />
            <Button onClick={addSection} disabled={!newSectionTitle.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar sección
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections list */}
      {sections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
            <EmptyTitle>No hay secciones aún</EmptyTitle>
            <EmptyDescription>Agrega tu primera sección para comenzar a estructurar tu curso</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {sections.map((section, idx) => (
            <Card key={section.id} className="border border-border bg-card hover:bg-card/80 transition-colors">
              <CardContent className="flex items-center gap-3 p-4">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />

                {renamingSectionId === section.id ? (
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <Input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setRenamingSectionId(null); }}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={confirmRename}><Check className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setRenamingSectionId(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {idx + 1}. {section.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {section.lessons.length} {section.lessons.length === 1 ? "lección" : "lecciones"}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                )}

                {renamingSectionId !== section.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); startRename(section); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDeleteButton
                      onConfirm={() => deleteSection(section.id)}
                      message={`Se eliminará "${section.title}" y todas sus lecciones.`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {sections.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {sections.length} {sections.length === 1 ? "sección" : "secciones"} · {totalLessons} {totalLessons === 1 ? "lección" : "lecciones"} en total
        </p>
      )}

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
