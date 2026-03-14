"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
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
  Lock,
  ClipboardCheck,
  Gamepad2,
} from "lucide-react";
import { MemoryGame } from "./minigames/memory-game";
import { HangmanGame } from "./minigames/hangman-game";
import { SortGame } from "./minigames/sort-game";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

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
  hasQuiz: boolean;
  quizPassed: boolean;
  hasMinigame: boolean;
  minigamePassed: boolean;
  lessons: SidebarLesson[];
}

interface SectionQuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface SectionQuiz {
  passingScore: number;
  questions: SectionQuizQuestion[];
}

type SectionMinigameData =
  | { type: "memory"; pairs: { term: string; definition: string }[] }
  | { type: "hangman"; words: { word: string; hint: string }[] }
  | { type: "sort"; instruction: string; items: string[] };

interface LessonViewerClientProps {
  lesson: LessonData;
  courseId: string;
  sections: SidebarSection[];
  completedIds: string[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  sectionQuiz: SectionQuiz | null;
  sectionQuizPassed: boolean;
  sectionMinigame: SectionMinigameData | null;
  sectionMinigamePassed: boolean;
  isLastLessonInSection: boolean;
  nextLessonSectionId: string | null;
  currentSectionId: string;
}

const lessonTypeIcon: Record<LessonType, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 shrink-0" />,
  text: <FileText className="h-4 w-4 shrink-0" />,
  quiz: <HelpCircle className="h-4 w-4 shrink-0" />,
  assignment: <ClipboardList className="h-4 w-4 shrink-0" />,
};

