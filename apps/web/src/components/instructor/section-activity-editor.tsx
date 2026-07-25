"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import {
  Plus, Trash2, ClipboardCheck, CheckCircle2, Circle, Gamepad2, ChevronUp, ChevronDown,
} from "lucide-react";
import type {
  SectionQuiz,
  SectionQuizQuestion,
  SectionMinigame,
  MemoryPair,
  HangmanWord,
  MatchPair,
} from "./course-types";

// ─── Quiz editor ─────────────────────────────────────────────────────────────

function SectionQuizEditor({
  quiz,
  onChange,
}: {
  quiz: SectionQuiz | undefined;
  onChange: (quiz: SectionQuiz | undefined) => void;
}) {
  const [hasQuiz, setHasQuiz] = useState(!!quiz);
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70);
  const [questions, setQuestions] = useState<SectionQuizQuestion[]>(quiz?.questions ?? []);

  const [newQuestion, setNewQuestion] = useState("");
  const [newType, setNewType] = useState<NonNullable<SectionQuizQuestion["type"]>>("multiple-choice");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrect, setNewCorrect] = useState<number | null>(null);
  const [newCorrectAnswers, setNewCorrectAnswers] = useState<Set<number>>(new Set());
  /** matching: columna derecha alineada con newOptions (izquierda). */
  const [newMatchRight, setNewMatchRight] = useState<string[]>(["", "", "", ""]);

  const changeNewType = (t: NonNullable<SectionQuizQuestion["type"]>) => {
    setNewType(t);
    setNewCorrect(null);
    setNewCorrectAnswers(new Set());
    if (t === "true-false") {
      setNewOptions(["Verdadero", "Falso"]);
    } else if (t === "ordering") {
      setNewOptions(["", "", ""]);
    } else {
      setNewOptions(["", "", "", ""]);
      setNewMatchRight(["", "", "", ""]);
    }
  };

  const syncUp = (enabled: boolean, qs: SectionQuizQuestion[], score: number) => {
    if (!enabled) {
      onChange(undefined);
    } else {
      // Always emit the quiz object while enabled, even with 0 questions,
      // so the parent keeps "quiz" mode selected while the instructor configures it.
      onChange({ passingScore: score, questions: qs });
    }
  };

  const toggleQuiz = (enabled: boolean) => {
    setHasQuiz(enabled);
    syncUp(enabled, questions, passingScore);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    let q: SectionQuizQuestion | null = null;

    if (newType === "true-false") {
      if (newCorrect === null) return;
      q = { question: newQuestion.trim(), type: "true-false", options: ["Verdadero", "Falso"], correct: newCorrect };
    } else if (newType === "multiple-choice") {
      const validOptions = newOptions.filter((o) => o.trim());
      if (validOptions.length < 2 || newCorrect === null || !newOptions[newCorrect]?.trim()) return;
      // Reindexa "correct" tras filtrar opciones vacías.
      const correctIdx = newOptions.slice(0, newCorrect + 1).filter((o) => o.trim()).length - 1;
      q = { question: newQuestion.trim(), type: "multiple-choice", options: validOptions, correct: correctIdx };
    } else if (newType === "checkbox") {
      const kept = newOptions.map((o, i) => ({ o, i })).filter((x) => x.o.trim());
      if (kept.length < 2 || newCorrectAnswers.size === 0) return;
      const correctAnswers = kept
        .map((x, newIdx) => (newCorrectAnswers.has(x.i) ? newIdx : -1))
        .filter((n) => n >= 0);
      if (correctAnswers.length === 0) return;
      q = {
        question: newQuestion.trim(), type: "checkbox",
        options: kept.map((x) => x.o.trim()), correct: correctAnswers[0], correctAnswers,
      };
    } else if (newType === "ordering") {
      const validOptions = newOptions.filter((o) => o.trim());
      if (validOptions.length < 2) return;
      q = { question: newQuestion.trim(), type: "ordering", options: validOptions, correct: 0 };
    } else if (newType === "matching") {
      const pairs = newOptions
        .map((left, i) => ({ left: left.trim(), right: (newMatchRight[i] ?? "").trim() }))
        .filter((p) => p.left && p.right);
      if (pairs.length < 2) return;
      q = {
        question: newQuestion.trim(), type: "matching",
        options: pairs.map((p) => p.left), matchRight: pairs.map((p) => p.right), correct: 0,
      };
    }

    if (!q) return;
    const updated = [...questions, q];
    setQuestions(updated);
    setNewQuestion("");
    setNewType("multiple-choice");
    setNewOptions(["", "", "", ""]);
    setNewCorrect(null);
    setNewCorrectAnswers(new Set());
    setNewMatchRight(["", "", "", ""]);
    syncUp(true, updated, passingScore);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    syncUp(hasQuiz, updated, passingScore);
  };

  const replaceQuestion = (index: number, q: SectionQuizQuestion) => {
    const updated = questions.map((prev, i) => (i === index ? q : prev));
    setQuestions(updated);
    syncUp(hasQuiz, updated, passingScore);
  };

  const handleScoreChange = (score: number) => {
    setPassingScore(score);
    syncUp(hasQuiz, questions, score);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <div>
            <Label className="text-sm font-medium">Test al final de la sección</Label>
            <p className="text-xs text-muted-foreground">
              Los estudiantes deben aprobarlo para continuar
            </p>
          </div>
        </div>
        <Switch checked={hasQuiz} onCheckedChange={toggleQuiz} />
      </div>

      {hasQuiz && (
        <>
          <div className="space-y-2 rounded-lg border border-border bg-muted/10 p-4">
            <Label className="text-sm font-medium">Calificación mínima para aprobar</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={passingScore}
                onChange={(e) => handleScoreChange(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-bold text-primary min-w-12 text-right">
                {passingScore}%
              </span>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Preguntas del test</p>
              {questions.map((q, qi) => {
                const qType = q.type ?? "multiple-choice";
                const typeLabel =
                  qType === "true-false" ? "V / F"
                  : qType === "checkbox" ? "Casillas"
                  : qType === "ordering" ? "Ordenar"
                  : qType === "matching" ? "Relacionar"
                  : "Opción múltiple";
                const editableOptions = qType === "multiple-choice" || qType === "checkbox";
                const validOpts = q.options.filter((o) => o.trim());
                let invalid = false;
                if (editableOptions) {
                  invalid =
                    validOpts.length < 2 ||
                    (qType === "multiple-choice"
                      ? q.correct < 0 || q.correct >= q.options.length
                      : !q.correctAnswers || q.correctAnswers.length === 0);
                } else if (qType === "ordering") {
                  invalid = validOpts.length < 2;
                } else if (qType === "matching") {
                  invalid =
                    q.options.filter((left, i) => left.trim() && (q.matchRight?.[i] ?? "").trim())
                      .length < 2;
                }
                return (
                  <Card key={qi} className="border border-border bg-muted/10">
                    <CardContent className="space-y-3 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Pregunta {qi + 1}</Label>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {typeLabel}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(qi)}
                          className="shrink-0 -mt-1"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Enunciado de la pregunta..."
                        value={q.question}
                        rows={3}
                        className="min-h-18 resize-y text-sm"
                        onChange={(e) =>
                          replaceQuestion(qi, { ...q, question: e.target.value })
                        }
                      />

                      {/* MC / Casillas: opciones editables con marcador de correcta(s) */}
                      {editableOptions && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            {qType === "checkbox"
                              ? "Opciones (marca todas las correctas)"
                              : "Opciones (elige la correcta)"}
                          </Label>
                          {q.options.map((opt, oi) => {
                            const isCorrect =
                              qType === "checkbox"
                                ? (q.correctAnswers ?? []).includes(oi)
                                : q.correct === oi;
                            return (
                              <div key={oi} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (qType === "checkbox") {
                                      const set = new Set(q.correctAnswers ?? []);
                                      if (set.has(oi)) set.delete(oi);
                                      else set.add(oi);
                                      const correctAnswers = [...set].sort((a, b) => a - b);
                                      replaceQuestion(qi, {
                                        ...q,
                                        correctAnswers,
                                        correct: correctAnswers[0] ?? 0,
                                      });
                                    } else {
                                      replaceQuestion(qi, { ...q, correct: oi });
                                    }
                                  }}
                                  className="shrink-0"
                                  title="Marcar como correcta"
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                                  )}
                                </button>
                                <Input
                                  value={opt}
                                  placeholder={`Opción ${oi + 1}`}
                                  className="text-sm"
                                  onChange={(e) => {
                                    const next = [...q.options];
                                    next[oi] = e.target.value;
                                    replaceQuestion(qi, { ...q, options: next });
                                  }}
                                />
                                {q.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 px-2"
                                    onClick={() => {
                                      const next = q.options.filter((_, j) => j !== oi);
                                      if (qType === "checkbox") {
                                        const correctAnswers = (q.correctAnswers ?? [])
                                          .filter((c) => c !== oi)
                                          .map((c) => (c > oi ? c - 1 : c));
                                        replaceQuestion(qi, {
                                          ...q,
                                          options: next,
                                          correctAnswers,
                                          correct: correctAnswers[0] ?? 0,
                                        });
                                      } else {
                                        let correct = q.correct;
                                        if (correct === oi) correct = 0;
                                        else if (correct > oi) correct -= 1;
                                        replaceQuestion(qi, { ...q, options: next, correct });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                          {q.options.length < 8 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() =>
                                replaceQuestion(qi, {
                                  ...q,
                                  options: [...q.options, ""],
                                })
                              }
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Añadir opción
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Verdadero/Falso: elegir cuál es la correcta */}
                      {qType === "true-false" && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Respuesta correcta</Label>
                          {["Verdadero", "Falso"].map((opt, oi) => (
                            <button
                              key={oi}
                              type="button"
                              onClick={() =>
                                replaceQuestion(qi, {
                                  ...q,
                                  options: ["Verdadero", "Falso"],
                                  correct: oi,
                                })
                              }
                              className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm"
                            >
                              {q.correct === oi ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Ordenar: elementos en su orden correcto (editable) */}
                      {qType === "ordering" && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Elementos en su orden correcto (se barajan al alumno)
                          </Label>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="w-5 shrink-0 text-right text-sm font-medium text-muted-foreground">
                                {oi + 1}.
                              </span>
                              <div className="flex shrink-0 flex-col">
                                <button
                                  type="button"
                                  disabled={oi === 0}
                                  className="text-muted-foreground hover:text-primary disabled:opacity-30"
                                  onClick={() => {
                                    const next = [...q.options];
                                    [next[oi - 1], next[oi]] = [next[oi], next[oi - 1]];
                                    replaceQuestion(qi, { ...q, options: next });
                                  }}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={oi === q.options.length - 1}
                                  className="text-muted-foreground hover:text-primary disabled:opacity-30"
                                  onClick={() => {
                                    const next = [...q.options];
                                    [next[oi + 1], next[oi]] = [next[oi], next[oi + 1]];
                                    replaceQuestion(qi, { ...q, options: next });
                                  }}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>
                              <Input
                                value={opt}
                                placeholder={`Elemento ${oi + 1}`}
                                className="text-sm"
                                onChange={(e) => {
                                  const next = [...q.options];
                                  next[oi] = e.target.value;
                                  replaceQuestion(qi, { ...q, options: next });
                                }}
                              />
                              {q.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 px-2"
                                  onClick={() =>
                                    replaceQuestion(qi, {
                                      ...q,
                                      options: q.options.filter((_, j) => j !== oi),
                                    })
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {q.options.length < 8 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() =>
                                replaceQuestion(qi, { ...q, options: [...q.options, ""] })
                              }
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Añadir elemento
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Relacionar: parejas izquierda ↔ derecha (editable) */}
                      {qType === "matching" && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Parejas (columna izquierda ↔ su pareja correcta)
                          </Label>
                          {q.options.map((left, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <Input
                                value={left}
                                placeholder={`Elemento ${oi + 1}`}
                                className="flex-1 text-sm"
                                onChange={(e) => {
                                  const next = [...q.options];
                                  next[oi] = e.target.value;
                                  replaceQuestion(qi, { ...q, options: next });
                                }}
                              />
                              <span className="text-muted-foreground">↔</span>
                              <Input
                                value={q.matchRight?.[oi] ?? ""}
                                placeholder="Su pareja"
                                className="flex-1 text-sm"
                                onChange={(e) => {
                                  const next = [...(q.matchRight ?? q.options.map(() => ""))];
                                  next[oi] = e.target.value;
                                  replaceQuestion(qi, { ...q, matchRight: next });
                                }}
                              />
                              {q.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 px-2"
                                  onClick={() =>
                                    replaceQuestion(qi, {
                                      ...q,
                                      options: q.options.filter((_, j) => j !== oi),
                                      matchRight: (q.matchRight ?? []).filter((_, j) => j !== oi),
                                    })
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          {q.options.length < 8 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-fit"
                              onClick={() =>
                                replaceQuestion(qi, {
                                  ...q,
                                  options: [...q.options, ""],
                                  matchRight: [...(q.matchRight ?? q.options.map(() => "")), ""],
                                })
                              }
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Añadir pareja
                            </Button>
                          )}
                        </div>
                      )}

                      {invalid && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Necesitas al menos 2 opciones con texto y una respuesta correcta válida.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Agregar pregunta</p>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tipo de pregunta</Label>
              <Combobox
                value={newType}
                onValueChange={(val) => changeNewType(val as NonNullable<SectionQuizQuestion["type"]>)}
                options={[
                  { value: "multiple-choice", label: "Opción múltiple" },
                  { value: "checkbox", label: "Varias correctas (casillas)" },
                  { value: "true-false", label: "Verdadero / Falso" },
                  { value: "ordering", label: "Ordenar secuencia" },
                  { value: "matching", label: "Relacionar columnas" },
                ]}
              />
            </div>

            <Input
              placeholder="Escribe la pregunta..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />

            {/* Verdadero / Falso */}
            {newType === "true-false" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Respuesta correcta</Label>
                {["Verdadero", "Falso"].map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewCorrect(i)}
                    className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm"
                  >
                    {newCorrect === i ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Opción múltiple / Casillas */}
            {(newType === "multiple-choice" || newType === "checkbox") && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {newType === "checkbox"
                    ? "Opciones (marca todas las correctas)"
                    : "Opciones (marca la correcta)"}
                </Label>
                {newOptions.map((opt, i) => {
                  const isCorrect =
                    newType === "checkbox" ? newCorrectAnswers.has(i) : newCorrect === i;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (newType === "checkbox") {
                            const set = new Set(newCorrectAnswers);
                            if (set.has(i)) set.delete(i);
                            else set.add(i);
                            setNewCorrectAnswers(set);
                          } else {
                            setNewCorrect(i);
                          }
                        }}
                        className="shrink-0"
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <Input
                        value={opt}
                        placeholder={`Opción ${i + 1}`}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                      />
                      {newOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 px-2"
                          onClick={() => {
                            setNewOptions(newOptions.filter((_, j) => j !== i));
                            if (newType === "checkbox") {
                              const set = new Set(
                                [...newCorrectAnswers]
                                  .filter((c) => c !== i)
                                  .map((c) => (c > i ? c - 1 : c)),
                              );
                              setNewCorrectAnswers(set);
                            } else if (newCorrect !== null) {
                              if (newCorrect === i) setNewCorrect(null);
                              else if (newCorrect > i) setNewCorrect(newCorrect - 1);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                {newOptions.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => setNewOptions([...newOptions, ""])}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Añadir opción
                  </Button>
                )}
              </div>
            )}

            {/* Ordenar secuencia: escribe los elementos en su orden correcto */}
            {newType === "ordering" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Elementos en su orden correcto (se barajan al alumno)
                </Label>
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-right text-sm font-medium text-muted-foreground">
                      {i + 1}.
                    </span>
                    <Input
                      value={opt}
                      placeholder={`Elemento ${i + 1}`}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[i] = e.target.value;
                        setNewOptions(updated);
                      }}
                    />
                    {newOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 px-2"
                        onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {newOptions.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => setNewOptions([...newOptions, ""])}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Añadir elemento
                  </Button>
                )}
              </div>
            )}

            {/* Relacionar columnas: parejas izquierda ↔ derecha */}
            {newType === "matching" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Parejas (columna izquierda ↔ su pareja correcta)
                </Label>
                {newOptions.map((left, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={left}
                      placeholder={`Elemento ${i + 1}`}
                      className="flex-1"
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[i] = e.target.value;
                        setNewOptions(updated);
                      }}
                    />
                    <span className="text-muted-foreground">↔</span>
                    <Input
                      value={newMatchRight[i] ?? ""}
                      placeholder="Su pareja"
                      className="flex-1"
                      onChange={(e) => {
                        const updated = [...newMatchRight];
                        updated[i] = e.target.value;
                        setNewMatchRight(updated);
                      }}
                    />
                    {newOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 px-2"
                        onClick={() => {
                          setNewOptions(newOptions.filter((_, j) => j !== i));
                          setNewMatchRight(newMatchRight.filter((_, j) => j !== i));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                {newOptions.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => {
                      setNewOptions([...newOptions, ""]);
                      setNewMatchRight([...newMatchRight, ""]);
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Añadir pareja
                  </Button>
                )}
              </div>
            )}

            <Button
              size="sm"
              onClick={handleAddQuestion}
              disabled={
                !newQuestion.trim() ||
                (newType === "true-false" && newCorrect === null) ||
                (newType === "multiple-choice" &&
                  (newOptions.filter((o) => o.trim()).length < 2 ||
                    newCorrect === null ||
                    !newOptions[newCorrect]?.trim())) ||
                (newType === "checkbox" &&
                  (newOptions.filter((o) => o.trim()).length < 2 || newCorrectAnswers.size === 0)) ||
                (newType === "ordering" && newOptions.filter((o) => o.trim()).length < 2) ||
                (newType === "matching" &&
                  newOptions.filter((left, i) => left.trim() && (newMatchRight[i] ?? "").trim())
                    .length < 2)
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Agregar pregunta
            </Button>
          </div>

          {questions.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm text-primary">
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              <span>
                Test configurado: {questions.length} {questions.length === 1 ? "pregunta" : "preguntas"} — mínimo {passingScore}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Minigame editors ────────────────────────────────────────────────────────

function MemoryMinigameEditor({
  instruction,
  pairs,
  onInstructionChange,
  onPairsChange,
}: {
  instruction: string;
  pairs: MemoryPair[];
  onInstructionChange: (v: string) => void;
  onPairsChange: (pairs: MemoryPair[]) => void;
}) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const addPair = () => {
    if (!term.trim() || !definition.trim()) return;
    if (pairs.length >= 8) return;
    onPairsChange([...pairs, { term: term.trim(), definition: definition.trim() }]);
    setTerm("");
    setDefinition("");
  };

  const removePair = (i: number) => onPairsChange(pairs.filter((_, idx) => idx !== i));

  const updatePair = (index: number, field: "term" | "definition", value: string) => {
    onPairsChange(
      pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Instrucción para el alumno</Label>
        <Textarea
          placeholder="Ej: Empareja cada concepto con su definición."
          value={instruction ?? ""}
          onChange={(e) => onInstructionChange(e.target.value)}
          rows={3}
          className="min-h-20 resize-y text-foreground placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Se muestra arriba del juego para orientar al estudiante.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">Mínimo 4 pares, máximo 8</p>
      {pairs.map((p, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 sm:flex-row sm:items-center"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              value={p.term}
              placeholder="Término"
              onChange={(e) => updatePair(i, "term", e.target.value)}
              className="text-sm"
            />
            <Input
              value={p.definition}
              placeholder="Definición"
              onChange={(e) => updatePair(i, "definition", e.target.value)}
              className="text-sm"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => removePair(i)} className="shrink-0 self-end sm:self-center">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {pairs.length < 8 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <Input placeholder="Término" value={term} onChange={(e) => setTerm(e.target.value)} />
          <Input placeholder="Definición" value={definition} onChange={(e) => setDefinition(e.target.value)} />
          <Button size="sm" onClick={addPair} disabled={!term.trim() || !definition.trim() || pairs.length >= 8}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir par
          </Button>
        </div>
      )}
      {pairs.length < 4 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {4 - pairs.length} par{4 - pairs.length !== 1 ? "es" : ""} más.
        </p>
      )}
    </div>
  );
}

function HangmanMinigameEditor({
  instruction,
  words,
  onInstructionChange,
  onWordsChange,
}: {
  instruction: string;
  words: HangmanWord[];
  onInstructionChange: (v: string) => void;
  onWordsChange: (words: HangmanWord[]) => void;
}) {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");

  const addWord = () => {
    const clean = word.toUpperCase().trim();
    if (!clean || !hint.trim()) return;
    if (words.length >= 5) return;
    onWordsChange([...words, { word: clean, hint: hint.trim() }]);
    setWord("");
    setHint("");
  };

  const removeWord = (i: number) => onWordsChange(words.filter((_, idx) => idx !== i));

  const updateWord = (index: number, field: "word" | "hint", value: string) => {
    onWordsChange(
      words.map((w, i) => {
        if (i !== index) return w;
        if (field === "word") {
          return { ...w, word: value.toUpperCase() };
        }
        return { ...w, hint: value };
      }),
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Instrucción para el alumno</Label>
        <Textarea
          placeholder="Ej: Adivina cada palabra usando la pista. Letras de la A a la Z, sin tildes."
          value={instruction ?? ""}
          onChange={(e) => onInstructionChange(e.target.value)}
          rows={3}
          className="min-h-20 resize-y text-foreground placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Se muestra arriba del juego.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">3–5 palabras, sin tildes ni caracteres especiales</p>
      {words.map((w, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 sm:flex-row sm:items-end"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Palabra</Label>
              <Input
                value={w.word}
                placeholder="PALABRA"
                className="font-mono text-sm"
                onChange={(e) => updateWord(i, "word", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pista</Label>
              <Input
                value={w.hint}
                placeholder="Pista para el alumno"
                className="text-sm"
                onChange={(e) => updateWord(i, "hint", e.target.value)}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeWord(i)} className="shrink-0 self-end">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {words.length < 5 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <Input placeholder="Palabra (se convertirá a mayúsculas)" value={word} onChange={(e) => setWord(e.target.value.toUpperCase())} />
          <Input placeholder="Pista para el alumno" value={hint} onChange={(e) => setHint(e.target.value)} />
          <Button size="sm" onClick={addWord} disabled={!word.trim() || !hint.trim() || words.length >= 5}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir palabra
          </Button>
        </div>
      )}
      {words.length < 3 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {3 - words.length} palabra{3 - words.length !== 1 ? "s" : ""} más.
        </p>
      )}
    </div>
  );
}

function SortMinigameEditor({
  instruction,
  items,
  onInstructionChange,
  onItemsChange,
}: {
  instruction: string;
  items: string[];
  onInstructionChange: (v: string) => void;
  onItemsChange: (v: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    if (items.length >= 8) return;
    onItemsChange([...items, newItem.trim()]);
    setNewItem("");
  };

  const removeItem = (i: number) => onItemsChange(items.filter((_, idx) => idx !== i));

  const updateItem = (index: number, value: string) => {
    onItemsChange(items.map((it, i) => (i === index ? value : it)));
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onItemsChange(next);
  };

  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onItemsChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Instrucción para el alumno</Label>
        <Textarea
          placeholder="Ej: Ordena los pasos del proceso"
          value={instruction ?? ""}
          onChange={(e) => onInstructionChange(e.target.value)}
          rows={3}
          className="min-h-20 resize-y text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Define los ítems en el orden CORRECTO (4–8 ítems)
      </p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 text-sm">
          <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
          <Input
            value={item}
            className="flex-1 text-sm"
            onChange={(e) => updateItem(i, e.target.value)}
          />
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i === items.length - 1}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {items.length < 8 && (
        <div className="flex gap-2">
          <Input
            placeholder="Nuevo ítem..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          />
          <Button size="sm" onClick={addItem} disabled={!newItem.trim() || items.length >= 8}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {items.length < 4 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {4 - items.length} ítem{4 - items.length !== 1 ? "s" : ""} más.
        </p>
      )}
    </div>
  );
}

function MatchMinigameEditor({
  instruction,
  pairs,
  onInstructionChange,
  onPairsChange,
}: {
  instruction: string;
  pairs: MatchPair[];
  onInstructionChange: (v: string) => void;
  onPairsChange: (v: MatchPair[]) => void;
}) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const addPair = () => {
    if (!left.trim() || !right.trim()) return;
    if (pairs.length >= 8) return;
    onPairsChange([...pairs, { left: left.trim(), right: right.trim() }]);
    setLeft("");
    setRight("");
  };

  const removePair = (i: number) => onPairsChange(pairs.filter((_, idx) => idx !== i));

  const updatePair = (index: number, field: "left" | "right", value: string) => {
    onPairsChange(
      pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Instrucción para el alumno</Label>
        <Textarea
          placeholder="Ej: Conecta cada concepto con su definición"
          value={instruction ?? ""}
          onChange={(e) => onInstructionChange(e.target.value)}
          rows={3}
          className="min-h-20 resize-y text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Define los pares correctos (4–8 pares). Se mostrarán desordenados al alumno.
      </p>
      {pairs.map((p, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2 sm:flex-row sm:items-center"
        >
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Input
              value={p.left}
              placeholder="Columna A"
              className="text-sm"
              onChange={(e) => updatePair(i, "left", e.target.value)}
            />
            <Input
              value={p.right}
              placeholder="Columna B"
              className="text-sm"
              onChange={(e) => updatePair(i, "right", e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => removePair(i)} className="shrink-0 self-end sm:self-center">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {pairs.length < 8 && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Columna A (concepto)" value={left} onChange={(e) => setLeft(e.target.value)} />
            <Input placeholder="Columna B (definición)" value={right} onChange={(e) => setRight(e.target.value)} />
          </div>
          <Button size="sm" onClick={addPair} disabled={!left.trim() || !right.trim() || pairs.length >= 8}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Añadir par
          </Button>
        </div>
      )}
      {pairs.length < 4 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Añade al menos {4 - pairs.length} par{4 - pairs.length !== 1 ? "es" : ""} más.
        </p>
      )}
    </div>
  );
}

// ─── Main activity editor ────────────────────────────────────────────────────

type ActivityType = "none" | "quiz" | "memory" | "hangman" | "sort" | "match";

const ACTIVITY_OPTIONS: { type: ActivityType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "none", label: "Ninguna", icon: <Circle className="h-4 w-4" />, description: "Sin actividad" },
  { type: "quiz", label: "Test", icon: <ClipboardCheck className="h-4 w-4" />, description: "Preguntas tipo test" },
  { type: "memory", label: "Memoria", icon: <Gamepad2 className="h-4 w-4" />, description: "Emparejar tarjetas" },
  { type: "hangman", label: "Ahorcado", icon: <Gamepad2 className="h-4 w-4" />, description: "Adivinar palabras" },
  { type: "sort", label: "Ordenar", icon: <Gamepad2 className="h-4 w-4" />, description: "Ordenar elementos" },
  { type: "match", label: "Conectar", icon: <Gamepad2 className="h-4 w-4" />, description: "Conectar columnas" },
];

const MINIGAME_ONLY_OPTIONS = ACTIVITY_OPTIONS.filter((o) =>
  ["memory", "hangman", "sort", "match"].includes(o.type),
);

export type SectionActivityEditorMode = "section" | "lessonQuiz" | "lessonMinigame";

export function SectionActivityEditor({
  mode = "section",
  quiz,
  minigame,
  onQuizChange,
  onMinigameChange,
}: {
  mode?: SectionActivityEditorMode;
  quiz: SectionQuiz | undefined;
  minigame: SectionMinigame | undefined;
  onQuizChange: (quiz: SectionQuiz | undefined) => void;
  onMinigameChange: (minigame: SectionMinigame | undefined) => void;
}) {
  if (mode === "lessonQuiz") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Este tipo de lección es un test: el alumno debe alcanzar la calificación mínima para marcar la
          lección como completada.
        </p>
        <SectionQuizEditor quiz={quiz} onChange={onQuizChange} />
      </div>
    );
  }

  if (mode === "lessonMinigame") {
    const currentType: ActivityType = minigame
      ? (minigame.type as ActivityType)
      : "memory";

    const handleMiniTypeChange = (type: ActivityType) => {
      if (type === "memory") {
        onMinigameChange({ type: "memory", instruction: "", pairs: [] });
      } else if (type === "hangman") {
        onMinigameChange({ type: "hangman", instruction: "", words: [] });
      } else if (type === "sort") {
        onMinigameChange({ type: "sort", instruction: "", items: [] });
      } else if (type === "match") {
        onMinigameChange({ type: "match", instruction: "", pairs: [] });
      }
    };

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Elige el tipo de minijuego. El alumno debe completarlo para avanzar.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {MINIGAME_ONLY_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleMiniTypeChange(opt.type)}
              className={`
              flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all
              ${
                currentType === opt.type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
              }
            `}
            >
              {opt.icon}
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] leading-tight opacity-70">{opt.description}</span>
            </button>
          ))}
        </div>

        {minigame?.type === "memory" && (
          <MemoryMinigameEditor
            instruction={minigame.instruction ?? ""}
            pairs={minigame.pairs}
            onInstructionChange={(instruction) =>
              onMinigameChange({ type: "memory", instruction, pairs: minigame.pairs })
            }
            onPairsChange={(pairs) =>
              onMinigameChange({
                type: "memory",
                instruction: minigame.instruction ?? "",
                pairs,
              })
            }
          />
        )}

        {minigame?.type === "hangman" && (
          <HangmanMinigameEditor
            instruction={minigame.instruction ?? ""}
            words={minigame.words}
            onInstructionChange={(instruction) =>
              onMinigameChange({ type: "hangman", instruction, words: minigame.words })
            }
            onWordsChange={(words) =>
              onMinigameChange({
                type: "hangman",
                instruction: minigame.instruction ?? "",
                words,
              })
            }
          />
        )}

        {minigame?.type === "sort" && (
          <SortMinigameEditor
            instruction={minigame.instruction ?? ""}
            items={minigame.items}
            onInstructionChange={(instruction) =>
              onMinigameChange({ type: "sort", instruction, items: minigame.items })
            }
            onItemsChange={(items) =>
              onMinigameChange({ type: "sort", instruction: minigame.instruction ?? "", items })
            }
          />
        )}

        {minigame?.type === "match" && (
          <MatchMinigameEditor
            instruction={minigame.instruction ?? ""}
            pairs={minigame.pairs}
            onInstructionChange={(instruction) =>
              onMinigameChange({ type: "match", instruction, pairs: minigame.pairs })
            }
            onPairsChange={(pairs) =>
              onMinigameChange({ type: "match", instruction: minigame.instruction ?? "", pairs })
            }
          />
        )}
      </div>
    );
  }

  const currentType: ActivityType = minigame
    ? (minigame.type as ActivityType)
    : quiz
    ? "quiz"
    : "none";

  const handleTypeChange = (type: ActivityType) => {
    if (type === "none") {
      onQuizChange(undefined);
      onMinigameChange(undefined);
    } else if (type === "quiz") {
      onMinigameChange(undefined);
      if (!quiz) onQuizChange({ passingScore: 70, questions: [] });
    } else if (type === "memory") {
      onQuizChange(undefined);
      onMinigameChange({ type: "memory", instruction: "", pairs: [] });
    } else if (type === "hangman") {
      onQuizChange(undefined);
      onMinigameChange({ type: "hangman", instruction: "", words: [] });
    } else if (type === "sort") {
      onQuizChange(undefined);
      onMinigameChange({ type: "sort", instruction: "", items: [] });
    } else if (type === "match") {
      onQuizChange(undefined);
      onMinigameChange({ type: "match", instruction: "", pairs: [] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {ACTIVITY_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleTypeChange(opt.type)}
            className={`
              flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all
              ${
                currentType === opt.type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
              }
            `}
          >
            {opt.icon}
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[10px] leading-tight opacity-70">{opt.description}</span>
          </button>
        ))}
      </div>

      {currentType === "quiz" && (
        <SectionQuizEditor quiz={quiz} onChange={onQuizChange} />
      )}

      {currentType === "memory" && minigame?.type === "memory" && (
        <MemoryMinigameEditor
          instruction={minigame.instruction ?? ""}
          pairs={minigame.pairs}
          onInstructionChange={(instruction) =>
            onMinigameChange({ type: "memory", instruction, pairs: minigame.pairs })
          }
          onPairsChange={(pairs) =>
            onMinigameChange({
              type: "memory",
              instruction: minigame.instruction ?? "",
              pairs,
            })
          }
        />
      )}

      {currentType === "hangman" && minigame?.type === "hangman" && (
        <HangmanMinigameEditor
          instruction={minigame.instruction ?? ""}
          words={minigame.words}
          onInstructionChange={(instruction) =>
            onMinigameChange({ type: "hangman", instruction, words: minigame.words })
          }
          onWordsChange={(words) =>
            onMinigameChange({
              type: "hangman",
              instruction: minigame.instruction ?? "",
              words,
            })
          }
        />
      )}

      {currentType === "sort" && minigame?.type === "sort" && (
        <SortMinigameEditor
          instruction={minigame.instruction ?? ""}
          items={minigame.items}
          onInstructionChange={(instruction) =>
            onMinigameChange({ type: "sort", instruction, items: minigame.items })
          }
          onItemsChange={(items) =>
            onMinigameChange({ type: "sort", instruction: minigame.instruction ?? "", items })
          }
        />
      )}

      {currentType === "match" && minigame?.type === "match" && (
        <MatchMinigameEditor
          instruction={minigame.instruction ?? ""}
          pairs={minigame.pairs}
          onInstructionChange={(instruction) =>
            onMinigameChange({ type: "match", instruction, pairs: minigame.pairs })
          }
          onPairsChange={(pairs) =>
            onMinigameChange({ type: "match", instruction: minigame.instruction ?? "", pairs })
          }
        />
      )}
    </div>
  );
}
