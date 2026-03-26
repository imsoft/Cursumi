"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, Video, FileQuestion, BookOpen,
  Plus, Trash2, CheckCircle2, Circle, Upload,
  FileText, Image as ImageIcon, File, Link as LinkIcon, X, Pencil, Check,
} from "lucide-react";
import type { CourseLesson, QuizQuestion, EvaluationCriterion, CourseFile, CourseResource } from "./course-types";
import { createMuxUploadUrl, getMuxPlaybackId } from "@/app/actions/mux-actions";
import { saveLessonContent } from "@/app/actions/course-actions";
import { stripHtml } from "@/lib/utils";

interface LessonPageClientProps {
  courseId: string;
  lesson: CourseLesson;
}

const lessonTypeOptions = [
  { value: "video", label: "Video" },
  { value: "text", label: "Texto" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Tarea" },
];

export function LessonPageClient({ courseId, lesson }: LessonPageClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [type, setType] = useState<CourseLesson["type"]>(lesson.type);
  const [duration, setDuration] = useState(lesson.duration || "");
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(lesson.quizQuestions || []);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>(lesson.evaluationCriteria || []);
  const [files, setFiles] = useState<CourseFile[]>(lesson.files || []);
  const [resources, setResources] = useState<CourseResource[]>(lesson.resources || []);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [, setUploadId] = useState<string | null>(null);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  // Quiz config
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | undefined>(lesson.quizTimeLimit);
  const [quizAttempts, setQuizAttempts] = useState<number | undefined>(lesson.quizAttempts);
  const [quizPassingRequired, setQuizPassingRequired] = useState(lesson.quizPassingRequired ?? false);
  const [quizPassingScore, setQuizPassingScore] = useState(lesson.quizPassingScore ?? 70);
  // New question form
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"multiple-choice" | "true-false" | "checkbox">("multiple-choice");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", ""]);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState<number | null>(null);
  const [newQuestionCorrectAnswers, setNewQuestionCorrectAnswers] = useState<Set<number>>(new Set());
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newCriterionText, setNewCriterionText] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editResourceTitle, setEditResourceTitle] = useState("");
  const [editResourceUrl, setEditResourceUrl] = useState("");

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveLessonContent(courseId, lesson.id, {
        title, description, type, duration, content, videoUrl,
        files, resources, quizQuestions, evaluationCriteria,
        quizTimeLimit: type === "quiz" ? quizTimeLimit : undefined,
        quizAttempts: type === "quiz" ? quizAttempts : undefined,
        quizPassingRequired: type === "quiz" ? quizPassingRequired : undefined,
        quizPassingScore: type === "quiz" && quizPassingRequired ? quizPassingScore : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar lección");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndBack = async () => {
    await handleSave();
    if (!saveError) {
      router.push(`/instructor/courses/${courseId}/edit`);
    }
  };

  // ── Video ───────────────────────────────────────────────────────────────────
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
    if (m > 0) return s > 0 ? `${m}min ${s}s` : `${m}min`;
    return `${s}s`;
  };

  const detectVideoDuration = (file: File) => {
    setIsDetectingDuration(true);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      setDuration(formatDuration(video.duration));
      setIsDetectingDuration(false);
    };
    video.onerror = () => setIsDetectingDuration(false);
    video.src = URL.createObjectURL(file);
  };

  // ── Files ──────────────────────────────────────────────────────────────────
  const handleAddFile = async (file: File) => {
    const fileType = file.type.includes("pdf") ? "pdf"
      : file.type.includes("image") ? "image"
      : file.type.includes("document") || file.name.endsWith(".docx") || file.name.endsWith(".doc") ? "document"
      : "other";
    setUploadingFile(true);
    setFileUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/attachment", { method: "POST", body: form });
      if (!res.ok) throw new Error("Error al subir archivo");
      const { url } = await res.json();
      setFiles((prev) => [...prev, { id: crypto.randomUUID(), name: file.name, type: fileType, url, size: file.size }]);
    } catch (err) {
      setFileUploadError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (t: CourseFile["type"]) =>
    t === "pdf" ? FileText : t === "image" ? ImageIcon : File;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const resetQuestionForm = () => {
    setEditingQuestionId(null);
    setNewQuestionTitle("");
    setNewQuestionType("multiple-choice");
    setNewQuestionOptions(["", ""]);
    setNewQuestionCorrectAnswer(null);
    setNewQuestionCorrectAnswers(new Set());
    setNewQuestionPoints(10);
  };

  const startEditQuestion = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setNewQuestionTitle(q.question);
    setNewQuestionType((q.type === "true-false" || q.type === "checkbox") ? q.type : "multiple-choice");
    setNewQuestionOptions(q.options ? [...q.options] : ["", ""]);
    setNewQuestionCorrectAnswer(typeof q.correctAnswer === "number" ? q.correctAnswer : null);
    setNewQuestionCorrectAnswers(new Set(q.correctAnswers ?? []));
    setNewQuestionPoints(q.points ?? 10);
  };

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) return;

    let newQuestion: QuizQuestion;

    if (newQuestionType === "true-false") {
      if (newQuestionCorrectAnswer === null) return;
      newQuestion = {
        id: editingQuestionId ?? crypto.randomUUID(), question: newQuestionTitle.trim(), type: "true-false",
        options: ["Verdadero", "Falso"], correctAnswer: newQuestionCorrectAnswer, points: newQuestionPoints,
      };
    } else if (newQuestionType === "checkbox") {
      const validOptions = newQuestionOptions.filter((o) => o.trim());
      if (validOptions.length < 1 || newQuestionCorrectAnswers.size === 0) return;
      newQuestion = {
        id: editingQuestionId ?? crypto.randomUUID(), question: newQuestionTitle.trim(), type: "checkbox",
        options: validOptions, correctAnswers: Array.from(newQuestionCorrectAnswers).sort(), points: newQuestionPoints,
      };
    } else {
      const validOptions = newQuestionOptions.filter((o) => o.trim());
      if (validOptions.length < 1 || newQuestionCorrectAnswer === null) return;
      newQuestion = {
        id: editingQuestionId ?? crypto.randomUUID(), question: newQuestionTitle.trim(), type: "multiple-choice",
        options: validOptions, correctAnswer: newQuestionCorrectAnswer, points: newQuestionPoints,
      };
    }

    if (editingQuestionId) {
      setQuizQuestions((prev) => prev.map((q) => q.id === editingQuestionId ? newQuestion : q));
    } else {
      setQuizQuestions((prev) => [...prev, newQuestion]);
    }

    resetQuestionForm();
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestionOptions.length <= 1) return;
    setNewQuestionOptions((prev) => prev.filter((_, i) => i !== index));
    if (newQuestionCorrectAnswer === index) setNewQuestionCorrectAnswer(null);
    else if (newQuestionCorrectAnswer !== null && newQuestionCorrectAnswer > index) setNewQuestionCorrectAnswer(newQuestionCorrectAnswer - 1);
    const newCorrects = new Set<number>();
    newQuestionCorrectAnswers.forEach((i) => { if (i < index) newCorrects.add(i); else if (i > index) newCorrects.add(i - 1); });
    setNewQuestionCorrectAnswers(newCorrects);
  };

  // ── Assignment ──────────────────────────────────────────────────────────────
  const handleAddCriterion = () => {
    if (!newCriterionText.trim()) return;
    setEvaluationCriteria((prev) => [...prev, {
      id: crypto.randomUUID(), criterion: newCriterionText.trim(), points: 10,
    }]);
    setNewCriterionText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
        <div className="flex gap-2">
          {saveError && (
            <span className="flex items-center gap-1 text-sm text-destructive">
              {saveError}
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Guardado
            </span>
          )}
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
          <Button onClick={handleSaveAndBack} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Guardar y volver
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar lección</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rellena el contenido de esta lección y guarda cuando termines.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Title & Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Título de la lección *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select
              label="Tipo de lección *"
              options={lessonTypeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as CourseLesson["type"])}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe esta lección…"
              minHeight="80px"
              className="mt-1"
            />
          </div>

          {/* ── Video ── */}
          {type === "video" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">Video de la lección *</label>
              <div>
                <input
                  type="file" accept="video/*" className="hidden" id="video-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    detectVideoDuration(file);
                    setUploadingVideo(true);
                    setVideoError(null);
                    try {
                      const { uploadUrl, uploadId } = await createMuxUploadUrl("*", {
                        courseId,
                        lessonId: lesson.id,
                        lessonTitle: title,
                      });
                      setUploadId(uploadId);
                      const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
                      if (!res.ok) throw new Error("Mux upload failed");
                      const playback = await getMuxPlaybackId(uploadId);
                      setVideoUrl(playback.playbackUrl);
                    } catch (err) {
                      setVideoError(err instanceof Error ? err.message : "Error al subir video");
                    } finally {
                      setUploadingVideo(false);
                    }
                  }}
                />
                <label
                  htmlFor="video-upload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-10 transition-all hover:border-primary/60 hover:bg-primary/10"
                >
                  <Video className="h-10 w-10 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Haz clic para subir un video</p>
                    <p className="text-sm text-muted-foreground">MP4, MOV, AVI, WebM (máx. 500MB)</p>
                    {uploadingVideo && <p className="text-xs text-primary mt-1">Subiendo a Mux...</p>}
                    {isDetectingDuration && <p className="text-xs text-muted-foreground mt-1">Detectando duración...</p>}
                  </div>
                </label>
                {videoError && <p className="mt-2 text-xs text-destructive">{videoError}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><Separator /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">O</span>
                </div>
              </div>

              <Input
                label="URL del video (YouTube, Vimeo, etc.)"
                value={videoUrl.startsWith("http") ? videoUrl : ""}
                onChange={(e) => setVideoUrl(e.target.value)}
              />

              {duration && (
                <p className="text-sm text-muted-foreground">Duración detectada: <strong>{duration}</strong></p>
              )}
              {!duration && (
                <Input
                  label="Duración (opcional, ej: 10 min)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              )}
            </div>
          )}

          {/* ── Text ── */}
          {type === "text" && (
            <div>
              <label className="text-sm font-medium text-foreground">Contenido de la lección *</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de la lección…"
                minHeight="250px"
                className="mt-1"
              />
            </div>
          )}

          {/* ── Quiz ── */}
          {type === "quiz" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Instrucciones del quiz *</label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Escribe las instrucciones del quiz…"
                  minHeight="100px"
                  className="mt-1"
                />
              </div>

              {/* Quiz config */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <h5 className="text-sm font-semibold text-foreground">Configuración del quiz (opcional)</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Tiempo límite (minutos)</label>
                    <Input type="number" min="1" placeholder="Sin límite" value={quizTimeLimit ?? ""} onChange={(e) => setQuizTimeLimit(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Intentos permitidos</label>
                    <Input type="number" min="1" placeholder="Ilimitados" value={quizAttempts ?? ""} onChange={(e) => setQuizAttempts(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={quizPassingRequired} onChange={(e) => setQuizPassingRequired(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">Requiere aprobar para continuar</span>
                  </label>
                  {quizPassingRequired && (
                    <div className="ml-6">
                      <label className="mb-1 block text-xs font-medium text-foreground">Puntaje mínimo (%)</label>
                      <Input type="number" min="1" max="100" value={quizPassingScore} onChange={(e) => setQuizPassingScore(Number(e.target.value))} className="w-32" />
                    </div>
                  )}
                </div>
              </div>

              {/* Questions list */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold text-foreground">Preguntas del quiz</h5>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                    {quizQuestions.length} {quizQuestions.length === 1 ? "pregunta" : "preguntas"}
                  </span>
                </div>

                {quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    {quizQuestions.map((question) => {
                      const isCorrect = (idx: number) =>
                        question.type === "checkbox" ? question.correctAnswers?.includes(idx) : question.correctAnswer === idx;
                      const typeLabel = question.type === "true-false" ? "V / F" : question.type === "checkbox" ? "Casillas" : "Opción múltiple";
                      return (
                        <div key={question.id} className={`rounded-lg border p-4 space-y-2 ${editingQuestionId === question.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{stripHtml(question.question)}</p>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 rounded-md p-2 text-sm ${isCorrect(idx) ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
                                      {isCorrect(idx) ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                      <span className={isCorrect(idx) ? "font-medium text-primary" : "text-foreground"}>{stripHtml(option)}</span>
                                      {isCorrect(idx) && <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-primary/10 text-primary ml-auto">Correcta</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">{typeLabel}</span>
                                {question.points && <span className="text-xs text-muted-foreground">{question.points} puntos</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button variant="ghost" size="sm" onClick={() => startEditQuestion(question)} title="Editar pregunta">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setQuizQuestions((prev) => prev.filter((x) => x.id !== question.id))} title="Eliminar pregunta">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New/Edit question form */}
                <div className="space-y-4 pt-4 border-t border-border">
                  {editingQuestionId && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">Editando pregunta</p>
                      <Button variant="ghost" size="sm" onClick={resetQuestionForm}>
                        <X className="h-4 w-4 mr-1" />Cancelar
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Tipo de pregunta</label>
                      <Select
                        value={newQuestionType}
                        onChange={(e) => {
                          const val = e.target.value as typeof newQuestionType;
                          setNewQuestionType(val);
                          setNewQuestionCorrectAnswer(null);
                          setNewQuestionCorrectAnswers(new Set());
                          if (val === "true-false") setNewQuestionOptions(["Verdadero", "Falso"]);
                          else setNewQuestionOptions(["", ""]);
                        }}
                        options={[
                          { value: "multiple-choice", label: "Opción múltiple" },
                          { value: "true-false", label: "Verdadero / Falso" },
                          { value: "checkbox", label: "Casillas (varias correctas)" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Puntos</label>
                      <Input type="number" min="1" value={newQuestionPoints} onChange={(e) => setNewQuestionPoints(Number(e.target.value))} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Pregunta</label>
                    <Input value={newQuestionTitle} onChange={(e) => setNewQuestionTitle(e.target.value)} />
                  </div>

                  {newQuestionType === "true-false" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Respuesta correcta</label>
                      <div className="flex gap-4">
                        {["Verdadero", "Falso"].map((label, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewQuestionCorrectAnswer(idx)}
                            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                              newQuestionCorrectAnswer === idx ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:border-primary/50"
                            }`}
                          >
                            {newQuestionCorrectAnswer === idx ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Opciones de respuesta</label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setNewQuestionOptions((prev) => [...prev, ""])} className="h-7 text-xs">
                          <Plus className="mr-1 h-3 w-3" />Agregar opción
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newQuestionOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (newQuestionType === "checkbox") {
                                  const next = new Set(newQuestionCorrectAnswers);
                                  if (next.has(idx)) next.delete(idx); else next.add(idx);
                                  setNewQuestionCorrectAnswers(next);
                                } else {
                                  setNewQuestionCorrectAnswer(idx);
                                }
                              }}
                              className="shrink-0"
                            >
                              {newQuestionType === "checkbox" ? (
                                newQuestionCorrectAnswers.has(idx)
                                  ? <CheckCircle2 className="h-5 w-5 text-primary" />
                                  : <div className="h-5 w-5 rounded border-2 border-muted-foreground hover:border-primary transition-colors" />
                              ) : newQuestionCorrectAnswer === idx
                                ? <CheckCircle2 className="h-5 w-5 text-primary" />
                                : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                              }
                            </button>
                            <Input value={opt} onChange={(e) => { const u = [...newQuestionOptions]; u[idx] = e.target.value; setNewQuestionOptions(u); }} className="flex-1" />
                            {newQuestionOptions.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(idx)} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {newQuestionType === "checkbox" ? "Haz clic en las casillas para marcar las respuestas correctas" : "Haz clic en el círculo para marcar la respuesta correcta"}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                    disabled={
                      !newQuestionTitle.trim() ||
                      (newQuestionType === "true-false" && newQuestionCorrectAnswer === null) ||
                      (newQuestionType === "multiple-choice" && (newQuestionOptions.filter((o) => o.trim()).length < 1 || newQuestionCorrectAnswer === null)) ||
                      (newQuestionType === "checkbox" && (newQuestionOptions.filter((o) => o.trim()).length < 1 || newQuestionCorrectAnswers.size === 0))
                    }
                    className="w-full"
                  >
                    {editingQuestionId ? (
                      <><Check className="mr-2 h-4 w-4" />Guardar cambios</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" />Agregar pregunta</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Assignment ── */}
          {type === "assignment" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Instrucciones de la tarea *</label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold text-foreground">Criterios de evaluación</h5>
                </div>
                {evaluationCriteria.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <span className="text-sm font-medium">{c.criterion}</span>
                    <Button variant="ghost" size="sm" onClick={() => setEvaluationCriteria((prev) => prev.filter((x) => x.id !== c.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Input
                    placeholder="Criterio de evaluación..."
                    value={newCriterionText}
                    onChange={(e) => setNewCriterionText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCriterion(); } }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddCriterion} disabled={!newCriterionText.trim()}>
                    <Plus className="mr-1 h-4 w-4" />Agregar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Material adicional ── */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Material de apoyo (opcional)</h3>

          {/* Files */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Archivos</span>
              <span className="text-xs text-muted-foreground">({files.length})</span>
            </div>
            {files.map((f) => {
              const FIcon = getFileIcon(f.type);
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <FIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.type.toUpperCase()} {formatFileSize(f.size)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <input
              type="file" id="material-file" className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.zip,.txt"
              disabled={uploadingFile}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { handleAddFile(f); e.target.value = ""; } }}
            />
            <label
              htmlFor="material-file"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-3 text-sm transition-colors hover:border-primary/60 hover:bg-primary/10 ${uploadingFile ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload className="h-4 w-4" />
              {uploadingFile ? "Subiendo..." : "Subir archivo"}
            </label>
            {fileUploadError && <p className="text-xs text-destructive">{fileUploadError}</p>}
          </div>

          <Separator />

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Recursos y enlaces</span>
            </div>
            {resources.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                {editingResourceId === r.id ? (
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Input
                      value={editResourceTitle}
                      onChange={(e) => setEditResourceTitle(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Input
                      value={editResourceUrl}
                      onChange={(e) => setEditResourceUrl(e.target.value)}
                      className="h-8 text-sm"
                      type="url"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => {
                          if (!editResourceTitle.trim() || !editResourceUrl.trim()) return;
                          setResources((prev) => prev.map((x) => x.id === r.id ? { ...x, title: editResourceTitle.trim(), url: editResourceUrl.trim() } : x));
                          setEditingResourceId(null);
                        }}
                        disabled={!editResourceTitle.trim() || !editResourceUrl.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" /> Guardar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingResourceId(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.title}</p>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{r.url}</a>
                  </div>
                )}
                {editingResourceId !== r.id && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingResourceId(r.id); setEditResourceTitle(r.title); setEditResourceUrl(r.url); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setResources((prev) => prev.filter((x) => x.id !== r.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            <div className="space-y-2">
              <Input placeholder="Título del recurso" value={newResourceTitle} onChange={(e) => setNewResourceTitle(e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="URL (https://...)" type="url" value={newResourceUrl} onChange={(e) => setNewResourceUrl(e.target.value)} className="flex-1" />
                <Button
                  variant="outline" size="sm"
                  onClick={() => {
                    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
                    setResources((prev) => [...prev, { id: crypto.randomUUID(), title: newResourceTitle.trim(), url: newResourceUrl.trim(), type: "link" }]);
                    setNewResourceTitle(""); setNewResourceUrl("");
                  }}
                  disabled={!newResourceTitle.trim() || !newResourceUrl.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" />Añadir
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-between pb-6">
        <Button variant="ghost" asChild>
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
          <Button onClick={handleSaveAndBack} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Guardar y volver al curso
          </Button>
        </div>
      </div>
    </div>
  );
}
