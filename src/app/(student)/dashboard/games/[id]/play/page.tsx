"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  timeLimitSec: number;
  points: number;
}

interface Participant {
  id: string;
  nickname: string;
  score: number;
}

interface Answer {
  selectedOption: number;
  isCorrect: boolean;
  pointsEarned: number;
}

interface GameData {
  id: string;
  code: string;
  title: string;
  status: "waiting" | "active" | "finished";
  currentQuestion: number;
  questionStartedAt: string | null;
  questions: Question[];
}

interface ApiResponse {
  game: GameData;
  currentQ: Question | null;
  participants: Participant[];
  myAnswer: Answer | null;
  myParticipantId: string | null;
  myNickname: string | null;
}

const OPTION_COLORS = [
  "bg-red-500 text-white",
  "bg-blue-500 text-white",
  "bg-yellow-500 text-white",
  "bg-green-500 text-white",
];

const OPTION_SELECTED = [
  "bg-red-700 text-white ring-4 ring-red-300",
  "bg-blue-700 text-white ring-4 ring-blue-300",
  "bg-yellow-700 text-white ring-4 ring-yellow-300",
  "bg-green-700 text-white ring-4 ring-green-300",
];

const OPTION_LABELS = ["A", "B", "C", "D"];

function useCountdown(startedAt: string | null, limitSec: number) {
  const [remaining, setRemaining] = useState(limitSec);

  useEffect(() => {
    if (!startedAt) return;
    const update = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setRemaining(Math.max(0, limitSec - elapsed));
    };
    update();
    const iv = setInterval(update, 200);
    return () => clearInterval(iv);
  }, [startedAt, limitSec]);

  return remaining;
}

export default function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${id}`);
      if (!res.ok) return;
      const d: ApiResponse = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGame();
    const iv = setInterval(fetchGame, 2000);
    return () => clearInterval(iv);
  }, [fetchGame]);

  async function submitAnswer(selectedOption: number, questionId: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/games/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedOption }),
      });
      await fetchGame();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const { game, currentQ, participants, myAnswer, myParticipantId, myNickname } = data;

  if (game.status === "waiting") {
    return (
      <WaitingView
        game={game}
        participants={participants}
        myNickname={myNickname}
      />
    );
  }

  if (game.status === "finished") {
    const myRank = myParticipantId
      ? participants.findIndex((p) => p.id === myParticipantId) + 1
      : 0;
    const me = participants.find((p) => p.id === myParticipantId);
    return <FinishedView participants={participants} myRank={myRank} myScore={me?.score ?? 0} />;
  }

  return (
    <ActiveView
      game={game}
      currentQ={currentQ}
      myAnswer={myAnswer}
      onAnswer={submitAnswer}
      submitting={submitting}
    />
  );
}

function WaitingView({
  game,
  participants,
  myNickname,
}: {
  game: GameData;
  participants: Participant[];
  myNickname: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-3 rounded-full bg-primary/40 animate-ping delay-150" />
          <div className="absolute inset-6 rounded-full bg-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold">{game.title}</h1>
        {myNickname && (
          <Badge variant="outline">
            Juegas como: {myNickname}
          </Badge>
        )}
        <p className="text-muted-foreground text-lg">
          Esperando que el host inicie el juego...
        </p>
        <p className="text-sm text-muted-foreground">
          {participants.length} jugador{participants.length !== 1 ? "es" : ""} en sala
        </p>
      </div>
    </div>
  );
}

function ActiveView({
  game,
  currentQ,
  myAnswer,
  onAnswer,
  submitting,
}: {
  game: GameData;
  currentQ: Question | null;
  myAnswer: Answer | null;
  onAnswer: (option: number, questionId: string) => void;
  submitting: boolean;
}) {
  const remaining = useCountdown(game.questionStartedAt, currentQ?.timeLimitSec ?? 20);

  if (!currentQ) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Cargando pregunta...</p>
      </div>
    );
  }

  const answered = myAnswer !== null;

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pregunta {game.currentQuestion + 1} de {game.questions.length}
        </p>
        <div
          className={`text-2xl font-black tabular-nums ${
            remaining <= 5 ? "text-red-500" : "text-primary"
          }`}
        >
          {Math.ceil(remaining)}s
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xl font-semibold text-center">{currentQ.question}</p>
        </CardContent>
      </Card>

      {answered ? (
        <div className="flex flex-col gap-4">
          <Card
            className={
              myAnswer.isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-red-500 bg-red-50 dark:bg-red-950/20"
            }
          >
            <CardContent className="pt-6 flex flex-col items-center gap-3 text-center">
              {myAnswer.isCorrect ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">¡Correcto!</p>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">
                    +{myAnswer.pointsEarned} pts
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-500" />
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">Incorrecto</p>
                  <p className="text-sm text-muted-foreground">
                    Respuesta correcta: {OPTION_LABELS[currentQ.correct]}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 font-semibold flex items-center gap-3 transition-colors
                  ${i === myAnswer.selectedOption ? OPTION_SELECTED[i] : OPTION_COLORS[i]}
                  ${i !== currentQ.correct ? "opacity-60" : ""}
                `}
              >
                <span className="font-black">{OPTION_LABELS[i]}</span>
                <span className="flex-1 text-sm">{opt}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Esperando la siguiente pregunta...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !submitting && onAnswer(i, currentQ.id)}
              disabled={submitting}
              className={`${OPTION_COLORS[i]} rounded-xl p-4 font-semibold flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 cursor-pointer`}
            >
              <span className="text-lg font-black">{OPTION_LABELS[i]}</span>
              <span className="flex-1 text-left text-sm">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FinishedView({
  participants,
  myRank,
  myScore,
}: {
  participants: Participant[];
  myRank: number;
  myScore: number;
}) {
  const top3 = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">¡Juego terminado!</h1>
        {myRank > 0 && (
          <p className="text-lg text-muted-foreground">
            Tu posición:{" "}
            <span className="font-bold text-foreground">#{myRank}</span> con{" "}
            <span className="font-bold text-primary">{myScore} pts</span>
          </p>
        )}
      </div>

      <div className="flex items-end justify-center gap-4 py-6">
        {top3[1] && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-black">
              2
            </div>
            <p className="font-semibold text-sm text-center max-w-[80px] truncate">
              {top3[1].nickname}
            </p>
            <p className="text-sm text-muted-foreground">{top3[1].score} pts</p>
          </div>
        )}
        {top3[0] && (
          <div className="flex flex-col items-center gap-2 -mt-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="bg-yellow-400 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-black">
              1
            </div>
            <p className="font-bold text-center max-w-[100px] truncate">{top3[0].nickname}</p>
            <p className="text-sm font-bold">{top3[0].score} pts</p>
          </div>
        )}
        {top3[2] && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-amber-700/30 rounded-full w-14 h-14 flex items-center justify-center text-xl font-black">
              3
            </div>
            <p className="font-semibold text-sm text-center max-w-[70px] truncate">
              {top3[2].nickname}
            </p>
            <p className="text-sm text-muted-foreground">{top3[2].score} pts</p>
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2">
              {rest.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-muted-foreground">{i + 4}</span>
                  <span className="flex-1">{p.nickname}</span>
                  <span className="tabular-nums">{p.score} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button asChild variant="outline">
        <Link href="/dashboard/games">Volver a juegos</Link>
      </Button>
    </div>
  );
}
