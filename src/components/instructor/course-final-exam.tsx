"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, Circle, FileQuestion, Clock, Target, AlertCircle, Pencil, X, Save } from "lucide-react";
import type { CourseFinalExam, QuizQuestion, CourseFormData } from "./course-types";
import { stripHtml } from "@/lib/utils";

interface CourseFinalExamProps {
  data: CourseFormData;
  onUpdate: (data: Partial<CourseFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const CourseFinalExamComponent = ({ data, onUpdate, onNext, onPrevious }: CourseFinalExamProps) => {
  const [hasExam, setHasExam] = useState(!!data.finalExam);
  const [examTitle, setExamTitle] = useState(data.finalExam?.title || "Examen Final");
  const [examDescription, setExamDescription] = useState(data.finalExam?.description || "");
  const [examInstructions, setExamInstructions] = useState(data.finalExam?.instructions || "");
  const [passingScore, setPassingScore] = useState(data.finalExam?.passingScore || 80);
  const [timeLimit, setTimeLimit] = useState(data.finalExam?.timeLimit || 60);
  const [hasTimeLimit, setHasTimeLimit] = useState(!!data.finalExam?.timeLimit);
  const [attemptsAllowed, setAttemptsAllowed] = useState(data.finalExam?.attemptsAllowed || 3);
  const [hasAttemptsLimit, setHasAttemptsLimit] = useState(!!data.finalExam?.attemptsAllowed);
  const [questions, setQuestions] = useState<QuizQuestion[]>(data.finalExam?.questions || []);

  // Estados para crear nueva pregunta
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState<number | null>(null);
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);

  // Estados para editar pregunta existente
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState(10);

  const startEditQuestion = (question: QuizQuestion) => {
    setEditingQuestionId(question.id);
    setEditTitle(stripHtml(question.question));
    setEditOptions(question.options ?? []);
    setEditCorrectAnswer(typeof question.correctAnswer === "number" ? question.correctAnswer : null);
    setEditPoints(question.points ?? 10);
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
  };

  const saveEditQuestion = () => {
    if (!editingQuestionId) return;
    const validOptions = editOptions.filter((o) => o.trim());
    if (!editTitle.trim() || validOptions.length < 2 || editCorrectAnswer === null) return;
    setQuestions(questions.map((q) =>
      q.id === editingQuestionId
        ? { ...q, question: editTitle.trim(), options: validOptions, correctAnswer: editCorrectAnswer, points: editPoints }
        : q
    ));
    setEditingQuestionId(null);
  };

  const handleToggleExam = (enabled: boolean) => {
    setHasExam(enabled);
    if (!enabled) {
      onUpdate({ finalExam: undefined });
    } else {
      updateExam();
    }
  };

  const updateExam = () => {
    if (!hasExam) return;

    const exam: CourseFinalExam = {
      id: data.finalExam?.id || crypto.randomUUID(),
      title: examTitle,
      description: examDescription,
      instructions: examInstructions,
      passingScore,
      questions,
      timeLimit: hasTimeLimit ? timeLimit : undefined,
      attemptsAllowed: hasAttemptsLimit ? attemptsAllowed : undefined,
    };

    onUpdate({ finalExam: exam });
  };

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) {
      alert("Debes escribir la pregunta");
      return;
    }
    const validOptions = newQuestionOptions.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
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
      options: validOptions,
      correctAnswer: newQuestionCorrectAnswer,
      points: newQuestionPoints,
    };

    setQuestions([...questions, newQuestion]);
    setNewQuestionTitle("");
    setNewQuestionOptions(["", "", "", ""]);
    setNewQuestionCorrectAnswer(null);
    setNewQuestionPoints(10);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
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
    if (newQuestionOptions.filter(opt => opt.trim()).length <= 2) {
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

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleContinue = () => {
    if (hasExam) {
      if (!examTitle.trim()) {
        alert("Debes agregar un título al examen");
        return;
      }
      if (questions.length === 0) {
        alert("Debes agregar al menos una pregunta al examen");
        return;
      }
      updateExam();
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Examen final</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Agrega un examen final para evaluar el conocimiento de tus estudiantes
        </p>
      </div>

      {/* Toggle para habilitar examen */}
      <Card className="border border-border bg-card/90">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-exam" className="text-base font-semibold">
                ¿Incluir examen final?
              </Label>
              <p className="text-sm text-muted-foreground">
                Los estudiantes deben aprobar el examen para completar el curso
              </p>
            </div>
            <Switch
              id="enable-exam"
              checked={hasExam}
              onCheckedChange={handleToggleExam}
            />
          </div>
        </CardContent>
      </Card>

      {hasExam && (
        <>
          {/* Configuración del examen */}
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Configuración del examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  label="Título del examen"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <RichTextEditor
                  value={examDescription}
                  onChange={setExamDescription}
                  placeholder="Descripción del examen…"
                  minHeight="80px"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Instrucciones para el estudiante</label>
                <RichTextEditor
                  value={examInstructions}
                  onChange={setExamInstructions}
                  placeholder="Instrucciones que verá el estudiante…"
                  minHeight="100px"
                  className="mt-1"
                />
              </div>

              <Separator />

              {/* Calificación mínima */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <Label>Calificación mínima para aprobar</Label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="min-w-[60px] text-right">
                    <span className="text-2xl font-bold text-primary">{passingScore}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los estudiantes necesitan obtener al menos {passingScore}% para aprobar el curso
                </p>
              </div>

              <Separator />

              {/* Límite de tiempo */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="time-limit">Límite de tiempo</Label>
                </div>
                <Switch
                  id="time-limit"
                  checked={hasTimeLimit}
                  onCheckedChange={setHasTimeLimit}
                />
              </div>

              {hasTimeLimit && (
                <div className="pl-6">
                  <Input
                    label="Tiempo en minutos"
                    type="number"
                    min="5"
                    max="180"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Intentos permitidos */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="attempts-limit">Limitar intentos</Label>
                </div>
                <Switch
                  id="attempts-limit"
                  checked={hasAttemptsLimit}
                  onCheckedChange={setHasAttemptsLimit}
                />
              </div>

              {hasAttemptsLimit && (
                <div className="pl-6">
                  <Input
                    label="Número de intentos permitidos"
                    type="number"
                    min="1"
                    max="10"
                    value={attemptsAllowed}
                    onChange={(e) => setAttemptsAllowed(Number(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preguntas del examen */}
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Preguntas del examen</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {questions.length} {questions.length === 1 ? "pregunta" : "preguntas"}
                  </Badge>
                  <Badge variant="outline">
                    {totalPoints} puntos totales
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de preguntas */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border border-border bg-muted/20">
                      <CardContent className="p-4 space-y-2">
                        {editingQuestionId === question.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-foreground">Pregunta</label>
                              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            </div>
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-foreground">Opciones de respuesta</label>
                                <Button type="button" variant="outline" size="sm" onClick={() => setEditOptions([...editOptions, ""])} className="h-6 text-xs">
                                  <Plus className="mr-1 h-3 w-3" />
                                  Agregar
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {editOptions.map((opt, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <button type="button" onClick={() => setEditCorrectAnswer(idx)} className="shrink-0">
                                      {editCorrectAnswer === idx ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                      )}
                                    </button>
                                    <Input
                                      value={opt}
                                      onChange={(e) => {
                                        const updated = [...editOptions];
                                        updated[idx] = e.target.value;
                                        setEditOptions(updated);
                                      }}
                                      className="flex-1"
                                    />
                                    {editOptions.length > 2 && (
                                      <Button type="button" variant="ghost" size="sm" onClick={() => {
                                        const updated = editOptions.filter((_, i) => i !== idx);
                                        setEditOptions(updated);
                                        if (editCorrectAnswer === idx) setEditCorrectAnswer(null);
                                        else if (editCorrectAnswer !== null && editCorrectAnswer > idx) setEditCorrectAnswer(editCorrectAnswer - 1);
                                      }}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="w-32">
                              <Input label="Puntos" type="number" min="1" value={editPoints} onChange={(e) => setEditPoints(Number(e.target.value))} />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEditQuestion} disabled={!editTitle.trim() || editOptions.filter((o) => o.trim()).length < 2 || editCorrectAnswer === null}>
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                Guardar
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditQuestion}>
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {index + 1}. {stripHtml(question.question)}
                              </p>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center gap-2 rounded-md p-2 text-sm ${
                                        question.correctAnswer === idx
                                          ? "bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800"
                                          : "bg-card"
                                      }`}
                                    >
                                      {question.correctAnswer === idx ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className={question.correctAnswer === idx ? "font-medium text-green-900 dark:text-green-100" : ""}>
                                        {stripHtml(option)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline">
                                  {question.points} puntos
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <Button variant="ghost" size="sm" onClick={() => startEditQuestion(question)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Formulario para agregar nueva pregunta */}
              <Separator />
              <div className="space-y-4 pt-2">
                <h4 className="font-semibold text-foreground">Agregar nueva pregunta</h4>

                <div>
                  <Input
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Opciones de respuesta</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
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
                          className="shrink-0"
                        >
                          {newQuestionCorrectAnswer === index ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <Input
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
                          >
                            <Trash2 className="h-4 w-4" />
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
                    <Input
                      label="Puntos"
                      type="number"
                      min="1"
                      value={newQuestionPoints}
                      onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddQuestion}
                  disabled={
                    !newQuestionTitle.trim() ||
                    newQuestionOptions.filter((opt) => opt.trim()).length < 2 ||
                    newQuestionCorrectAnswer === null
                  }
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar pregunta al examen
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Resumen */}
      {hasExam && questions.length > 0 && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Examen configurado</p>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>• {questions.length} preguntas ({totalPoints} puntos totales)</p>
                  <p>• Calificación mínima: {passingScore}%</p>
                  {hasTimeLimit && <p>• Tiempo límite: {timeLimit} minutos</p>}
                  {hasAttemptsLimit && <p>• Intentos permitidos: {attemptsAllowed}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={handleContinue}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
