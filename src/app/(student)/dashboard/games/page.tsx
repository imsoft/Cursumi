"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2 } from "lucide-react";

export default function StudentGamesPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !nickname.trim()) {
      setError("Ingresa el código y tu nickname");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase().trim(), nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al unirse al juego");
        return;
      }
      router.push(`/dashboard/games/${data.gameId}/play`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Juegos"
        description="Únete a un quiz en tiempo real con tu código de juego"
      />

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Unirse a un juego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Código del juego</label>
                <Input
                  placeholder="XXXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono text-xl tracking-widest text-center uppercase"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Tu nickname</label>
                <Input
                  placeholder="Ej. Jugador123"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={30}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} size="lg">
                {loading ? "Entrando..." : "Entrar al juego"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Gamepad2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Tus partidas recientes aparecerán aquí
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
