"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trophy } from "lucide-react";

interface MemoryPair {
  term: string;
  definition: string;
}

interface Card {
  id: string;
  pairIndex: number;
  content: string;
}

interface MemoryGameProps {
  pairs: MemoryPair[];
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

export function MemoryGame({ pairs, onComplete }: MemoryGameProps) {
  const [cards] = useState<Card[]>(() =>
    shuffle(
      pairs.flatMap((pair, i) => [
        { id: `${i}-term`, pairIndex: i, content: pair.term },
        { id: `${i}-def`, pairIndex: i, content: pair.definition },
      ])
    )
  );

  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Card[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const totalCards = cards.length;

  useEffect(() => {
    if (matched.size === totalCards && totalCards > 0) {
      setWon(true);
    }
  }, [matched.size, totalCards]);

  const handleCardClick = useCallback(
    (card: Card) => {
      if (blocked) return;
      if (flipped.has(card.id)) return;
      if (matched.has(card.id)) return;
      if (selected.length === 1 && selected[0].id === card.id) return;

      const newFlipped = new Set(flipped);
      newFlipped.add(card.id);
      setFlipped(newFlipped);

      if (selected.length === 0) {
        setSelected([card]);
        return;
      }

      // Second card
      const first = selected[0];
      setSelected([]);
      setMoves((m) => m + 1);

      if (first.pairIndex === card.pairIndex) {
        // Match!
        setMatched((prev) => {
          const next = new Set(prev);
          next.add(first.id);
          next.add(card.id);
          return next;
        });
      } else {
        // No match — flip back after delay
        setBlocked(true);
        setTimeout(() => {
          setFlipped((prev) => {
            const next = new Set(prev);
            next.delete(first.id);
            next.delete(card.id);
            return next;
          });
          setBlocked(false);
        }, 900);
      }
    },
    [blocked, flipped, matched, selected]
  );

  const gridCols = cards.length <= 6 ? "grid-cols-3" : "grid-cols-4";

  if (won) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-900/10 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <h3 className="text-2xl font-bold text-foreground">¡Completado!</h3>
          <p className="text-muted-foreground">
            Encontraste todos los pares en{" "}
            <span className="font-semibold text-foreground">{moves}</span>{" "}
            {moves === 1 ? "movimiento" : "movimientos"}.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 text-green-800 dark:text-green-400 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          {pairs.length} pares encontrados
        </div>
        <Button onClick={onComplete} size="lg" className="min-w-[160px]">
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Encuentra los {pairs.length} pares correctos
        </p>
        <p className="text-sm font-medium text-foreground">
          Movimientos: <span className="text-primary">{moves}</span>
        </p>
      </div>

      <div className={`grid ${gridCols} gap-3`}>
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id);
          const isMatched = matched.has(card.id);
          const isSelected = selected[0]?.id === card.id;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isFlipped || isMatched || blocked}
              className={`
                aspect-square rounded-xl border-2 p-2 text-xs font-medium
                transition-all duration-200 cursor-pointer
                flex items-center justify-center text-center
                ${
                  isMatched
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : isFlipped && isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : isFlipped
                    ? "border-border bg-card text-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/50 hover:bg-muted/80"
                }
              `}
            >
              {isFlipped || isMatched ? (
                <span className="leading-tight break-words">{card.content}</span>
              ) : (
                <span className="text-2xl font-bold opacity-30">?</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {matched.size / 2} / {pairs.length} pares encontrados
      </p>
    </div>
  );
}
