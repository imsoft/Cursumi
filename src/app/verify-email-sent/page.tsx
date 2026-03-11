import type { Metadata } from "next";
import { VerifyEmailSentClient } from "@/components/auth/verify-email-sent-client";

export const metadata: Metadata = {
  title: "Verifica tu correo",
  robots: { index: false, follow: false },
};

interface VerifyEmailSentPageProps {
  searchParams: Promise<{ email?: string; returnUrl?: string }>;
}

export default async function VerifyEmailSentPage({ searchParams }: VerifyEmailSentPageProps) {
  const params = await searchParams;
  const email = params.email ?? null;
  const returnUrl = params.returnUrl && params.returnUrl.startsWith("/") ? params.returnUrl : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <VerifyEmailSentClient email={email} returnUrl={returnUrl} />
    </div>
  );
}

