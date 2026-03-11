import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en Cursumi.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ returnUrl?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const session = await getSessionSafe();
  const { returnUrl } = await searchParams;
  if (session) {
    const target = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/dashboard";
    redirect(target);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <RegisterForm returnUrl={returnUrl} />
      </main>
    </div>
  );
}

