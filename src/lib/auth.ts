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
    requireEmailVerification: true, // Habilitar verificación de email
    sendVerificationEmail: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      // Construir la URL completa de verificación
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationLink = `${baseURL}/verify-email?token=${token}`;
      
      await sendVerificationEmail({
        to: user.email,
        name: user.name || "Usuario",
        verificationLink,
      });
    },
    sendPasswordResetEmail: async ({ user, token }: { user: { email: string; name?: string | null }; url: string; token: string }) => {
      // Construir la URL completa de reset de contraseña
      const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseURL}/reset-password?token=${token}`;
      
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name || "Usuario",
        resetLink,
      });
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
});

export type Session = typeof auth.$Infer.Session;
