"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export type QuestionType = "multiple" | "truefalse";

export interface QuestionForm {
  question: string;
  type: QuestionType;
  options: string[];
  correct: number;
  timeLimitSec: number;
  points: number;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function emptyQuestion(type: QuestionType = "multiple"): QuestionForm {
  if (type === "truefalse") {
    return {
      question: "",
      type: "truefalse",
      options: ["Verdadero", "Falso"],
      correct: 0,
      timeLimitSec: 15,
      points: 1000,
    };
  }
  return {
    question: "",
    type: "multiple",
    options: ["", "", "", ""],
    correct: 0,
    timeLimitSec: 20,
    points: 1000,
  };
}

interface GameQuestionEditorProps {
  index: number;
  question: QuestionForm;
  canRemove: boolean;
  onChange: (updates: Partial<QuestionForm>) => void;
  onChangeOption: (optIndex: number, value: string) => void;
  onRemove: () => void;
}

export function GameQuestionEditor({
  index,
  question: q,
  canRemove,
  onChange,
  onChangeOption,
  onRemove,
}: GameQuestionEditorProps) {
  function handleTypeChange(newType: QuestionType) {
    if (newType === q.type) return;
    if (newType === "truefalse") {
      onChange({
        type: "truefalse",
        options: ["Verdadero", "Falso"],
        correct: 0,
      });
    } else {
      onChange({
        type: "multiple",
        options: ["", "", "", ""],
        correct: 0,
      });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={q.type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="multiple">Opción múltiple</option>
            <option value="truefalse">Verdadero / Falso</option>
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Texto de la pregunta"
          value={q.question}
          onChange={(e) => onChange({ question: e.target.value })}
        />

        {q.type === "truefalse" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Edita el texto de cada opción y elige cuál es la respuesta correcta en la sala.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1].map((optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-sm font-semibold">
                    {OPTION_LABELS[optIndex]}
                  </span>
                  <Input
                    placeholder={optIndex === 0 ? "Verdadero" : "Falso"}
                    value={q.options[optIndex] ?? ""}
                    onChange={(e) => onChangeOption(optIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Respuesta correcta:</span>
              <select
                value={q.correct}
                onChange={(e) => onChange({ correct: Number(e.target.value) })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={0}>
                  {OPTION_LABELS[0]}
                  {q.options[0]?.trim() ? ` — ${q.options[0]}` : ""}
                </option>
                <option value={1}>
                  {OPTION_LABELS[1]}
                  {q.options[1]?.trim() ? ` — ${q.options[1]}` : ""}
                </option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.options.map((opt, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-sm font-semibold">
                  {OPTION_LABELS[optIndex]}
                </span>
                <Input
                  placeholder={`Opción ${OPTION_LABELS[optIndex]}`}
                  value={opt}
                  onChange={(e) => onChangeOption(optIndex, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {q.type === "multiple" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Respuesta correcta:</span>
              <select
                value={q.correct}
                onChange={(e) => onChange({ correct: Number(e.target.value) })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {OPTION_LABELS.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tiempo:</span>
            <select
              value={q.timeLimitSec}
              onChange={(e) => onChange({ timeLimitSec: Number(e.target.value) })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[10, 15, 20, 30].map((t) => (
                <option key={t} value={t}>{t}s</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Puntos:</span>
            <select
              value={q.points}
              onChange={(e) => onChange({ points: Number(e.target.value) })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[500, 1000].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
