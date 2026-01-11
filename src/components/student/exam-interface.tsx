"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight, ArrowLeft, Send } from "lucide-react";
import type { CourseFinalExam, QuizQuestion } from "@/components/instructor/course-types";

interface ExamInterfaceProps {
  exam: CourseFinalExam;
  onSubmit: (answers: Record<string, number>, score: number, passed: boolean) => void;
  onCancel?: () => void;
  attemptsUsed?: number;
}

export const ExamInterface = ({ exam, onSubmit, onCancel, attemptsUsed = 0 }: ExamInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(exam.timeLimit ? exam.timeLimit * 60 : null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    exam.questions.forEach((question) => {
      totalPoints += question.points || 0;
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
        correctAnswers++;
        earnedPoints += question.points || 0;
      }
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    return { correctAnswers, totalQuestions, percentage, earnedPoints, totalPoints };
  };

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    handleSubmitExam();
  };

  const handleSubmitExam = () => {
    setIsSubmitting(true);
    const { percentage } = calculateScore();
    const passed = percentage >= exam.passingScore;
    onSubmit(answers, percentage, passed);
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Header con título y tiempo */}
      <Card className="border-2 border-primary/30 bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              {exam.description && (
                <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p>
              )}
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`} />
                <span className={`text-xl font-bold ${timeRemaining < 300 ? "text-red-500" : "text-foreground"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Información del intento */}
      {exam.attemptsAllowed && (
        <Card className={`border ${attemptsUsed >= exam.attemptsAllowed - 1 ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20" : "border-border bg-card/90"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${attemptsUsed >= exam.attemptsAllowed - 1 ? "text-red-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">
                Intento {attemptsUsed + 1} de {exam.attemptsAllowed}
                {attemptsUsed >= exam.attemptsAllowed - 1 && " - Este es tu último intento"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progreso */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progreso del examen</span>
              <span className="text-muted-foreground">
                {answeredQuestions} de {totalQuestions} respondidas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Pregunta actual */}
      <Card className="border-2 border-primary/20 bg-card">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.points} puntos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            {currentQuestion.question}
          </h3>

          {/* Opciones */}
          {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                    className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-base ${isSelected ? "font-semibold text-primary" : "text-foreground"}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}

          {isLastQuestion ? (
            <Button
              onClick={() => setShowConfirmSubmit(true)}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="flex-1 sm:flex-initial"
            >
              <Send className="mr-2 h-4 w-4" />
              {allQuestionsAnswered ? "Enviar examen" : `Faltan ${totalQuestions - answeredQuestions} preguntas`}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 sm:flex-initial"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md border-2 border-border">
            <CardHeader>
              <CardTitle>¿Enviar examen?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Estás a punto de enviar tu examen. Una vez enviado, no podrás modificar tus respuestas.
              </p>

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Preguntas respondidas:</span>
                  <span className="font-semibold">{answeredQuestions} de {totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calificación mínima:</span>
                  <span className="font-semibold">{exam.passingScore}%</span>
                </div>
                {exam.attemptsAllowed && (
                  <div className="flex justify-between">
                    <span>Intentos restantes:</span>
                    <span className="font-semibold">{exam.attemptsAllowed - attemptsUsed - 1}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar envío"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mini mapa de preguntas */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle className="text-sm">Mapa de preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2 sm:grid-cols-12">
            {exam.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isAnswered
                      ? "border-green-500 bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones */}
      {exam.instructions && (
        <Card className="border border-border bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {exam.instructions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
