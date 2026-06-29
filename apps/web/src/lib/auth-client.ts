"use client";

import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

function getAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    twoFactorClient({
      // Cuando el login requiere segundo factor, Better Auth invoca esto.
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
          window.location.href = returnUrl
            ? `/two-factor?returnUrl=${encodeURIComponent(returnUrl)}`
            : "/two-factor";
        }
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, twoFactor } = authClient;

// Better Auth expone forgetPassword y resetPassword como métodos del cliente
export const forgetPassword = {
  email: async (params: { email: string; fetchOptions?: any }) => {
    const baseURL = getAuthBaseURL();
    
    // We intercept Turnstile from fetchOptions.body and embed it cleanly for our custom endpoint
    const turnstileToken = params.fetchOptions?.body?.["cf-turnstile-response"] || "";

    const response = await fetch(`${baseURL}/api/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: params.email, turnstileToken }),
    });
    const data = await response.json();
    return { data, error: data.error ? { message: data.error || "Error desconocido" } : null };
  },
};

export const resetPassword = {
  email: async (params: { token: string; password: string }) => {
    const baseURL = getAuthBaseURL();
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return { data, error: data.error ? { message: data.error.message || "Error desconocido" } : null };
  },
};

