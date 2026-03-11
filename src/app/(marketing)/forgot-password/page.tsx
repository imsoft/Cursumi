import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}

