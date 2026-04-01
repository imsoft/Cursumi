"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { fireMiniConfetti } from "@/lib/minigame-confetti";
import { MinigameLevelCelebration } from "./minigame-level-celebration";

interface MatchPair {
  left: string;
  right: string;
}

interface MatchGameProps {
  instruction: string;
  pairs: MatchPair[];
  onComplete: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchGame({ instruction, pairs, onComplete }: MatchGameProps) {
  const leftItems = useMemo(() => pairs.map((p) => p.left), [pairs]);
  const [shuffledRight] = useState(() => shuffle(pairs.map((p) => p.right)));

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [matchedRight, setMatchedRight] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  const prevMatchedCount = useRef(0);
  const finishSent = useRef(false);

  useEffect(() => {
    if (done && !finishSent.current) {
      finishSent.current = true;
      onComplete();
    }
  }, [done, onComplete]);

  useEffect(() => {
    const n = matched.size;
    if (n > prevMatchedCount.current && n > 0 && n < pairs.length) {
      fireMiniConfetti();
      setLevelOpen(true);
    }
    prevMatchedCount.current = n;
  }, [matched.size, pairs.length]);

  const tryMatch = useCallback(
    (leftIdx: number, rightIdx: number) => {
      setAttempts((a) => a + 1);
      const correctRight = pairs[leftIdx].right;
      if (shuffledRight[rightIdx] === correctRight) {
        const nextMatched = new Set(matched);
        nextMatched.add(leftIdx);
        setMatched(nextMatched);
        const nextMatchedRight = new Set(matchedRight);
        nextMatchedRight.add(rightIdx);
        setMatchedRight(nextMatchedRight);
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);
        if (nextMatched.size === pairs.length) {
          setDone(true);
        }
      } else {
        setWrongPair({ left: leftIdx, right: rightIdx });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    },
    [matched, matchedRight, pairs, shuffledRight],
  );

  const handleLeftClick = (idx: number) => {
    if (matched.has(idx) || wrongPair) return;
    setSelectedLeft(idx);
    if (selectedRight !== null) {
      tryMatch(idx, selectedRight);
    }
  };

  const handleRightClick = (idx: number) => {
    if (matchedRight.has(idx) || wrongPair) return;
    setSelectedRight(idx);
    if (selectedLeft !== null) {
      tryMatch(selectedLeft, idx);
    }
  };

  const getLeftStyle = (idx: number) => {
    if (matched.has(idx)) return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
    if (wrongPair?.left === idx) return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 animate-pulse";
    if (selectedLeft === idx) return "border-primary bg-primary/10 text-primary";
    return "border-border bg-background hover:border-primary/50 cursor-pointer";
  };

  const getRightStyle = (idx: number) => {
    if (matchedRight.has(idx)) return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
    if (wrongPair?.right === idx) return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 animate-pulse";
    if (selectedRight === idx) return "border-primary bg-primary/10 text-primary";
    return "border-border bg-background hover:border-primary/50 cursor-pointer";
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Trophy className="h-10 w-10 text-yellow-500" />
        <p className="text-sm text-muted-foreground">
          Completaste todas las conexiones en {attempts} {attempts === 1 ? "intento" : "intentos"}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MinigameLevelCelebration
        open={levelOpen}
        onOpenChange={setLevelOpen}
        title="¡Conexión correcta!"
        description="Sigue conectando hasta completar todas las parejas."
        onContinue={() => {}}
      />

      {instruction && (
        <p className="text-sm font-medium text-foreground">{instruction}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Selecciona un elemento de cada columna para conectarlos. {matched.size}/{pairs.length}{" "}
        conectados
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columna A</p>
          {leftItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={matched.has(idx) || !!wrongPair}
              onClick={() => handleLeftClick(idx)}
              className={`w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${getLeftStyle(idx)}`}
            >
              <div className="flex items-center gap-2">
                {matched.has(idx) ? <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> : null}
                {wrongPair?.left === idx ? <XCircle className="h-4 w-4 shrink-0 text-red-500" /> : null}
                <span>{item}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columna B</p>
          {shuffledRight.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={matchedRight.has(idx) || !!wrongPair}
              onClick={() => handleRightClick(idx)}
              className={`w-full rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium transition-all ${getRightStyle(idx)}`}
            >
              <div className="flex items-center gap-2">
                {matchedRight.has(idx) ? <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> : null}
                {wrongPair?.right === idx ? <XCircle className="h-4 w-4 shrink-0 text-red-500" /> : null}
                <span>{item}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {attempts > 0 && (
        <p className="text-center text-xs text-muted-foreground">Intentos: {attempts}</p>
      )}
    </div>
  );
}
