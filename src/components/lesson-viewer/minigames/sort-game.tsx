"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy, ChevronUp, ChevronDown } from "lucide-react";

interface SortGameProps {
  instruction: string;
  items: string[]; // correct order
  onComplete: () => void;
}

function fisherYates(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Make sure it's not already in order
  const sameAsOriginal = a.every((v, i) => v === arr[i]);
  if (sameAsOriginal && arr.length > 1) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

export function SortGame({ instruction, items, onComplete }: SortGameProps) {
  const [order, setOrder] = useState<string[]>(() => fisherYates(items));
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);

  const correctOrder = items;

  const moveUp = (index: number) => {
    if (index === 0) return;
    if (checked) { setChecked(false); }
    setOrder((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    if (checked) { setChecked(false); }
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleCheck = () => {
    const allCorrect = order.every((item, i) => item === correctOrder[i]);
    setChecked(true);
    setAttempts((a) => a + 1);
    if (allCorrect) {
      setWon(true);
    }
  };

  const handleRetry = () => {
    setChecked(false);
  };

  const correctCount = order.filter((item, i) => item === correctOrder[i]).length;

  if (won) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-900/10 p-8 text-center">
        <Trophy className="h-12 w-12 text-yellow-500" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">¡Correcto!</h3>
          <p className="mt-1 text-muted-foreground">
            Ordenaste todos los elementos correctamente
            {attempts > 1 ? ` en ${attempts} intentos` : ""}.
          </p>
        </div>
        <div className="space-y-2 text-left w-full max-w-sm">
          {order.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-50 dark:bg-green-900/20 p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-green-800 dark:text-green-400">{item}</span>
              <CheckCircle className="ml-auto h-4 w-4 text-green-600 shrink-0" />
            </div>
          ))}
        </div>
        <Button onClick={onComplete} size="lg" className="min-w-[160px]">
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground italic">{instruction}</p>

      <div className="space-y-2">
        {order.map((item, i) => {
          const isCorrect = checked && item === correctOrder[i];
          const isWrong = checked && item !== correctOrder[i];
          return (
            <div
              key={`${item}-${i}`}
              className={`
                flex items-center gap-3 rounded-xl border p-4 transition-all
                ${
                  isCorrect
                    ? "border-green-500/50 bg-green-50 dark:bg-green-900/20"
                    : isWrong
                    ? "border-red-400/50 bg-red-50 dark:bg-red-900/20"
                    : "border-border bg-card"
                }
              `}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCorrect
                    ? "bg-green-500 text-white"
                    : isWrong
                    ? "bg-red-400 text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`flex-1 text-sm font-medium ${
                  isCorrect
                    ? "text-green-800 dark:text-green-400"
                    : isWrong
                    ? "text-red-800 dark:text-red-400"
                    : "text-foreground"
                }`}
              >
                {item}
              </span>
              {isCorrect && <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />}
              {isWrong && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
              {!checked && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === order.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!checked && (
        <Button onClick={handleCheck} className="w-full">
          Comprobar orden
        </Button>
      )}

      {checked && !won && (
        <div className="space-y-3">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-400">
            {correctCount === order.length ? (
              "¡Todo correcto!"
            ) : (
              <>
                {correctCount} de {order.length} elementos en la posición correcta.{" "}
                {attempts < 3 ? "Sigue intentando." : "Revisa el orden e inténtalo de nuevo."}
              </>
            )}
          </div>

          {attempts >= 3 ? (
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleRetry}>
                Reintentar
              </Button>
              <Button variant="ghost" onClick={onComplete} className="text-muted-foreground text-sm">
                Continuar de todas formas
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleRetry}>
              Reintentar
            </Button>
          )}
        </div>
      )}

      {attempts > 0 && !checked && (
        <p className="text-center text-xs text-muted-foreground">
          Intento {attempts} — reordena y vuelve a comprobar
        </p>
      )}
    </div>
  );
}
