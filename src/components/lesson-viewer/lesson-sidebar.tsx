"use client";

import { memo } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Lock,
  ClipboardCheck,
  Gamepad2,
} from "lucide-react";

type LessonType = "video" | "text" | "quiz" | "assignment";

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

interface LessonSidebarProps {
  courseId: string;
  sections: SidebarSection[];
  completedIds: Set<string>;
  currentLessonId: string;
  currentSectionId: string;
  sectionQuizPassed: boolean;
  sectionMinigamePassed: boolean;
  onLessonClick: () => void;
}

const lessonTypeIcon: Record<LessonType, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 shrink-0" />,
  text: <FileText className="h-4 w-4 shrink-0" />,
  quiz: <HelpCircle className="h-4 w-4 shrink-0" />,
  assignment: <ClipboardList className="h-4 w-4 shrink-0" />,
};

export const LessonSidebar = memo(function LessonSidebar({
  courseId,
  sections,
  completedIds,
  currentLessonId,
  currentSectionId,
  sectionQuizPassed,
  sectionMinigamePassed,
  onLessonClick,
}: LessonSidebarProps) {
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => completedIds.has(l.id)).length,
    0
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Calcular secciones bloqueadas
  const lockedSectionIds = new Set<string>();
  let gateFailed = false;
  for (const s of sections) {
    if (gateFailed) lockedSectionIds.add(s.id);
    if (!gateFailed) {
      const sectionPassed =
        s.id === currentSectionId
          ? s.hasQuiz ? sectionQuizPassed : s.hasMinigame ? sectionMinigamePassed : true
          : s.hasQuiz ? s.quizPassed : s.hasMinigame ? s.minigamePassed : true;
      if ((s.hasQuiz || s.hasMinigame) && !sectionPassed) gateFailed = true;
    }
  }

  return (
    <div className="sticky top-0 flex h-[calc(100svh-4rem)] flex-col overflow-hidden">
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
        {sections.map((section) => {
          const isLocked = lockedSectionIds.has(section.id);
          return (
            <div key={section.id}>
              <p
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  isLocked ? "text-muted-foreground/40" : "text-muted-foreground"
                }`}
              >
                {section.title}
                {isLocked && <Lock className="inline ml-1 h-3 w-3 opacity-60" />}
              </p>

              {section.lessons.map((l) => {
                const done = completedIds.has(l.id);
                const active = l.id === currentLessonId;

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
                    onClick={onLessonClick}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
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

              {section.hasQuiz && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${
                    (section.id === currentSectionId ? sectionQuizPassed : section.quizPassed)
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

              {section.hasMinigame && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${
                    (section.id === currentSectionId ? sectionMinigamePassed : section.minigamePassed)
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
        })}
      </div>
    </div>
  );
});
