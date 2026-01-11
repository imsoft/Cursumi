"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Better Auth expone forgetPassword y resetPassword como métodos del cliente
export const forgetPassword = {
  email: async (params: { email: string }) => {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseURL}/api/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return { data, error: data.error ? { message: data.error.message || "Error desconocido" } : null };
  },
};

export const resetPassword = {
  email: async (params: { token: string; password: string }) => {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return { data, error: data.error ? { message: data.error.message || "Error desconocido" } : null };
  },
};

