"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy } from "lucide-react";
import { fireMiniConfetti } from "@/lib/minigame-confetti";
import { MinigameLevelCelebration } from "./minigame-level-celebration";

interface HangmanWord {
  word: string;
  hint: string;
}

interface HangmanGameProps {
  /** Texto opcional del instructor (orientación antes de jugar). */
  instruction?: string;
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
    <svg viewBox="0 0 200 220" className="h-44 w-40 shrink-0" aria-hidden="true">
      <line x1="20" y1="210" x2="180" y2="210" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="210" x2="60" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="140" y1="20" x2="140" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {wrongGuesses >= 1 && (
        <circle cx="140" cy="65" r="15" stroke="currentColor" strokeWidth="3" fill="none" />
      )}
      {wrongGuesses >= 2 && (
        <line x1="140" y1="80" x2="140" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {wrongGuesses >= 3 && (
        <line x1="140" y1="95" x2="110" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {wrongGuesses >= 4 && (
        <line x1="140" y1="95" x2="170" y2="120" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {wrongGuesses >= 5 && (
        <line x1="140" y1="140" x2="110" y2="175" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {wrongGuesses >= 6 && (
        <line x1="140" y1="140" x2="170" y2="175" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function HangmanGame({ instruction, words, onComplete }: HangmanGameProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wordStatus, setWordStatus] = useState<("won" | "lost" | null)[]>(() => words.map(() => null));
  const [transitioning, setTransitioning] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [levelMode, setLevelMode] = useState<"won" | "lost">("won");

  const finishSent = useRef(false);
  const lastCelebrationWord = useRef<number | null>(null);

  const currentWordObj = words[wordIndex];
  const currentWord = currentWordObj.word.toUpperCase();
  const currentHint = currentWordObj.hint;

  const wrongGuesses = [...guessedLetters].filter((l) => !currentWord.includes(l)).length;
  const isWordWon = currentWord.split("").every((ch) => ch === " " || guessedLetters.has(ch));
  const isWordLost = wrongGuesses >= MAX_WRONG;

  const advanceWord = useCallback(() => {
    if (wordIndex < words.length - 1) {
      setWordIndex((i) => i + 1);
      setGuessedLetters(new Set());
      setTransitioning(false);
    } else {
      setAllDone(true);
    }
  }, [wordIndex, words.length]);

  useEffect(() => {
    if (allDone && !finishSent.current) {
      finishSent.current = true;
      onComplete();
    }
  }, [allDone, onComplete]);

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

  useEffect(() => {
    if (!transitioning || allDone) return;
    if (lastCelebrationWord.current === wordIndex) return;
    lastCelebrationWord.current = wordIndex;
    if (isWordWon) {
      fireMiniConfetti();
    }
    setLevelMode(isWordWon ? "won" : "lost");
    setLevelOpen(true);
  }, [transitioning, wordIndex, allDone, isWordWon, isWordLost]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || transitioning) return;
    setGuessedLetters((prev) => new Set([...prev, letter]));
  };

  const wonCount = wordStatus.filter((s) => s === "won").length;

  const handleLevelDialogContinue = () => {
    lastCelebrationWord.current = null;
    advanceWord();
  };

  if (allDone) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Trophy className="h-12 w-12 text-yellow-500" />
        <p className="text-sm text-muted-foreground">
          Adivinaste {wonCount} de {words.length} palabras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {instruction?.trim() ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{instruction.trim()}</p>
      ) : null}
      <MinigameLevelCelebration
        open={levelOpen}
        onOpenChange={setLevelOpen}
        title={levelMode === "won" ? "¡Palabra acertada!" : "¡Sigue practicando!"}
        description={
          levelMode === "won"
            ? wordIndex < words.length - 1
              ? "Pasa a la siguiente palabra."
              : "Ver el resumen final."
            : `La palabra era: ${currentWord}`
        }
        onContinue={handleLevelDialogContinue}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Palabra {wordIndex + 1} de {words.length}
        </span>
        <span className="font-medium text-red-500">
          {wrongGuesses} / {MAX_WRONG} errores
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className={wrongGuesses >= MAX_WRONG - 1 ? "text-red-500" : "text-foreground"}>
          <GallowsSVG wrongGuesses={wrongGuesses} />
        </div>

        <div className="flex flex-1 flex-col items-center gap-4">
          <p className="text-sm italic text-muted-foreground">Pista: {currentHint}</p>

          <div className="flex flex-wrap justify-center gap-1">
            {currentWord.split("").map((ch, i) => {
              if (ch === " ") return <div key={i} className="w-4" />;
              const revealed = guessedLetters.has(ch);
              return (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className={`inline-block w-8 text-center text-xl font-bold ${
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
                      isWordLost && !revealed ? "bg-red-400" : "bg-foreground/60"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex flex-wrap justify-center gap-1">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && currentWord.includes(letter);
              const isWrong = isGuessed && !currentWord.includes(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed || transitioning}
                  className={`min-w-[32px] rounded-lg px-2.5 py-2 text-sm font-bold transition-all ${
                    isCorrect
                      ? "cursor-default bg-green-500 text-white opacity-80"
                      : isWrong
                      ? "cursor-default bg-red-500 text-white opacity-50"
                      : "bg-muted text-foreground hover:bg-muted/70 active:scale-95"
                  }`}
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
