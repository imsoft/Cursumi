"use client";

import { useState } from "react";
import Link from "next/link";
import { ExamInterface } from "@/components/student/exam-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import type { CourseFinalExam } from "@/components/instructor/course-types";

interface ExamPageClientProps {
  courseId: string;
  courseTitle: string;
  exam: CourseFinalExam;
  existingSubmission: { score: number; passed: boolean } | null;
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
    certificate: { id: string; number: string } | null;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (existingSubmission) {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12">
        <ResultCard
          score={existingSubmission.score}
          passed={existingSubmission.passed}
          courseId={courseId}
          certificateId={null}
        />
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12">
        <ResultCard
          score={result.score}
          passed={result.passed}
          courseId={courseId}
          certificateId={result.certificate?.id ?? null}
        />
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
      setResult(data);
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

function ResultCard({
  score,
  passed,
  courseId,
  certificateId,
}: {
  score: number;
  passed: boolean;
  courseId: string;
  certificateId: string | null;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          {passed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-amber-500" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {passed ? "¡Aprobaste el examen!" : "No aprobaste esta vez"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-5xl font-bold text-foreground">{Math.round(score)}%</p>
        <p className="text-muted-foreground">
          {passed
            ? "Felicidades, has completado el curso exitosamente. Tu certificado de acreditación ya está disponible."
            : "No alcanzaste la calificación mínima, pero tu reconocimiento de participación ya está disponible."}
        </p>
        {certificateId && (
          <Button asChild>
            <Link href={`/dashboard/certificates/${certificateId}?new=1`}>
              <Award className="mr-2 h-4 w-4" />
              {passed ? "Ver certificado de acreditación" : "Ver reconocimiento de participación"}
            </Link>
          </Button>
        )}
        <div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/my-courses/${courseId}`}>Volver al curso</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
