import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifica tu correo electrónico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Te hemos enviado un correo electrónico con un enlace de verificación.
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para
            verificar tu cuenta.
          </p>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <strong>No recibiste el correo?</strong>
              <br />
              Revisa tu carpeta de spam o correo no deseado. El correo puede tardar
              unos minutos en llegar.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Ir al inicio de sesión</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

