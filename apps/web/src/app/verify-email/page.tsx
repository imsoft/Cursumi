import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verificación de correo",
  robots: { index: false, follow: false },
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

type Resultado = {
  ok: boolean;
  titulo: string;
  mensaje: string;
  boton: string;
};

/**
 * Verifica el token y devuelve qué mostrar. El try/catch abarca solo la
 * llamada a Better Auth: si envolviera también el JSX no serviría de nada,
 * porque React construye el elemento aquí pero lo renderiza después, así que
 * un fallo de renderizado escaparía del catch.
 */
async function verificar(token: string): Promise<Resultado> {
  try {
    const result = await auth.api.verifyEmail({
      query: { token },
      headers: await headers(),
    });

    const conError =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof (result as { error?: unknown }).error === "object";

    if (!result || conError) {
      const detalle = (result as { error?: { message?: string } } | null)?.error?.message;
      return {
        ok: false,
        titulo: "Error al verificar el correo",
        mensaje:
          typeof detalle === "string" && detalle
            ? detalle
            : "El enlace de verificación no es válido o ya expiró.",
        boton: "Ir al inicio de sesión",
      };
    }

    return {
      ok: true,
      titulo: "¡Correo verificado!",
      mensaje: "Tu correo quedó verificado correctamente. Ya puedes iniciar sesión.",
      boton: "Iniciar sesión",
    };
  } catch (error) {
    console.error("[verify-email] No se pudo verificar el token:", error);
    return {
      ok: false,
      titulo: "Error al verificar el correo",
      mensaje: "Ocurrió un error al verificar tu correo. Vuelve a intentarlo.",
      boton: "Ir al inicio de sesión",
    };
  }
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  const resultado: Resultado = token
    ? await verificar(token)
    : {
        ok: false,
        titulo: "Falta el token de verificación",
        mensaje: "El enlace de verificación no es válido o está incompleto.",
        boton: "Ir al inicio de sesión",
      };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={resultado.ok ? "text-green-600" : "text-destructive"}>
            {resultado.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{resultado.mensaje}</p>
          <Button asChild className="w-full">
            <Link href="/login">{resultado.boton}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
