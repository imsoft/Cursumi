import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  // Verificar si el usuario tiene sesión activa
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Si el usuario está autenticado, redirigir al dashboard
    if (session) {
      redirect("/dashboard");
    }
  } catch (error) {
    // Si hay un error al verificar la sesión, continuar mostrando la página
    console.error("Error al verificar sesión:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <LoginForm />
      </main>
    </div>
  );
}

