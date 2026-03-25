"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
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
// Note: PlayCircle, FileText, HelpCircle, ClipboardList used in lessonTypeIcon below
import { MemoryGame } from "./minigames/memory-game";
import { HangmanGame } from "./minigames/hangman-game";
import { SortGame } from "./minigames/sort-game";
import { MatchGame } from "./minigames/match-game";
import { LessonSidebar } from "./lesson-sidebar";

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
  | { type: "sort"; instruction: string; items: string[] }
  | { type: "match"; instruction: string; pairs: { left: string; right: string }[] };

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
  hasFinalExam?: boolean;
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
  hasFinalExam = false,
}: LessonViewerClientProps) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState(new Set(initialCompleted));
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCheckboxAnswers, setQuizCheckboxAnswers] = useState<Record<number, Set<number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAttemptCount, setQuizAttemptCount] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState<number | null>(null); // seconds
  const [quizTimerStarted, setQuizTimerStarted] = useState(false);
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentSaved, setAssignmentSaved] = useState(false);

  // Parse quiz config early so hooks can reference it
  const quizConfig = useMemo(() => {
    if (lesson.type !== "quiz" || !lesson.content) return { timeLimit: 0, maxAttempts: 0, passingRequired: false, passingScore: 70 };
    try {
      const p = JSON.parse(lesson.content);
      if (p && typeof p === "object" && !Array.isArray(p)) {
        return {
          timeLimit: p.timeLimit || 0,
          maxAttempts: p.attempts || 0,
          passingRequired: p.passingRequired || false,
          passingScore: p.passingScore || 70,
        };
      }
    } catch {}
    return { timeLimit: 0, maxAttempts: 0, passingRequired: false, passingScore: 70 };
  }, [lesson.type, lesson.content]);

  // Estado del test de sección
  const [sectionQuizPassed, setSectionQuizPassed] = useState(initialSectionQuizPassed);
  const [sectionMinigamePassed, setSectionMinigamePassed] = useState(initialSectionMinigamePassed);
  const [showSectionQuiz, setShowSectionQuiz] = useState(false);
  const [sectionQuizAnswers, setSectionQuizAnswers] = useState<Record<number, number>>({});
  const [sectionQuizSubmitted, setSectionQuizSubmitted] = useState(false);
  const [sectionQuizScore, setSectionQuizScore] = useState(0);
  const [sectionQuizSubmitting, setSectionQuizSubmitting] = useState(false);

  // Quiz timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (quizTimerStarted && quizTimeLeft !== null && quizTimeLeft > 0 && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setQuizTimeLeft((t) => {
          if (t !== null && t <= 1) {
            // Auto-submit on time out
            setQuizSubmitted(true);
            setQuizAttemptCount((c) => c + 1);
            return 0;
          }
          return t !== null ? t - 1 : null;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [quizTimerStarted, quizSubmitted, quizTimeLeft]);

  const startQuizTimer = useCallback(() => {
    if (quizConfig.timeLimit > 0 && !quizTimerStarted) {
      setQuizTimeLeft(quizConfig.timeLimit * 60);
      setQuizTimerStarted(true);
    }
  }, [quizConfig.timeLimit, quizTimerStarted]);

  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizCheckboxAnswers({});
    setQuizSubmitted(false);
    if (quizConfig.timeLimit > 0) {
      setQuizTimeLeft(quizConfig.timeLimit * 60);
      setQuizTimerStarted(true);
    }
  }, [quizConfig.timeLimit]);

  const quizAttemptsExhausted = quizConfig.maxAttempts > 0 && quizAttemptCount >= quizConfig.maxAttempts;

  const isCompleted = completedIds.has(lesson.id);

  // ¿El siguiente lesson es en otra sección?
  const nextIsInDifferentSection =
    nextLesson !== null && nextLessonSectionId !== null && nextLessonSectionId !== currentSectionId;
  // Mostrar quiz/minijuego en la última lección de la sección (aunque sea la última del curso)
  const sectionQuizRequired =
    isLastLessonInSection && sectionQuiz !== null && sectionQuiz.questions.length > 0;
  const sectionMinigameRequired =
    isLastLessonInSection && sectionMinigame !== null;
  // Bloquear navegación si falta quiz/minijuego de la sección actual
  // (aplica tanto si hay siguiente sección como si es la última y hay examen final)
  const sectionGatePending =
    (sectionQuizRequired && !sectionQuizPassed) || (sectionMinigameRequired && !sectionMinigamePassed);
  const blockNextNavigation =
    (nextIsInDifferentSection || (nextLesson === null && hasFinalExam)) && sectionGatePending;

  const markComplete = useCallback(async () => {
    if (isCompleted || marking) return;
    setMarking(true);
    // Optimistic update: marcar inmediatamente, rollback solo si falla
    setCompletedIds((prev) => new Set([...prev, lesson.id]));
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) {
        // Rollback
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(lesson.id);
          return next;
        });
      }
    } catch {
      // Rollback on network error
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(lesson.id);
        return next;
      });
    } finally {
      setMarking(false);
    }
  }, [isCompleted, marking, lesson.id, courseId]);

  // Parse quiz questions from content JSON (lección tipo quiz)
  type ParsedQuizQuestion = {
    question: string;
    options: string[];
    correct: number;
    type?: "multiple-choice" | "true-false" | "checkbox";
    correctAnswers?: number[];
  };
  let quizQuestions: ParsedQuizQuestion[] = [];
  let quizInstructions = "";
  if (lesson.type === "quiz" && lesson.content) {
    try {
      const parsed = JSON.parse(lesson.content);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.questions)) {
        quizInstructions = parsed.instructions || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quizQuestions = parsed.questions.map((q: any) => ({
          question: q.question,
          options: q.options || (q.type === "true-false" ? ["Verdadero", "Falso"] : []),
          correct: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          type: q.type || "multiple-choice",
          correctAnswers: q.correctAnswers,
        }));
      } else if (Array.isArray(parsed)) {
        quizQuestions = parsed;
      }
    } catch {
      // not valid JSON, treat as text
    }
  }

  const { timeLimit: quizTimeLimit, maxAttempts: quizMaxAttempts, passingRequired: quizPassingRequired, passingScore: quizPassingScorePercent } = quizConfig;

  const quizScore =
    quizSubmitted && quizQuestions.length > 0
      ? quizQuestions.reduce((acc, q, i) => {
          if (q.type === "checkbox" && q.correctAnswers) {
            const selected = quizCheckboxAnswers[i] || new Set();
            const correct = new Set(q.correctAnswers);
            const match = correct.size === selected.size && [...correct].every((v) => selected.has(v));
            return acc + (match ? 1 : 0);
          }
          return acc + (quizAnswers[i] === q.correct ? 1 : 0);
        }, 0)
      : 0;
  const quizScorePercent = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
  const quizPassed = quizSubmitted && quizScorePercent >= (quizPassingRequired ? quizPassingScorePercent : 70);

  const handleQuizSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizSubmitted(true);
    setQuizAttemptCount((c) => c + 1);
    // Compute pass inline since state hasn't updated yet
    const score = quizQuestions.reduce((acc, q, i) => {
      if (q.type === "checkbox" && q.correctAnswers) {
        const selected = quizCheckboxAnswers[i] || new Set();
        const correct = new Set(q.correctAnswers);
        return acc + (correct.size === selected.size && [...correct].every((v) => selected.has(v)) ? 1 : 0);
      }
      return acc + (quizAnswers[i] === q.correct ? 1 : 0);
    }, 0);
    const pct = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
    const passed = pct >= (quizPassingRequired ? quizPassingScorePercent : 70);
    if (passed || !quizPassingRequired) {
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

      // For timed quizzes, show start screen first
      if (quizTimeLimit > 0 && !quizTimerStarted && !quizSubmitted) {
        return (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6 text-center">
            <h2 className="text-xl font-semibold">Quiz</h2>
            {quizInstructions && (
              <p className="text-sm text-muted-foreground">{quizInstructions}</p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{quizQuestions.length} preguntas</p>
              <p>Tiempo límite: {quizTimeLimit} minuto{quizTimeLimit !== 1 ? "s" : ""}</p>
              {quizMaxAttempts > 0 && <p>Intentos permitidos: {quizMaxAttempts}</p>}
              {quizPassingRequired && <p>Puntaje mínimo para aprobar: {quizPassingScorePercent}%</p>}
            </div>
            <Button onClick={startQuizTimer} disabled={quizAttemptsExhausted}>
              {quizAttemptsExhausted ? "Sin intentos disponibles" : "Comenzar quiz"}
            </Button>
          </div>
        );
      }

      const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
      };

      return (
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quiz</h2>
            <div className="flex items-center gap-3">
              {quizMaxAttempts > 0 && (
                <span className="text-xs text-muted-foreground">
                  Intento {Math.min(quizAttemptCount + (quizSubmitted ? 0 : 1), quizMaxAttempts)}/{quizMaxAttempts}
                </span>
              )}
              {quizTimeLeft !== null && !quizSubmitted && (
                <span className={`text-sm font-mono font-semibold ${quizTimeLeft <= 30 ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                  {formatTime(quizTimeLeft)}
                </span>
              )}
            </div>
          </div>
          {quizInstructions && (
            <p className="text-sm text-muted-foreground">{quizInstructions}</p>
          )}
          {(quizPassingRequired || quizTimeLimit > 0) && !quizSubmitted && (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {quizPassingRequired && <span>Puntaje mínimo: {quizPassingScorePercent}%</span>}
            </div>
          )}
          {quizQuestions.map((q, i) => {
            const isCheckbox = q.type === "checkbox";
            const selectedCheckboxes = quizCheckboxAnswers[i] || new Set<number>();

            return (
              <div key={i} className="space-y-3">
                <p className="font-medium text-foreground">
                  {i + 1}. {q.question}
                  {isCheckbox && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">(selecciona todas las correctas)</span>
                  )}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => {
                    const isSelectedRadio = quizAnswers[i] === j;
                    const isSelectedCheckbox = selectedCheckboxes.has(j);
                    const isSelected = isCheckbox ? isSelectedCheckbox : isSelectedRadio;

                    let isCorrect = false;
                    let isWrong = false;
                    if (quizSubmitted) {
                      if (isCheckbox && q.correctAnswers) {
                        isCorrect = q.correctAnswers.includes(j);
                        isWrong = isSelectedCheckbox && !q.correctAnswers.includes(j);
                      } else {
                        isCorrect = j === q.correct;
                        isWrong = isSelectedRadio && j !== q.correct;
                      }
                    }

                    return (
                      <button
                        key={j}
                        onClick={() => {
                          if (quizSubmitted) return;
                          if (isCheckbox) {
                            setQuizCheckboxAnswers((prev) => {
                              const next = new Set(prev[i] || []);
                              if (next.has(j)) next.delete(j);
                              else next.add(j);
                              return { ...prev, [i]: next };
                            });
                          } else {
                            setQuizAnswers((prev) => ({ ...prev, [i]: j }));
                          }
                        }}
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
                        <span className="flex items-center gap-2">
                          {isCheckbox ? (
                            <span className={`inline-block h-4 w-4 rounded border-2 shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                          ) : (
                            <span className={`inline-block h-4 w-4 rounded-full border-2 shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                          )}
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!quizSubmitted && (
            <Button
              onClick={handleQuizSubmit}
              disabled={
                quizQuestions.some((q, i) => {
                  if (q.type === "checkbox") return !(quizCheckboxAnswers[i]?.size > 0);
                  return quizAnswers[i] === undefined;
                })
              }
            >
              Enviar respuestas
            </Button>
          )}
          {quizSubmitted && (
            <div className="space-y-3">
              <div
                className={`rounded-lg p-4 text-sm font-medium ${
                  quizPassed
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {quizPassed
                  ? `Aprobado: ${quizScore}/${quizQuestions.length} (${quizScorePercent}%) respuestas correctas.`
                  : `No aprobado: ${quizScore}/${quizQuestions.length} (${quizScorePercent}%).${quizPassingRequired ? ` Necesitas al menos ${quizPassingScorePercent}%.` : ""}`}
                {quizTimeLeft === 0 && !quizPassed && " Se agotó el tiempo."}
              </div>
              {!quizPassed && !quizAttemptsExhausted && (
                <Button variant="outline" size="sm" onClick={resetQuiz}>
                  Reintentar quiz
                </Button>
              )}
              {quizAttemptsExhausted && !quizPassed && (
                <p className="text-xs text-muted-foreground">Has agotado todos los intentos disponibles.</p>
              )}
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
        : sectionMinigame.type === "match"
        ? "Conectar columnas"
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
            {sectionMinigame.type === "match" && (
              <MatchGame
                instruction={sectionMinigame.instruction}
                pairs={sectionMinigame.pairs}
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
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
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
        } w-full shrink-0 border-r border-border bg-card md:block md:w-60 lg:w-72 xl:w-80`}
      >
        <LessonSidebar
          courseId={courseId}
          sections={sections}
          completedIds={completedIds}
          currentLessonId={lesson.id}
          currentSectionId={currentSectionId}
          sectionQuizPassed={sectionQuizPassed}
          sectionMinigamePassed={sectionMinigamePassed}
          onLessonClick={() => setSidebarOpen(false)}
        />
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

          {/* Mark complete button (for video/text) — hidden on lg where sticky bar shows */}
          {(lesson.type === "video" || lesson.type === "text") && (
            <div className="flex items-center gap-3 lg:hidden">
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
                  {lesson.resources.map((res) => {
                    const href = /^https?:\/\//i.test(res.url) ? res.url : `https://${res.url}`;
                    return (
                      <a
                        key={res.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary transition-colors hover:bg-muted"
                      >
                        <ChevronRight className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{res.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Prev / Next navigation — hidden on lg for video/text where sticky bar shows */}
          <div className={`flex items-center justify-between border-t border-border pt-4 ${(lesson.type === "video" || lesson.type === "text") ? "lg:hidden" : ""}`}>
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
            ) : hasFinalExam && isCompleted && !blockNextNavigation ? (
              <Button
                size="sm"
                onClick={() => router.push(`/dashboard/my-courses/${courseId}/exam`)}
              >
                Presentar examen final
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
