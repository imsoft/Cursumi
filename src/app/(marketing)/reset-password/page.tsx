import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false, follow: false },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <ResetPasswordForm token={token} />
      </main>
    </div>
  );
}

