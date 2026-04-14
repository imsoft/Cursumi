import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { RegisterForm } from "@/components/auth/register-form";
import { safeRedirectTarget } from "@/lib/safe-redirect";

function isGoogleAuthConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta en Cursumi.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ returnUrl?: string; ref?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const session = await getSessionSafe();
  const { returnUrl, ref } = await searchParams;
  if (session) {
    const target = safeRedirectTarget(returnUrl, "/dashboard");
    redirect(target);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <RegisterForm
          returnUrl={returnUrl}
          googleAuthEnabled={isGoogleAuthConfigured()}
          referralCode={ref}
        />
      </main>
    </div>
  );
}

