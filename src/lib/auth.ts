import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationLink = `${baseURL}/verify-email?token=${token}`;
      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.name || "Usuario",
          verificationLink,
        });
      } catch (err) {
        // No lanzar error para que el registro no falle si el email no se envía
        console.error("Error enviando email de verificación:", err);
      }
    },
    sendPasswordResetEmail: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseURL}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name || "Usuario",
          resetLink,
        });
      } catch (err) {
        console.error("Error enviando email de reset:", err);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días por defecto
    updateAge: 60 * 60 * 24, // Actualizar cada 24 horas
  },
  plugins: [
    nextCookies(), // Debe ser el último plugin
  ],
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: getTrustedOrigins(),
});

function getTrustedOrigins(): string[] {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return ["http://localhost:3000"];
  const base = url.replace(/\/$/, "");
  const origins = [base];
  if (base.startsWith("https://www.")) {
    origins.push(base.replace("https://www.", "https://"));
  } else if (base.startsWith("https://")) {
    origins.push(base.replace("https://", "https://www."));
  }
  return origins;
}

export type Session = typeof auth.$Infer.Session;
