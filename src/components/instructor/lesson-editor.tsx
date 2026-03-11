"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X, Video, FileQuestion, BookOpen, Plus, Trash2, CheckCircle2, Circle, Upload, FileText, Image as ImageIcon, File, Link as LinkIcon } from "lucide-react";
import type { CourseLesson, QuizQuestion, EvaluationCriterion, CourseFile, CourseResource } from "./course-types";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createMuxUploadUrl, getMuxPlaybackId } from "@/app/actions/mux-actions";

interface LessonEditorProps {
  lesson: CourseLesson;
  onSave: (updates: Partial<CourseLesson>) => void;
  onCancel: () => void;
}

const lessonTypeOptions = [
  { value: "video", label: "Video" },
  { value: "text", label: "Texto" },
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Tarea" },
];

export const LessonEditor = ({ lesson, onSave, onCancel }: LessonEditorProps) => {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [type, setType] = useState<CourseLesson["type"]>(lesson.type);
  const [duration, setDuration] = useState(lesson.duration || "");
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [isDetectingDuration, setIsDetectingDuration] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(lesson.quizQuestions || []);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>(lesson.evaluationCriteria || []);
  const [files, setFiles] = useState<CourseFile[]>(lesson.files || []);
  const [resources, setResources] = useState<CourseResource[]>(lesson.resources || []);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [newCriterionText, setNewCriterionText] = useState("");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [, setUploadId] = useState<string | null>(null);
  
  // Estados para crear pregunta de opción múltiple
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", ""]);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState<number | null>(null);
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);

  const handleSave = () => {
    onSave({
      title,
      description,
      type,
      duration,
      content,
      videoUrl,
      files,
      resources,
      quizQuestions: type === "quiz" ? quizQuestions : undefined,
      evaluationCriteria: type === "assignment" ? evaluationCriteria : undefined,
    });
  };

  const handleAddFile = async (file: File) => {
    const fileType = file.type.includes("pdf") ? "pdf" :
                     file.type.includes("image") ? "image" :
                     file.type.includes("document") || file.name.endsWith(".docx") || file.name.endsWith(".doc") ? "document" :
                     "other";

    setUploadingFile(true);
    setFileUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/attachment", { method: "POST", body: form });
      if (!res.ok) throw new Error("Error al subir archivo");
      const { url } = await res.json();

      setFiles((prev) => [...prev, {
        id: crypto.randomUUID(),
        name: file.name,
        type: fileType,
        url,
        size: file.size,
      }]);
    } catch (err) {
      setFileUploadError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const handleAddResource = () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;

    const newResource: CourseResource = {
      id: crypto.randomUUID(),
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
      type: "link",
    };

    setResources([...resources, newResource]);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources(resources.filter((r) => r.id !== resourceId));
  };

  const getFileIcon = (type: CourseFile["type"]) => {
    switch (type) {
      case "pdf":
        return FileText;
      case "image":
        return ImageIcon;
      case "document":
        return File;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) return;
    if (newQuestionOptions.filter((opt) => opt.trim()).length < 2) {
      alert("Debes agregar al menos 2 opciones");
      return;
    }
    if (newQuestionCorrectAnswer === null) {
      alert("Debes seleccionar la respuesta correcta");
      return;
    }
    
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: newQuestionTitle.trim(),
      type: "multiple-choice",
      options: newQuestionOptions.filter((opt) => opt.trim()),
      correctAnswer: newQuestionCorrectAnswer,
      points: newQuestionPoints,
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
    setNewQuestionTitle("");
    setNewQuestionOptions(["", ""]);
    setNewQuestionCorrectAnswer(null);
    setNewQuestionPoints(10);
  };

  const handleAddOption = () => {
    setNewQuestionOptions([...newQuestionOptions, ""]);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const updated = [...newQuestionOptions];
    updated[index] = value;
    setNewQuestionOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (newQuestionOptions.length <= 2) {
      alert("Debes tener al menos 2 opciones");
      return;
    }
    const updated = newQuestionOptions.filter((_, i) => i !== index);
    setNewQuestionOptions(updated);
    if (newQuestionCorrectAnswer === index) {
      setNewQuestionCorrectAnswer(null);
    } else if (newQuestionCorrectAnswer !== null && newQuestionCorrectAnswer > index) {
      setNewQuestionCorrectAnswer(newQuestionCorrectAnswer - 1);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== questionId));
  };

  const handleAddCriterion = () => {
    if (!newCriterionText.trim()) return;
    const newCriterion: EvaluationCriterion = {
      id: crypto.randomUUID(),
      criterion: newCriterionText.trim(),
      points: 10,
    };
    setEvaluationCriteria([...evaluationCriteria, newCriterion]);
    setNewCriterionText("");
  };

  const handleDeleteCriterion = (criterionId: string) => {
    setEvaluationCriteria(evaluationCriteria.filter((c) => c.id !== criterionId));
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return minutes > 0 
        ? `${hours} hora${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`
        : `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      return secs > 0
        ? `${minutes} min${minutes > 1 ? 's' : ''} ${secs} seg${secs > 1 ? 's' : ''}`
        : `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    return `${secs} seg${secs > 1 ? 's' : ''}`;
  };

  const detectVideoDuration = (file: File) => {
    setIsDetectingDuration(true);
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationInSeconds = video.duration;
      const formattedDuration = formatDuration(durationInSeconds);
      setDuration(formattedDuration);
      setIsDetectingDuration(false);
    };
    
    video.onerror = () => {
      setIsDetectingDuration(false);
      console.error('Error al cargar el video para detectar duración');
    };
    
    video.src = URL.createObjectURL(file);
  };

  return (
    <Card className="border-2 border-primary bg-card/90">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Editar lección</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Título de la lección *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Introducción a las variables"
              />
            </div>
            <div>
              <Select
                label="Tipo de lección *"
                options={lessonTypeOptions}
                value={type}
                onChange={(e) => setType(e.target.value as CourseLesson["type"])}
              />
            </div>
          </div>

          <div>
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe qué aprenderán en esta lección"
              rows={3}
            />
          </div>

          {/* Contenido específico según el tipo de lección */}
          {type === "video" && (
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">
                  Video de la lección *
                </label>
                <div className="space-y-4">
                  {/* Opción 1: Subir video (más prominente) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Subir video desde tu dispositivo
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="video-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            detectVideoDuration(file);
                            setUploadingVideo(true);
                            setVideoError(null);
                            try {
                              const { uploadUrl, uploadId } = await createMuxUploadUrl("*");
                              setUploadId(uploadId);
                              const res = await fetch(uploadUrl, {
                                method: "PUT",
                                headers: { "Content-Type": file.type },
                                body: file,
                              });
                              if (!res.ok) {
                                throw new Error(`Mux upload failed: ${res.statusText}`);
                              }
                              // Nota: en un flujo real se consultaría el asset para obtener playback_id
                              // Recuperar playbackId después del procesado
                              const playback = await getMuxPlaybackId(uploadId);
                              setVideoUrl(playback.playbackUrl);
                            } catch (err) {
                              setVideoError(err instanceof Error ? err.message : "Error al subir video");
                              setVideoUrl("");
                              setDuration("");
                              setUploadId(null);
                            } finally {
                              setUploadingVideo(false);
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 p-12 transition-all hover:border-primary/60 hover:bg-primary/15"
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 shadow-lg">
                          <Video className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-semibold text-foreground">
                            Haz clic para subir un video
                          </p>
                          <p className="text-sm text-muted-foreground">
                            O arrastra el archivo aquí
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Formatos: MP4, MOV, AVI, WebM (máx. 500MB)
                          </p>
                        </div>
                      </label>
                      {videoUrl && videoUrl.includes(".") && !videoUrl.startsWith("http") && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                            <Video className="h-4 w-4 text-primary" />
                            <span className="text-sm text-foreground">{videoUrl}</span>
                            {isDetectingDuration && (
                              <span className="text-xs text-muted-foreground">Detectando duración...</span>
                            )}
                            {uploadingVideo && (
                              <span className="text-xs text-muted-foreground">Subiendo a Mux...</span>
                            )}
                            {duration && !isDetectingDuration && (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground ml-auto">
                                Duración: {duration}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVideoUrl("");
                                setDuration("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Separador O */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">O</span>
                    </div>
                  </div>

                  {/* Opción 2: URL del video */}
                  <div>
                    <Input
                      label="URL del video (YouTube, Vimeo, etc.)"
                      value={videoUrl.startsWith("http") ? videoUrl : ""}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Puedes usar enlaces de YouTube, Vimeo u otras plataformas de video
                    </p>
                    {videoError && (
                      <p className="mt-2 text-xs text-destructive">{videoError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === "text" && (
            <div>
              <Textarea
                label="Contenido de la lección *"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido completo de la lección. Puedes usar formato Markdown para darle estructura..."
                rows={12}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Usa Markdown para formatear el texto (negritas, listas, enlaces, etc.)
              </p>
            </div>
          )}

          {type === "quiz" && (
            <div className="space-y-4">
              <div>
                <Textarea
                  label="Instrucciones del quiz *"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe las instrucciones y el formato del quiz..."
                  rows={4}
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    <h5 className="font-semibold text-foreground">Preguntas del quiz</h5>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                      {quizQuestions.length} {quizQuestions.length === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </div>
                </div>
                
                {/* Lista de preguntas */}
                {quizQuestions.length > 0 && (
                  <div className="space-y-3">
                    {quizQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-lg border border-border bg-card p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{question.question}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((option, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 rounded-md p-2 text-sm ${
                                      question.correctAnswer === idx
                                        ? "bg-primary/10 border border-primary/30"
                                        : "bg-muted/30"
                                    }`}
                                  >
                                    {question.correctAnswer === idx ? (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className={question.correctAnswer === idx ? "font-medium text-primary" : "text-foreground"}>
                                      {option}
                                    </span>
                                    {question.correctAnswer === idx && (
                                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] bg-primary/10 text-primary ml-auto">
                                        Correcta
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                Opción múltiple
                              </span>
                              {question.points && (
                                <span className="text-xs text-muted-foreground">
                                  {question.points} puntos
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para agregar nueva pregunta */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Nueva pregunta de opción múltiple
                    </label>
                    <Input
                      placeholder="Escribe la pregunta..."
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Opciones de respuesta</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="h-7 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Agregar opción
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newQuestionOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNewQuestionCorrectAnswer(index)}
                            className="flex-shrink-0"
                          >
                            {newQuestionCorrectAnswer === index ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            )}
                          </button>
                          <Input
                            placeholder={`Opción ${index + 1}`}
                            value={option}
                            onChange={(e) => handleUpdateOption(index, e.target.value)}
                            className="flex-1"
                          />
                          {newQuestionOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Haz clic en el círculo para marcar la respuesta correcta
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Puntos
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={newQuestionPoints}
                        onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                    disabled={!newQuestionTitle.trim() || newQuestionOptions.filter((opt) => opt.trim()).length < 2 || newQuestionCorrectAnswer === null}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar pregunta
                  </Button>
                </div>
              </div>
            </div>
          )}

          {type === "assignment" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Instrucciones de la tarea *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Describe claramente qué deben hacer los estudiantes en esta tarea. Puedes usar formato de texto enriquecido..."
                />
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h5 className="font-semibold text-foreground">Criterios de evaluación</h5>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                      {evaluationCriteria.length} {evaluationCriteria.length === 1 ? "criterio" : "criterios"}
                    </span>
                  </div>
                </div>

                {/* Lista de criterios */}
                {evaluationCriteria.length > 0 && (
                  <div className="space-y-2">
                    {evaluationCriteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-start justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{criterion.criterion}</p>
                          {criterion.description && (
                            <p className="mt-1 text-xs text-muted-foreground">{criterion.description}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            {criterion.points && (
                              <span className="text-xs text-muted-foreground">
                                {criterion.points} puntos
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCriterion(criterion.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Agregar nuevo criterio */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Input
                    placeholder="Escribe el criterio de evaluación..."
                    value={newCriterionText}
                    onChange={(e) => setNewCriterionText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCriterion();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCriterion}
                    disabled={!newCriterionText.trim()}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar criterio
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Materiales Extra - Disponible para todos los tipos de lección */}
          <Separator className="my-6" />
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Materiales extra (opcional)
              </h4>
              <p className="text-sm text-muted-foreground">
                Agrega archivos adicionales y recursos que complementen esta lección
              </p>
            </div>

            {/* Archivos */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold text-foreground">Archivos</h5>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                    {files.length} {files.length === 1 ? "archivo" : "archivos"}
                  </span>
                </div>
              </div>

              {/* Lista de archivos */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                                {file.type.toUpperCase()}
                              </span>
                              {file.size && (
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Agregar archivo */}
              <div className="pt-2 border-t border-border">
                <input
                  type="file"
                  id="material-file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddFile(file);
                      e.target.value = "";
                    }
                  }}
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="material-file-upload"
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 ${uploadingFile ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? "Subiendo..." : "Subir archivo (PDF, Word, Imagen)"}
                </label>
                {fileUploadError && (
                  <p className="mt-1 text-xs text-destructive">{fileUploadError}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Los estudiantes podrán descargar estos archivos como material complementario
                </p>
              </div>
            </div>

            {/* Recursos/Enlaces */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  <h5 className="font-semibold text-foreground">Enlaces y recursos</h5>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] border border-border bg-background text-muted-foreground">
                    {resources.length} {resources.length === 1 ? "recurso" : "recursos"}
                  </span>
                </div>
              </div>

              {/* Lista de recursos */}
              {resources.length > 0 && (
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{resource.title}</p>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {resource.url}
                          </a>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar recurso */}
              <div className="space-y-3 pt-2 border-t border-border">
                <Input
                  placeholder="Título del recurso (ej: Documentación oficial)"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                />
                <Input
                  placeholder="URL del recurso (https://...)"
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  type="url"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddResource}
                  disabled={!newResourceTitle.trim() || !newResourceUrl.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar enlace
                </Button>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
