"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy } from "lucide-react";

interface HangmanWord {
  word: string;
  hint: string;
}

interface HangmanGameProps {
  words: HangmanWord[];
  onComplete: () => void;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const MAX_WRONG = 6;

function GallowsSVG({ wrongGuesses }: { wrongGuesses: number }) {
  return (
    <svg viewBox="0 0 200 220" className="w-40 h-44 shrink-0" aria-hidden="true">
      {/* Base */}
      <line x1="20" y1="210" x2="180" y2="210" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Pole */}
      <line x1="60" y1="210" x2="60" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Beam */}
      <line x1="60" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Rope */}
      <line x1="140" y1="20" x2="140" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Head */}
      {wrongGuesses >= 1 && (
        <circle cx="140" cy="65" r="15" stroke="currentColor" strokeWidth="3" fill="none" />
      )}
      {/* Body */}
      {wrongGuesses >= 2 && (
        <line x1="140" y1="80" x2="140" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Left arm */}
      {wrongGuesses >= 3 && (
        <line x1="140" y1="95" x2="110" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Right arm */}
      {wrongGuesses >= 4 && (
        <line x1="140" y1="95" x2="170" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Left leg */}
      {wrongGuesses >= 5 && (
        <line x1="140" y1="140" x2="110" y2="175" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Right leg */}
      {wrongGuesses >= 6 && (
        <line x1="140" y1="140" x2="170" y2="175" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function HangmanGame({ words, onComplete }: HangmanGameProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wordStatus, setWordStatus] = useState<("won" | "lost" | null)[]>(() =>
    words.map(() => null)
  );
  const [transitioning, setTransitioning] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentWordObj = words[wordIndex];
  const currentWord = currentWordObj.word.toUpperCase();
  const currentHint = currentWordObj.hint;

  const wrongGuesses = [...guessedLetters].filter(
    (l) => !currentWord.includes(l)
  ).length;

  const isWordWon = currentWord.split("").every(
    (ch) => ch === " " || guessedLetters.has(ch)
  );
  const isWordLost = wrongGuesses >= MAX_WRONG;

  const advanceWord = () => {
    if (wordIndex < words.length - 1) {
      setWordIndex((i) => i + 1);
      setGuessedLetters(new Set());
      setTransitioning(false);
    } else {
      setAllDone(true);
    }
  };

  // Mark word status when won/lost
  useEffect(() => {
    if ((isWordWon || isWordLost) && !transitioning) {
      setTransitioning(true);
      const status = isWordWon ? "won" : "lost";
      setWordStatus((prev) => {
        const next = [...prev];
        next[wordIndex] = status;
        return next;
      });
    }
  }, [isWordWon, isWordLost, transitioning, wordIndex]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || transitioning) return;
    setGuessedLetters((prev) => new Set([...prev, letter]));
  };

  const wonCount = wordStatus.filter((s) => s === "won").length;

  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-900/10 p-8 text-center">
        <Trophy className="h-12 w-12 text-yellow-500" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">¡Completado!</h3>
          <p className="mt-1 text-muted-foreground">
            Adivinaste{" "}
            <span className="font-semibold text-foreground">{wonCount}</span> de{" "}
            <span className="font-semibold text-foreground">{words.length}</span> palabras.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {words.map((w, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                wordStatus[i] === "won"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {wordStatus[i] === "won" ? "✓" : "✗"} {w.word}
            </span>
          ))}
        </div>
        <Button onClick={onComplete} size="lg" className="min-w-[160px]">
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Palabra {wordIndex + 1} de {words.length}
        </span>
        <span className="text-red-500 font-medium">
          {wrongGuesses} / {MAX_WRONG} errores
        </span>
      </div>

      {/* Gallows + word display */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div
          className={`text-foreground transition-colors ${
            wrongGuesses >= MAX_WRONG - 1 ? "text-red-500" : ""
          }`}
        >
          <GallowsSVG wrongGuesses={wrongGuesses} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-4">
          {/* Hint */}
          <p className="text-sm text-muted-foreground italic">
            Pista: {currentHint}
          </p>

          {/* Word blanks */}
          <div className="flex flex-wrap justify-center gap-1">
            {currentWord.split("").map((ch, i) => {
              if (ch === " ") {
                return <div key={i} className="w-4" />;
              }
              const revealed = guessedLetters.has(ch);
              return (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className={`inline-block w-8 text-center text-xl font-bold transition-all duration-200 ${
                      revealed
                        ? isWordLost
                          ? "text-red-500"
                          : "text-foreground"
                        : isWordLost
                        ? "text-red-500"
                        : "text-transparent"
                    }`}
                  >
                    {revealed || isWordLost ? ch : "_"}
                  </span>
                  <div
                    className={`mt-0.5 h-0.5 w-8 ${
                      isWordLost && !revealed
                        ? "bg-red-400"
                        : "bg-foreground/60"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Status message + advance button */}
          {transitioning && isWordWon && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-2 text-green-800 dark:text-green-400 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                ¡Correcto!
              </div>
              <Button onClick={advanceWord} size="sm">
                {wordIndex < words.length - 1 ? "Siguiente palabra →" : "Ver resultados"}
              </Button>
            </div>
          )}
          {transitioning && isWordLost && (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-red-800 dark:text-red-400 text-sm font-medium text-center">
                La palabra era:{" "}
                <span className="font-bold">{currentWord}</span>
              </div>
              <Button onClick={advanceWord} size="sm" variant="outline">
                {wordIndex < words.length - 1 ? "Siguiente palabra →" : "Ver resultados"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard */}
      <div className="space-y-2">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 flex-wrap">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && currentWord.includes(letter);
              const isWrong = isGuessed && !currentWord.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed || transitioning}
                  className={`
                    rounded-lg px-2.5 py-2 text-sm font-bold transition-all min-w-[32px]
                    ${
                      isCorrect
                        ? "bg-green-500 text-white opacity-80 cursor-default"
                        : isWrong
                        ? "bg-red-500 text-white opacity-50 cursor-default"
                        : "bg-muted text-foreground hover:bg-muted/70 active:scale-95"
                    }
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
