import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

import { API_URL } from "./api";

/**
 * Cliente de autenticación de la app móvil.
 * Usa @better-auth/expo: guarda la sesión (token) en SecureStore y la adjunta
 * automáticamente a las peticiones a la API de Cursumi.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: "mobile", // debe coincidir con app.json
      storagePrefix: "cursumi",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