function getMuxPlaybackId(url: string): string | null {
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
  sectionQuiz,
  sectionQuizPassed: initialSectionQuizPassed,
  sectionMinigame,
  sectionMinigamePassed: initialSectionMinigamePassed,
  isLastLessonInSection,
  nextLessonSectionId,
  currentSectionId,
}: LessonViewerClientProps) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState(new Set(initialCompleted));
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentSaved, setAssignmentSaved] = useState(false);

  // Estado del test de sección
  const [sectionQuizPassed, setSectionQuizPassed] = useState(initialSectionQuizPassed);
  const [sectionMinigamePassed, setSectionMinigamePassed] = useState(initialSectionMinigamePassed);
  const [showSectionQuiz, setShowSectionQuiz] = useState(false);
  const [sectionQuizAnswers, setSectionQuizAnswers] = useState<Record<number, number>>({});
  const [sectionQuizSubmitted, setSectionQuizSubmitted] = useState(false);
  const [sectionQuizScore, setSectionQuizScore] = useState(0);
  const [sectionQuizSubmitting, setSectionQuizSubmitting] = useState(false);

  const isCompleted = completedIds.has(lesson.id);

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => completedIds.has(l.id)).length,
    0
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // ¿El siguiente lesson es en otra sección y esa sección requiere pasar el test/minijuego?
  const nextIsInDifferentSection =
    nextLesson !== null && nextLessonSectionId !== null && nextLessonSectionId !== currentSectionId;
  // Solo mostrar evaluación si hay una siguiente sección que desbloquear
  const sectionQuizRequired =
    isLastLessonInSection && nextIsInDifferentSection && sectionQuiz !== null && sectionQuiz.questions.length > 0;
  const sectionMinigameRequired =
    isLastLessonInSection && nextIsInDifferentSection && sectionMinigame !== null;
  const blockNextNavigation =
    nextIsInDifferentSection &&
    ((sectionQuizRequired && !sectionQuizPassed) || (sectionMinigameRequired && !sectionMinigamePassed));

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

  // Parse quiz questions from content JSON (lección tipo quiz)
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

  // Lógica del test de sección
  const computedSectionQuizScore = () => {
    if (!sectionQuiz) return 0;
    const correct = sectionQuiz.questions.reduce(
      (acc, q, i) => acc + (sectionQuizAnswers[i] === q.correct ? 1 : 0),
      0
    );
    return Math.round((correct / sectionQuiz.questions.length) * 100);
  };

  const handleSectionQuizSubmit = async () => {
    if (!sectionQuiz) return;
    setSectionQuizSubmitting(true);
    const score = computedSectionQuizScore();
    const passingScore = sectionQuiz.passingScore ?? 70;
    const passed = score >= passingScore;
    setSectionQuizScore(score);
    setSectionQuizSubmitted(true);

    try {
      await fetch(`/api/sections/${currentSectionId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, score, passed }),
      });
      if (passed) setSectionQuizPassed(true);
    } finally {
      setSectionQuizSubmitting(false);
    }
  };

  const resetSectionQuiz = () => {
    setSectionQuizAnswers({});
    setSectionQuizSubmitted(false);
    setSectionQuizScore(0);
  };

  const handleMinigameComplete = async () => {
    try {
      await fetch(`/api/sections/${currentSectionId}/minigame/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      setSectionMinigamePassed(true);
    } catch {
      // silently fail, user can still continue
      setSectionMinigamePassed(true);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      router.push(`/dashboard/my-courses/${courseId}/lessons/${nextLesson.id}`);
    }
  };

  const renderContent = () => {
    if (lesson.type === "video") {
      if (lesson.videoUrl) {
        const muxId = getMuxPlaybackId(lesson.videoUrl);
        const ytId = getYouTubeId(lesson.videoUrl);

        if (muxId) {
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

  const renderSectionQuiz = () => {
    if (!sectionQuiz || sectionQuiz.questions.length === 0) return null;

    const passingScore = sectionQuiz.passingScore ?? 70;

    return (
      <div className="space-y-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-primary shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Test de sección</h2>
            <p className="text-sm text-muted-foreground">
              Debes aprobar este test ({passingScore}% mínimo) para continuar con la siguiente sección.
            </p>
          </div>
        </div>

        {sectionQuizPassed && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Ya aprobaste este test. Puedes continuar.</p>
          </div>
        )}

        {!sectionQuizPassed && !showSectionQuiz && (
          <Button onClick={() => setShowSectionQuiz(true)}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Realizar test de sección
          </Button>
        )}

        {!sectionQuizPassed && showSectionQuiz && (
          <div className="space-y-6">
            {sectionQuiz.questions.map((q, i) => (
              <div key={i} className="space-y-3">
                <p className="font-medium text-foreground">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => {
                    const isSelected = sectionQuizAnswers[i] === j;
                    const isCorrect = sectionQuizSubmitted && j === q.correct;
                    const isWrong = sectionQuizSubmitted && isSelected && j !== q.correct;
                    return (
                      <button
                        key={j}
                        onClick={() =>
                          !sectionQuizSubmitted &&
                          setSectionQuizAnswers((prev) => ({ ...prev, [i]: j }))
                        }
                        disabled={sectionQuizSubmitted}
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

            {!sectionQuizSubmitted && (
              <Button
                onClick={handleSectionQuizSubmit}
                disabled={
                  Object.keys(sectionQuizAnswers).length < sectionQuiz.questions.length ||
                  sectionQuizSubmitting
                }
              >
                {sectionQuizSubmitting ? "Enviando..." : "Enviar respuestas"}
              </Button>
            )}

            {sectionQuizSubmitted && (
              <div
                className={`rounded-lg p-4 text-sm font-medium ${
                  sectionQuizPassed
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {sectionQuizPassed ? (
                  <span>
                    Aprobado: {sectionQuizScore}%. Puedes continuar con la siguiente sección.
                  </span>
                ) : (
                  <div className="space-y-2">
                    <p>
                      No aprobado: {sectionQuizScore}%. Necesitas al menos {passingScore}%.
                    </p>
                    <button
                      onClick={resetSectionQuiz}
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSectionMinigame = () => {
    if (!sectionMinigame) return null;
    const minigameLabel =
      sectionMinigame.type === "memory"
        ? "Memoria"
        : sectionMinigame.type === "hangman"
        ? "Ahorcado"
        : "Ordenar";

    return (
      <div className="space-y-6 rounded-xl border-2 border-purple-400/40 bg-purple-50/50 dark:bg-purple-900/10 p-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Minijuego: {minigameLabel}
            </h2>
            <p className="text-sm text-muted-foreground">
              Completa el minijuego para continuar con la siguiente sección.
            </p>
          </div>
        </div>

        {sectionMinigamePassed ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">¡Minijuego completado! Puedes continuar.</p>
          </div>
        ) : (
          <>
            {sectionMinigame.type === "memory" && (
              <MemoryGame pairs={sectionMinigame.pairs} onComplete={handleMinigameComplete} />
            )}
            {sectionMinigame.type === "hangman" && (
              <HangmanGame words={sectionMinigame.words} onComplete={handleMinigameComplete} />
            )}
            {sectionMinigame.type === "sort" && (
              <SortGame
                instruction={sectionMinigame.instruction}
                items={sectionMinigame.items}
                onComplete={handleMinigameComplete}
              />
            )}
          </>
        )}
      </div>
    );
  };

  const nextButton = (size: "sm" | "default" = "sm") => {
    if (!nextLesson) return null;
    if (blockNextNavigation) {
      const label =
        sectionMinigameRequired && !sectionMinigamePassed
          ? "Completa el minijuego"
          : "Aprueba el test de sección";
      return (
        <Button size={size} disabled className="opacity-60">
          <Lock className="mr-1 h-3 w-3" />
          {label}
        </Button>
      );
    }
    return (
      <Button size={size} onClick={handleNext}>
        Siguiente
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    );
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
            {(() => {
              // Calcular qué secciones están bloqueadas (hay una sección previa con evaluación no superada)
              const lockedSectionIds = new Set<string>();
              let gateFailed = false;
              for (const s of sections) {
                if (gateFailed) lockedSectionIds.add(s.id);
                if (!gateFailed) {
                  const sectionPassed = s.id === currentSectionId
                    ? (s.hasQuiz ? sectionQuizPassed : s.hasMinigame ? sectionMinigamePassed : true)
                    : (s.hasQuiz ? s.quizPassed : s.hasMinigame ? s.minigamePassed : true);
                  if ((s.hasQuiz || s.hasMinigame) && !sectionPassed) gateFailed = true;
                }
              }
              return sections.map((section) => {
                const isLocked = lockedSectionIds.has(section.id);
                return (
              <div key={section.id}>
                <p className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${isLocked ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                  {section.title}
                  {isLocked && <Lock className="inline ml-1 h-3 w-3 opacity-60" />}
                </p>
                {section.lessons.map((l) => {
                  const done = completedIds.has(l.id);
                  const active = l.id === lesson.id;
                  if (isLocked) {
                    return (
                      <div
                        key={l.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground/40 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{l.title}</span>
                      </div>
                    );
                  }
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
                {/* Indicador de test de sección en sidebar */}
                {section.hasQuiz && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 text-sm ${
                      section.id === currentSectionId && sectionQuizPassed
                        ? "text-green-600 dark:text-green-400"
                        : section.quizPassed
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {(section.id === currentSectionId ? sectionQuizPassed : section.quizPassed) ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate text-xs font-medium">Test de sección</span>
                    {!(section.id === currentSectionId ? sectionQuizPassed : section.quizPassed) && (
                      <Lock className="h-3 w-3 shrink-0" />
                    )}
                  </div>
                )}
                {/* Indicador de minijuego en sidebar */}
                {section.hasMinigame && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 text-sm ${
                      section.id === currentSectionId && sectionMinigamePassed
                        ? "text-green-600 dark:text-green-400"
                        : section.minigamePassed
                        ? "text-green-600 dark:text-green-400"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {(section.id === currentSectionId ? sectionMinigamePassed : section.minigamePassed) ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <Gamepad2 className="h-4 w-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate text-xs font-medium">Minijuego</span>
                    {!(section.id === currentSectionId ? sectionMinigamePassed : section.minigamePassed) && (
                      <Lock className="h-3 w-3 shrink-0" />
                    )}
                  </div>
                )}
              </div>
                );
              });
            })()}
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

          {/* Test de sección — aparece después de completar la última lección de la sección */}
          {sectionQuizRequired && isCompleted && renderSectionQuiz()}

          {/* Minijuego de sección */}
          {sectionMinigameRequired && isCompleted && renderSectionMinigame()}

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
              nextButton("sm")
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

          {/* Sticky bottom bar (solo video/texto, desktop) */}
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
                  nextButton("sm")
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
