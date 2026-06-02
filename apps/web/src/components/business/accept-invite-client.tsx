"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, AlertCircle } from "lucide-react";

interface Props {
  token: string;
  orgName: string;
  orgLogo: string | null;
  inviteEmail: string;
  userEmail: string;
}

export function AcceptInviteClient({
  token,
  orgName,
  orgLogo,
  inviteEmail,
  userEmail,
}: Props) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailMismatch = inviteEmail.toLowerCase() !== userEmail.toLowerCase();

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/business/invitations/${token}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al aceptar la invitación");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Error de conexión");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24">
      <Card className="w-full text-center">
        <CardHeader className="flex flex-col items-center gap-3">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <CardTitle className="text-xl">
            Únete a {orgName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Has sido invitado a formar parte del equipo de capacitación de{" "}
            <strong>{orgName}</strong> en Cursumi Business.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {emailMismatch && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-50 p-3 text-left text-sm dark:bg-yellow-950/20">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-400">
                  Email diferente
                </p>
                <p className="text-yellow-700 dark:text-yellow-500">
                  La invitación fue enviada a <strong>{inviteEmail}</strong>, pero tu
                  sesión es con <strong>{userEmail}</strong>. Inicia sesión con el
                  correo correcto.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleAccept}
            disabled={accepting || emailMismatch}
            className="w-full"
            size="lg"
          >
            {accepting ? "Aceptando..." : "Aceptar invitación"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
