"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Users, HelpCircle, Play, Pencil, Trash2 } from "lucide-react";

type GameStatus = "waiting" | "active" | "finished";

interface Game {
  id: string;
  code: string;
  title: string;
  status: GameStatus;
  createdAt: string;
  _count: { participants: number; questions: number };
}

const statusLabels: Record<GameStatus, string> = {
  waiting: "Esperando",
  active: "En juego",
  finished: "Terminado",
};

const statusVariants: Record<GameStatus, "default" | "outline"> = {
  waiting: "outline",
  active: "default",
  finished: "outline",
};

export default function InstructorGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((d) => setGames(d.games ?? []))
      .finally(() => setLoading(false));
  }, []);

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteGame(id: string) {
    if (!confirm("¿Eliminar este juego? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGames((prev) => prev.filter((g) => g.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mis juegos"
        description="Crea y controla juegos de preguntas en tiempo real"
        action={{ label: "Crear juego", href: "/instructor/games/new" }}
      />

      {games.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <p className="text-muted-foreground text-center">
              No tienes juegos aún. ¡Crea tu primer juego!
            </p>
            <Button asChild>
              <Link href="/instructor/games/new">Crear juego</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{game.title}</CardTitle>
                  <Badge variant={statusVariants[game.status]}>
                    {statusLabels[game.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xl font-bold tracking-widest text-primary">
                    {game.code}
                  </span>
                  <button
                    onClick={() => copyCode(game.code, game.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copiar código"
                  >
                    {copiedId === game.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {game._count.participants} jugadores
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    {game._count.questions} preguntas
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/instructor/games/${game.id}/host`}>
                      <Play className="h-4 w-4 mr-1" />
                      Controlar
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    {game.status === "waiting" && (
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/instructor/games/${game.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteGame(game.id)}
                      disabled={deletingId === game.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
