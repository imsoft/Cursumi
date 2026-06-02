"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, ArrowRight, CheckCircle } from "lucide-react";

interface Question {
  id: string;
  order: number;
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
  userId: string;
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
}

const OPTION_COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-blue-500 hover:bg-blue-600",
  "bg-yellow-500 hover:bg-yellow-600",
  "bg-green-500 hover:bg-green-600",
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

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${id}`);
      if (!res.ok) return;
      const d: ApiResponse = await res.json();
      setData(d);
    } finally {
      if (loading) setLoading(false);
    }
  }, [id, loading]);

  useEffect(() => {
    fetchGame();
    const iv = setInterval(fetchGame, 2000);
    return () => clearInterval(iv);
  }, [fetchGame]);

  useEffect(() => {
    setShowAnswers(false);
  }, [data?.game.currentQuestion]);

  async function startGame() {
    setActionPending(true);
    await fetch(`/api/games/${id}/start`, { method: "POST" });
    await fetchGame();
    setActionPending(false);
  }

  async function nextQuestion() {
    setActionPending(true);
    await fetch(`/api/games/${id}/next`, { method: "POST" });
    setShowAnswers(false);
    await fetchGame();
    setActionPending(false);
  }

  async function finishGame() {
    setActionPending(true);
    await fetch(`/api/games/${id}/finish`, { method: "POST" });
    await fetchGame();
    setActionPending(false);
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const { game, currentQ, participants } = data;

  if (game.status === "waiting") {
    return <WaitingView
      game={game}
      participants={participants}
      onStart={startGame}
      pending={actionPending}
    />;
  }

  if (game.status === "finished") {
    return <FinishedView participants={participants} />;
  }

  return (
    <ActiveView
      game={game}
      currentQ={currentQ}
      participants={participants}
      showAnswers={showAnswers}
      onShowAnswers={() => setShowAnswers(true)}
      onNext={nextQuestion}
      onFinish={finishGame}
      pending={actionPending}
    />
  );
}

function WaitingView({
  game,
  participants,
  onStart,
  pending,
}: {
  game: GameData;
  participants: Participant[];
  onStart: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">{game.title}</CardTitle>
          <p className="text-muted-foreground">Comparte este código con tus jugadores</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="bg-primary/10 rounded-2xl px-12 py-6">
            <span className="font-mono text-6xl font-black tracking-widest text-primary">
              {game.code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-lg font-medium">{participants.length} jugadores esperando</span>
          </div>
          <Button
            size="lg"
            onClick={onStart}
            disabled={pending || participants.length === 0}
            className="w-full max-w-xs"
          >
            {pending ? "Iniciando..." : "Iniciar juego"}
          </Button>
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">Esperando al menos 1 jugador</p>
          )}
        </CardContent>
      </Card>

      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jugadores unidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <Badge key={p.id} variant="outline">
                  {p.nickname}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ActiveView({
  game,
  currentQ,
  participants,
  showAnswers,
  onShowAnswers,
  onNext,
  onFinish,
  pending,
}: {
  game: GameData;
  currentQ: Question | null;
  participants: Participant[];
  showAnswers: boolean;
  onShowAnswers: () => void;
  onNext: () => void;
  onFinish: () => void;
  pending: boolean;
}) {
  const remaining = useCountdown(
    game.questionStartedAt,
    currentQ?.timeLimitSec ?? 20
  );
  const timerExpired = remaining <= 0;
  const isLastQuestion = currentQ ? game.currentQuestion >= game.questions.length - 1 : false;

  if (!currentQ) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{game.title}</h1>
          <p className="text-sm text-muted-foreground">
            Pregunta {game.currentQuestion + 1} de {game.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-black tabular-nums ${remaining <= 5 ? "text-red-500" : "text-primary"}`}>
            {Math.ceil(remaining)}s
          </div>
          <Badge variant="outline">{participants.length} jugadores</Badge>

        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xl font-semibold text-center mb-6">{currentQ.question}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => (
              <div
                key={i}
                className={`${OPTION_COLORS[i]} rounded-xl p-4 text-white font-semibold flex items-center gap-3 transition-colors`}
              >
                <span className="text-lg font-black">{OPTION_LABELS[i]}</span>
                <span className="flex-1">{opt}</span>
                {showAnswers && i === currentQ.correct && (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        {!showAnswers && (timerExpired || true) && (
          <Button variant="outline" onClick={onShowAnswers}>
            Ver respuestas
          </Button>
        )}
        {isLastQuestion ? (
          <Button onClick={onFinish} disabled={pending}>
            {pending ? "Terminando..." : "Finalizar juego"}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={pending}>
            <ArrowRight className="h-4 w-4 mr-1" />
            {pending ? "Avanzando..." : "Siguiente pregunta"}
          </Button>
        )}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Clasificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {participants.slice(0, 10).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-6 text-sm font-bold text-muted-foreground">{i + 1}</span>
                <span className="flex-1 font-medium">{p.nickname}</span>
                <span className="font-bold tabular-nums">{p.score} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinishedView({ participants }: { participants: Participant[] }) {
  const top3 = participants.slice(0, 3);
  const rest = participants.slice(3);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">¡Juego terminado!</h1>
        <p className="text-muted-foreground">Resultados finales</p>
      </div>

      <div className="flex items-end justify-center gap-4 py-6">
        {top3[1] && (
          <div className="flex flex-col items-center gap-2">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-black">
              2
            </div>
            <p className="font-semibold text-sm text-center max-w-[80px] truncate">{top3[1].nickname}</p>
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
            <p className="font-semibold text-sm text-center max-w-[70px] truncate">{top3[2].nickname}</p>
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
        <Link href="/instructor/games">Volver a mis juegos</Link>
      </Button>
    </div>
  );
}
