"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";
import {
  ArrowLeft, Save, Video, FileQuestion, BookOpen,
  Plus, Trash2, CheckCircle2, Circle, Upload,
  FileText, Image as ImageIcon, File, Link as LinkIcon, X, Pencil, Check, RefreshCw,
} from "lucide-react";
import type { CourseLesson, QuizQuestion, EvaluationCriterion, CourseFile, CourseResource, SectionMinigame } from "./course-types";
import { SectionActivityEditor } from "./section-activity-editor";
import { getMuxPlaybackId, getYouTubeId } from "@/lib/video-url";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });
// API routes en lugar de server actions (más robustos, evitan "Failed to fetch")
async function createMuxUploadUrlViaApi(params: { courseId?: string; lessonId?: string; lessonTitle?: string }) {
  const res = await fetch("/api/mux/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status} al preparar el upload`);
  }
  return res.json() as Promise<{ uploadId: string; uploadUrl: string }>;
}

async function getMuxPlaybackIdViaApi(uploadId: string) {
  const res = await fetch(`/api/mux/playback/${uploadId}`);
  if (!res.ok) throw new Error("Asset aún no disponible");
  return res.json() as Promise<{ playbackId: string; playbackUrl: string }>;
}
import { saveLessonContent } from "@/app/actions/course-actions";
import { stripHtml } from "@/lib/utils";
import { uploadAttachmentDirect } from "@/lib/upload-cloudinary-attachment";
import {
  parseSectionMinigameFromLessonContent,
  stringifySectionMinigamePayload,
} from "@/lib/gate-lesson-content";

interface LessonPageClientProps {
  courseId: string;
  lesson: CourseLesson;
}

