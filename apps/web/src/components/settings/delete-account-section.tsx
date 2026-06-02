"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteAccountSectionProps {
  userName: string;
}

export function DeleteAccountSection({ userName }: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = userName.split(" ")[0] || userName;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/me", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo eliminar la cuenta");
      }
      await authClient.signOut();
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la cuenta");
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Eliminar cuenta
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Esta acción es permanente e irreversible. Se eliminarán tu perfil, cursos, progreso y todos tus datos.
        </p>
      </CardHeader>
      <CardContent>
        {!open ? (
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Eliminar mi cuenta
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-foreground">
                Para confirmar, escribe <strong>{firstName}</strong> en el campo de abajo.
              </p>
            </div>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              label={`Escribe "${firstName}" para confirmar`}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setOpen(false); setConfirm(""); setError(null); }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={confirm !== firstName || loading}
                onClick={handleDelete}
              >
                {loading ? "Eliminando..." : "Sí, eliminar mi cuenta"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
