"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

type LessonType = "video" | "text" | "quiz" | "assignment";

interface LessonAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}

interface LessonResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface LessonData {
  id: string;
  title: string;
  type: LessonType;
  content: string | null;
  videoUrl: string | null;
  duration: string | null;
  attachments?: LessonAttachment[] | null;
  resources?: LessonResource[] | null;
}

interface SidebarLesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string | null;
  completed: boolean;
}

interface SidebarSection {
  id: string;
  title: string;
  lessons: SidebarLesson[];
}

interface LessonViewerClientProps {
  lesson: LessonData;
  courseId: string;
  sections: SidebarSection[];
  completedIds: string[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

const lessonTypeIcon: Record<LessonType, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 shrink-0" />,
  text: <FileText className="h-4 w-4 shrink-0" />,
  quiz: <HelpCircle className="h-4 w-4 shrink-0" />,
  assignment: <ClipboardList className="h-4 w-4 shrink-0" />,
};

function getMuxPlaybackId(url: string): string | null {
  // https://stream.mux.com/{playbackId}.m3u8 or https://stream.mux.com/{playbackId}
  const match = url.match(/stream\.mux\.com\/([^/.]+)/);
  return match ? match[1] : null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function LessonViewerClient({
  lesson,
  courseId,
  sections,
  completedIds: initialCompleted,
  prevLesson,
  nextLesson,
}: LessonViewerClientProps) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState(new Set(initialCompleted));
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentSaved, setAssignmentSaved] = useState(false);

