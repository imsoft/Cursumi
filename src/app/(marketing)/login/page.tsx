import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Cursumi.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ returnUrl?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSessionSafe();
  const { returnUrl } = await searchParams;
  if (session) {
    const target = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/dashboard";
    redirect(target);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <LoginForm returnUrl={returnUrl} />
      </main>
    </div>
  );
}