const lessonTypeOptions = [
  { value: "video", label: "Video" },
  { value: "text", label: "Texto" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Tarea" },
  { value: "section_minigame", label: "Minijuego" },
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
  const [uploadStep, setUploadStep] = useState<"idle" | "preparing" | "uploading" | "processing" | "done">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [, setUploadId] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  // Quiz config
  const [quizTimeLimit, setQuizTimeLimit] = useState<number | undefined>(lesson.quizTimeLimit);
  const [quizAttempts, setQuizAttempts] = useState<number | undefined>(lesson.quizAttempts);
  const [quizPassingRequired, setQuizPassingRequired] = useState(lesson.quizPassingRequired ?? false);
  const [quizPassingScore, setQuizPassingScore] = useState(lesson.quizPassingScore ?? 70);
  // Minigame
  const [gateMinigame, setGateMinigame] = useState<SectionMinigame | null>(() => {
    if (lesson.type === "section_minigame") {
      return parseSectionMinigameFromLessonContent(lesson.content) ?? { type: "memory", instruction: "", pairs: [] };
    }
    return null;
  });
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

  const handleSave = async (): Promise<boolean> => {
    setSaving(true);
    setSaveError(null);
    try {
      const savedContent = type === "section_minigame" && gateMinigame
        ? stringifySectionMinigamePayload(gateMinigame)
        : content;
      await saveLessonContent(courseId, lesson.id, {
        title, description, type, duration,
        content: savedContent,
        videoUrl: type === "section_minigame" ? "" : videoUrl,
        files: type === "section_minigame" ? [] : files,
        resources: type === "section_minigame" ? [] : resources,
        quizQuestions: type === "quiz" ? quizQuestions : undefined,
        evaluationCriteria: type === "assignment" ? evaluationCriteria : undefined,
        quizTimeLimit: type === "quiz" ? quizTimeLimit : undefined,
        quizAttempts: type === "quiz" ? quizAttempts : undefined,
        quizPassingRequired: type === "quiz" ? quizPassingRequired : undefined,
        quizPassingScore: type === "quiz" && quizPassingRequired ? quizPassingScore : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar lección");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndBack = async () => {
    const ok = await handleSave();
    if (ok) {
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

  // Sube el video via XHR (soporta progreso y maneja CORS correctamente)
  const uploadFileToMux = (uploadUrl: string, file: File): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Error HTTP ${xhr.status} al subir. Intenta de nuevo.`));
      xhr.onerror = () => reject(new Error("Error de red al subir el video. Verifica tu conexión."));
      xhr.ontimeout = () => reject(new Error("Tiempo de espera agotado. Intenta con un archivo más pequeño."));
      xhr.timeout = 30 * 60 * 1000;
      xhr.send(file);
    });

  // Mux tarda en procesar: reintentar hasta que asset_id esté disponible
  const pollForPlaybackId = async (uploadId: string, maxRetries = 15, delayMs = 4000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await getMuxPlaybackIdViaApi(uploadId);
      } catch {
        if (i === maxRetries - 1)
          throw new Error("El video tardó demasiado en procesar. Guarda la lección y recarga en unos minutos.");
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw new Error("No se pudo obtener el playback ID.");
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
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error(`El archivo supera ${maxBytes / (1024 * 1024)} MB`);
      }
      const { url } = await uploadAttachmentDirect(file, "attachments", { courseId });
      setFiles((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: file.name, type: fileType, url, size: file.size },
      ]);
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
    <div className="min-w-0 max-w-full space-y-6">
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
            <Combobox
              label="Tipo de lección *"
              options={lessonTypeOptions}
              value={type}
              onValueChange={(v) => {
                const lessonType = v as CourseLesson["type"];
                setType(lessonType);
                if (lessonType === "section_minigame" && !gateMinigame) {
                  setGateMinigame({ type: "memory", instruction: "", pairs: [] });
                }
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              
              minHeight="80px"
              className="mt-1"
            />
          </div>

          {/* ── Video ── */}
          {type === "video" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">Video de la lección *</label>
              <div className="relative">
                <input
                  ref={videoInputRef}
                  type="file" accept="video/*" className="hidden" id="video-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    detectVideoDuration(file); // duración detectada automáticamente
                    setUploadingVideo(true);
                    setVideoError(null);
                    setUploadProgress(0);
                    setUploadStep("preparing");
                    try {
                      // Paso 1: URL de upload vía API route (no server action)
                      const { uploadUrl, uploadId } = await createMuxUploadUrlViaApi({
                        courseId, lessonId: lesson.id, lessonTitle: title,
                      });
                      setUploadId(uploadId);
                      // Paso 2: subir via XHR con progreso real
                      setUploadStep("uploading");
                      await uploadFileToMux(uploadUrl, file);
                      // Paso 3: esperar a que Mux procese el asset
                      setUploadStep("processing");
                      setUploadProgress(100);
                      const playback = await pollForPlaybackId(uploadId);
                      setVideoUrl(playback.playbackUrl);
                      setUploadStep("done");
                    } catch (err) {
                      setVideoError(err instanceof Error ? err.message : "Error al subir el video. Inténtalo de nuevo.");
                      setUploadStep("idle");
                      setUploadProgress(0);
                    } finally {
                      setUploadingVideo(false);
                      // Permite volver a seleccionar el mismo archivo (p. ej. tras reemplazar)
                      e.target.value = "";
                    }
                  }}
                />

                {/* Área de clic — solo cuando no hay video ni upload en curso */}
                {!uploadingVideo && !videoUrl && (
                  <label
                    htmlFor="video-upload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-10 transition-all hover:border-primary/60 hover:bg-primary/10"
                  >
                    <Video className="h-10 w-10 text-primary" />
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-foreground">Haz clic para subir un video</p>
                      <p className="text-sm text-muted-foreground">MP4, MOV, AVI, WebM (máx. 500MB)</p>
                      {isDetectingDuration && (
                        <p className="text-xs text-muted-foreground">Detectando duración…</p>
                      )}
                    </div>
                  </label>
                )}

                {/* Progreso de upload */}
                {uploadingVideo && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 animate-pulse">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <div className="w-full max-w-xs text-center space-y-3">
                      {uploadStep === "preparing" && (
                        <p className="text-sm font-medium text-foreground">Preparando upload…</p>
                      )}
                      {uploadStep === "uploading" && (
                        <>
                          <p className="text-sm font-medium text-foreground">Subiendo video… {uploadProgress}%</p>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </>
                      )}
                      {uploadStep === "processing" && (
                        <p className="text-sm font-medium text-foreground">Procesando en Mux… puede tardar hasta 1 min</p>
                      )}
                      <p className="text-xs text-muted-foreground">No cierres esta pestaña</p>
                    </div>
                  </div>
                )}

                {/* Video subido con éxito: previsualización + reemplazar/eliminar */}
                {!uploadingVideo && videoUrl && (() => {
                  const muxId = getMuxPlaybackId(videoUrl);
                  const ytId = getYouTubeId(videoUrl);
                  return (
                    <div className="space-y-3">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                        {muxId ? (
                          <MuxPlayer playbackId={muxId} streamType="on-demand" className="h-full w-full" />
                        ) : ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={videoUrl} controls className="h-full w-full" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          <span className="text-xs font-medium text-foreground">Video listo</span>
                        </div>
                        {isDetectingDuration && (
                          <span className="text-xs text-muted-foreground">Detectando duración…</span>
                        )}
                        {duration && !isDetectingDuration && (
                          <span className="text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
                            {duration}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Reemplazar video
                        </Button>
                        <ConfirmDeleteButton
                          title="¿Eliminar el video de esta lección?"
                          message="Se quitará el video actual. La lección se quedará sin contenido hasta que subas uno nuevo — recuerda guardar los cambios."
                          onConfirm={() => {
                            setVideoUrl("");
                            setDuration("");
                            setUploadStep("idle");
                            setUploadProgress(0);
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {videoError && <p className="mt-2 text-xs text-destructive">{videoError}</p>}
              </div>

              {/* Duración: siempre automática desde el archivo */}
              {duration && !uploadingVideo && (
                <p className="text-sm text-muted-foreground">
                  Duración detectada automáticamente: <strong>{duration}</strong>
                </p>
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
                    <Input type="number" min="1" value={quizTimeLimit ?? ""} onChange={(e) => setQuizTimeLimit(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Intentos permitidos</label>
                    <Input type="number" min="1" value={quizAttempts ?? ""} onChange={(e) => setQuizAttempts(e.target.value ? Number(e.target.value) : undefined)} />
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
                      <Combobox
                        value={newQuestionType}
                        onValueChange={(val) => {
                          const v = val as typeof newQuestionType;
                          setNewQuestionType(v);
                          setNewQuestionCorrectAnswer(null);
                          setNewQuestionCorrectAnswers(new Set());
                          if (v === "true-false") setNewQuestionOptions(["Verdadero", "Falso"]);
                          else setNewQuestionOptions(["", ""]);
                        }}
                        options={[
                          { value: "multiple-choice", label: "Opción múltiple" },
                          { value: "true-false", label: "Verdadero / Falso" },
                          { value: "checkbox", label: "Casillas (varias correctas)" },
                        ]}
                        searchable={false}
                        allowDeselect={false}
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

          {/* ── Minijuego ── */}
          {type === "section_minigame" && gateMinigame && (
            <SectionActivityEditor
              mode="lessonMinigame"
              minigame={gateMinigame}
              onMinigameChange={(m) => setGateMinigame(m ?? { type: "memory", instruction: "", pairs: [] })}
              quiz={undefined}
              onQuizChange={() => {}}
            />
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
            <p className="text-xs text-muted-foreground">
              PDF, Office, imágenes, ZIP… (máx. 10 MB por archivo)
            </p>
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
              <Input value={newResourceTitle} onChange={(e) => setNewResourceTitle(e.target.value)} />
              <div className="flex gap-2">
                <Input type="url" value={newResourceUrl} onChange={(e) => setNewResourceUrl(e.target.value)} className="flex-1" />
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
