import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionSafe } from "@/lib/session";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { safeRedirectTarget } from "@/lib/safe-redirect";

function isGoogleAuthConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

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
    const target = safeRedirectTarget(returnUrl, "/dashboard");
    redirect(target);
  }

  return (
    <AuthPageShell>
      <LoginForm returnUrl={returnUrl} googleAuthEnabled={isGoogleAuthConfigured()} />
    </AuthPageShell>
  );
}

