"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExamInterface } from "@/components/student/exam-interface";
import { ExamResults } from "@/components/student/exam-results";
import { Button } from "@/components/ui/button";
import { Award, Clock, RefreshCw } from "lucide-react";
import type { CourseFinalExam } from "@/components/instructor/course-types";

interface ExamPageClientProps {
  courseId: string;
  courseTitle: string;
  exam: CourseFinalExam;
  existingSubmission: {
    score: number;
    passed: boolean;
    answers: Record<string, number>;
    evaluations: Record<string, boolean>;
    submittedAt?: string;
  } | null;
}

export function ExamPageClient({
  courseId,
  courseTitle,
  exam,
  existingSubmission,
}: ExamPageClientProps) {
  const [activeSubmission, setActiveSubmission] = useState(existingSubmission);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    answers: Record<string, number>;
    evaluations: Record<string, boolean>;
    certificate: { id: string; number: string } | null;
    submittedAt?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

  const getCooldownStatus = (submittedAtStr?: string) => {
    if (!submittedAtStr) return { isLocked: false, remainingStr: "" };
    const submittedAt = new Date(submittedAtStr);
    const diffMs = Date.now() - submittedAt.getTime();
    const isLocked = diffMs < 4 * 60 * 60 * 1000;
    
    if (!isLocked) return { isLocked: false, remainingStr: "" };
    
    const remainingMs = 4 * 60 * 60 * 1000 - diffMs;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let remainingStr = "";
    if (hours > 0) {
      remainingStr += `${hours} ${hours === 1 ? "hora" : "horas"} y `;
    }
    remainingStr += `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    
    return { isLocked: true, remainingStr };
  };

  useEffect(() => {
    const submissionToCheck = activeSubmission || result;
    if (!submissionToCheck || submissionToCheck.passed || !submissionToCheck.submittedAt) {
      setCooldownRemaining(null);
      return;
    }

    const checkCooldown = () => {
      const { isLocked, remainingStr } = getCooldownStatus(submissionToCheck.submittedAt);
      if (isLocked) {
        setCooldownRemaining(remainingStr);
      } else {
        setCooldownRemaining(null);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [activeSubmission, result]);

  // Already submitted (from server) — show detailed results
  if (activeSubmission) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-4xl mx-auto px-4">
          <Link href={`/dashboard/my-courses/${courseId}`} className="underline">
            {courseTitle}
          </Link>
          <span>/</span>
          <span className="text-foreground">Resultados del examen</span>
        </div>
        <ExamResults
          exam={exam}
          userAnswers={activeSubmission.answers}
          evaluations={activeSubmission.evaluations}
          score={activeSubmission.score}
          passed={activeSubmission.passed}
          attemptsUsed={1}
          onContinue={undefined}
        />
        <div className="mx-auto max-w-4xl px-4 flex flex-col gap-4">
          {!activeSubmission.passed && (
            <div className="flex flex-col gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <Clock className="h-4 w-4 shrink-0" />
                {cooldownRemaining ? (
                  <span>Próximo intento disponible en {cooldownRemaining}</span>
                ) : (
                  <span>¡Reintento ya disponible!</span>
                )}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Debes esperar un periodo de 4 horas tras reprobar el examen final antes de poder realizar otro intento. Aprovecha este tiempo para repasar los contenidos del curso.
              </p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {!activeSubmission.passed && !cooldownRemaining && (
              <Button onClick={() => { setActiveSubmission(null); setResult(null); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Volver a intentar examen
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/dashboard/my-courses/${courseId}`}>Volver al curso</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Just submitted — show detailed results with certificate link
  if (result) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-4xl mx-auto px-4">
          <Link href={`/dashboard/my-courses/${courseId}`} className="underline">
            {courseTitle}
          </Link>
          <span>/</span>
          <span className="text-foreground">Resultados del examen</span>
        </div>
        <ExamResults
          exam={exam}
          userAnswers={result.answers}
          evaluations={result.evaluations}
          score={result.score}
          passed={result.passed}
          attemptsUsed={1}
        />
        <div className="mx-auto max-w-4xl px-4 flex flex-col gap-4">
          {!result.passed && (
            <div className="flex flex-col gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <Clock className="h-4 w-4 shrink-0" />
                {cooldownRemaining ? (
                  <span>Próximo intento disponible en {cooldownRemaining}</span>
                ) : (
                  <span>¡Reintento ya disponible!</span>
                )}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Debes esperar un periodo de 4 horas tras reprobar el examen final antes de poder realizar otro intento. Aprovecha este tiempo para repasar los contenidos del curso.
              </p>
            </div>
          )}

          <div className="mx-auto max-w-4xl flex gap-3 flex-wrap">
            {result.certificate && (
              <Button asChild>
                <Link href={`/dashboard/certificates/${result.certificate.id}?new=1`}>
                  <Award className="mr-2 h-4 w-4" />
                  {result.passed ? "Ver certificado de acreditación" : "Ver reconocimiento de participación"}
                </Link>
              </Button>
            )}
            {!result.passed && !cooldownRemaining && (
              <Button onClick={() => { setActiveSubmission(null); setResult(null); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Volver a intentar examen
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/dashboard/my-courses/${courseId}`}>Volver al curso</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (
    answers: Record<string, number>,
    _clientScore: number,
    _clientPassed: boolean
  ) => {
    setSubmitError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/exam/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar examen");
      setResult({ ...data, answers });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 py-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/dashboard/my-courses/${courseId}`} className="underline">
          {courseTitle}
        </Link>
        <span>/</span>
        <span className="text-foreground">Examen final</span>
      </div>
      {submitError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>
      )}
      <ExamInterface exam={exam} onSubmit={handleSubmit} />
    </div>
  );
}
