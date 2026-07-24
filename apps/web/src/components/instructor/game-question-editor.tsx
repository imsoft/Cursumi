"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
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
          <Combobox
            options={[
              { value: "multiple", label: "Opción múltiple" },
              { value: "truefalse", label: "Verdadero / Falso" },
            ]}
            value={q.type}
            onValueChange={(v) => { if (v) handleTypeChange(v as QuestionType); }}
            placeholder="Tipo"
            searchable={false}
            allowDeselect={false}
          />
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
              <Combobox
                options={[
                  {
                    value: "0",
                    label: `${OPTION_LABELS[0]}${q.options[0]?.trim() ? ` — ${q.options[0]}` : ""}`,
                  },
                  {
                    value: "1",
                    label: `${OPTION_LABELS[1]}${q.options[1]?.trim() ? ` — ${q.options[1]}` : ""}`,
                  },
                ]}
                value={String(q.correct)}
                onValueChange={(v) => { if (v) onChange({ correct: Number(v) }); }}
                placeholder="Correcta"
                searchable={false}
                allowDeselect={false}
              />
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
              <Combobox
                options={OPTION_LABELS.map((label, i) => ({
                  value: String(i),
                  label,
                }))}
                value={String(q.correct)}
                onValueChange={(v) => { if (v) onChange({ correct: Number(v) }); }}
                placeholder="Correcta"
                searchable={false}
                allowDeselect={false}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tiempo:</span>
              <Combobox
                options={[10, 15, 20, 30].map((t) => ({
                  value: String(t),
                  label: `${t}s`,
                }))}
                value={String(q.timeLimitSec)}
                onValueChange={(v) => { if (v) onChange({ timeLimitSec: Number(v) }); }}
                placeholder="Tiempo"
                searchable={false}
                allowDeselect={false}
              />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Puntos:</span>
              <Combobox
                options={[500, 1000].map((p) => ({
                  value: String(p),
                  label: String(p),
                }))}
                value={String(q.points)}
                onValueChange={(v) => { if (v) onChange({ points: Number(v) }); }}
                placeholder="Puntos"
                searchable={false}
                allowDeselect={false}
              />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
