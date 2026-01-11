import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Token de verificación no encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El enlace de verificación no es válido o está incompleto.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Ir al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    // Verificar el token usando Better Auth
    // Better Auth maneja la verificación a través de su API
    const result = await auth.api.verifyEmail({
      query: {
        token,
      },
      headers: await headers(),
    });

    if (!result || (result as any).error) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error al verificar el correo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {(result as any)?.error?.message || "El token de verificación no es válido o ha expirado."}
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Ir al inicio de sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si la verificación fue exitosa, redirigir al login
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">
              ¡Correo verificado exitosamente!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu correo electrónico ha sido verificado correctamente. Ahora puedes iniciar sesión.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error al verificar email:", error);
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error al verificar el correo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ocurrió un error al verificar tu correo electrónico. Por favor, intenta de nuevo.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Ir al inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

