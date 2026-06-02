"use client";

import { useState } from "react";
import Link from "next/link";
import { ExamInterface } from "@/components/student/exam-interface";
import { ExamResults } from "@/components/student/exam-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Award } from "lucide-react";
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
  } | null;
}

export function ExamPageClient({
  courseId,
  courseTitle,
  exam,
  existingSubmission,
}: ExamPageClientProps) {
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    answers: Record<string, number>;
    evaluations: Record<string, boolean>;
    certificate: { id: string; number: string } | null;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Already submitted (from server) — show detailed results
  if (existingSubmission) {
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
          userAnswers={existingSubmission.answers}
          evaluations={existingSubmission.evaluations}
          score={existingSubmission.score}
          passed={existingSubmission.passed}
          attemptsUsed={1}
          onContinue={undefined}
        />
        <div className="mx-auto max-w-4xl px-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/my-courses/${courseId}`}>Volver al curso</Link>
          </Button>
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
        <div className="mx-auto max-w-4xl px-4 flex gap-3">
          {result.certificate && (
            <Button asChild>
              <Link href={`/dashboard/certificates/${result.certificate.id}?new=1`}>
                <Award className="mr-2 h-4 w-4" />
                {result.passed ? "Ver certificado de acreditación" : "Ver reconocimiento de participación"}
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/my-courses/${courseId}`}>Volver al curso</Link>
          </Button>
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