  const isCompleted = completedIds.has(lesson.id);

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => completedIds.has(l.id)).length,
    0
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const markComplete = useCallback(async () => {
    if (isCompleted || marking) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setCompletedIds((prev) => new Set([...prev, lesson.id]));
      }
    } finally {
      setMarking(false);
    }
  }, [isCompleted, marking, lesson.id, courseId]);

  // Parse quiz questions from content JSON
  let quizQuestions: { question: string; options: string[]; correct: number }[] = [];
  if (lesson.type === "quiz" && lesson.content) {
    try {
      quizQuestions = JSON.parse(lesson.content);
    } catch {
      // not valid JSON, treat as text
    }
  }

  const quizScore =
    quizSubmitted && quizQuestions.length > 0
      ? quizQuestions.reduce(
          (acc, q, i) => acc + (quizAnswers[i] === q.correct ? 1 : 0),
          0
        )
      : 0;
  const quizPassed = quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.7);

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    if (quizPassed) {
      await markComplete();
    }
  };

  const handleAssignmentSubmit = async () => {
    setAssignmentSaved(true);
    await markComplete();
  };

  const renderContent = () => {
    if (lesson.type === "video") {
      if (lesson.videoUrl) {
        const muxId = getMuxPlaybackId(lesson.videoUrl);
        const ytId = getYouTubeId(lesson.videoUrl);

        if (muxId) {
          // Dynamic import to avoid SSR issues
          const MuxPlayer = require("@mux/mux-player-react").default;
          return (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <MuxPlayer
                playbackId={muxId}
                streamType="on-demand"
                className="h-full w-full"
                onEnded={markComplete}
              />
            </div>
          );
        }

        if (ytId) {
          return (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        return (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <video
              src={lesson.videoUrl}
              controls
              className="h-full w-full"
              onEnded={markComplete}
            />
          </div>
        );
      }
      return (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          Video no disponible
        </div>
      );
    }

    if (lesson.type === "text") {
      return (
        <div className="prose prose-neutral dark:prose-invert max-w-none rounded-lg border border-border bg-card p-6">
          {lesson.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">No hay contenido disponible.</p>
          )}
        </div>
      );
    }

    if (lesson.type === "quiz") {
      if (quizQuestions.length === 0) {
        return (
          <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
            Este quiz aún no está disponible.
          </div>
        );
      }
      return (
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Quiz</h2>
          {quizQuestions.map((q, i) => (
            <div key={i} className="space-y-3">
              <p className="font-medium text-foreground">
                {i + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, j) => {
                  const isSelected = quizAnswers[i] === j;
                  const isCorrect = quizSubmitted && j === q.correct;
                  const isWrong = quizSubmitted && isSelected && j !== q.correct;
                  return (
                    <button
                      key={j}
                      onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [i]: j }))}
                      disabled={quizSubmitted}
                      className={`w-full rounded-md border px-4 py-2 text-left text-sm transition-colors ${
                        isCorrect
                          ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : isWrong
                          ? "border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!quizSubmitted && (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
            >
              Enviar respuestas
            </Button>
          )}
          {quizSubmitted && (
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                quizPassed
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {quizPassed
                ? `Aprobado: ${quizScore}/${quizQuestions.length} respuestas correctas.`
                : `No aprobado: ${quizScore}/${quizQuestions.length}. Necesitas al menos el 70%.`}
            </div>
          )}
        </div>
      );
    }

    if (lesson.type === "assignment") {
      return (
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Tarea</h2>
          {lesson.content && (
            <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tu respuesta</label>
            <textarea
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              disabled={assignmentSaved}
              rows={6}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
          </div>
          {!assignmentSaved ? (
            <Button onClick={handleAssignmentSubmit} disabled={!assignmentText.trim()}>
              Enviar tarea
            </Button>
          ) : (
            <p className="text-sm text-green-600 dark:text-green-400">
              Tarea enviada correctamente.
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md p-2 text-muted-foreground hover:bg-muted"
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-sm font-medium">Menú</span>
        </button>
        <span className="text-sm font-medium text-foreground truncate flex-1">{lesson.title}</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } w-full shrink-0 border-r border-border bg-card lg:block lg:w-72 xl:w-80`}
      >
        <div className="sticky top-0 flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
          <div className="border-b border-border p-4">
            <Link
              href={`/dashboard/my-courses/${courseId}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3 w-3" /> Volver al curso
            </Link>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Progreso del curso</p>
            <Progress value={progress} className="mt-1 h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">
              {completedCount}/{totalLessons} lecciones
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {sections.map((section) => (
              <div key={section.id}>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                {section.lessons.map((l) => {
                  const done = completedIds.has(l.id);
                  const active = l.id === lesson.id;
                  return (
                    <Link
                      key={l.id}
                      href={`/dashboard/my-courses/${courseId}/lessons/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate">{l.title}</span>
                      {lessonTypeIcon[l.type]}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Lesson title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {lessonTypeIcon[lesson.type]}
              <span className="capitalize">{lesson.type}</span>
              {lesson.duration && <span>· {lesson.duration}</span>}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{lesson.title}</h1>
          </div>

          {/* Content */}
          {renderContent()}

          {/* Mark complete button (for video/text) */}
          {(lesson.type === "video" || lesson.type === "text") && (
            <div className="flex items-center gap-3">
              <Button
                onClick={markComplete}
                disabled={isCompleted || marking}
                variant={isCompleted ? "outline" : "default"}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Lección completada
                  </>
                ) : marking ? (
                  "Marcando..."
                ) : (
                  "Marcar como completada"
                )}
              </Button>
            </div>
          )}

          {/* Adjuntos y recursos */}
          {((lesson.attachments && lesson.attachments.length > 0) || (lesson.resources && lesson.resources.length > 0)) && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Material de esta lección</p>
              {lesson.attachments && lesson.attachments.length > 0 && (
                <div className="space-y-2">
                  {lesson.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={att.name}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="flex-1 truncate">{att.name}</span>
                      {att.size && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {att.size < 1024 * 1024
                            ? `${(att.size / 1024).toFixed(0)} KB`
                            : `${(att.size / 1024 / 1024).toFixed(1)} MB`}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-2">
                  {lesson.resources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary transition-colors hover:bg-muted"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{res.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            {prevLesson ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/my-courses/${courseId}/lessons/${prevLesson.id}`)
                }
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`)
                }
              >
                Siguiente
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/dashboard/my-courses/${courseId}`)}
              >
                Volver al curso
              </Button>
            )}
          </div>

          {/* Sticky bottom bar: Marcar completada + Siguiente (solo video/texto, desktop) */}
          {(lesson.type === "video" || lesson.type === "text") && (
            <div className="hidden lg:flex sticky bottom-0 mt-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 items-center justify-between gap-4 border-t border-border bg-background/95 backdrop-blur">
              <Button
                onClick={markComplete}
                disabled={isCompleted || marking}
                variant={isCompleted ? "outline" : "default"}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Lección completada
                  </>
                ) : marking ? (
                  "Marcando..."
                ) : (
                  "Marcar como completada"
                )}
              </Button>
              <div className="flex gap-2">
                {prevLesson && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/my-courses/${courseId}/lessons/${prevLesson.id}`)
                    }
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                )}
                {nextLesson ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`)
                    }
                  >
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/my-courses/${courseId}`)}
                  >
                    Volver al curso
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
