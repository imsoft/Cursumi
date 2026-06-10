import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { authClient } from "./auth";
import { API_URL } from "./api";

/**
 * Push notifications de la app móvil (Expo).
 *
 * Flujo: pedir permiso → obtener ExponentPushToken → registrarlo en el backend
 * (`POST /api/me/push-token`). El servidor lo usa en `sendExpoPushToUser` cada
 * vez que se crea una notificación (mismo pipeline que el web push).
 *
 * Requisitos: el token solo se obtiene en dispositivo físico y necesita
 * `extra.eas.projectId` en app.json (lo agrega `eas init`). En Expo Go con
 * SDK 53+ el push remoto no funciona; hay que usar un development build.
 */

// Cómo mostrar la notificación si llega con la app en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function authHeaders(): Record<string, string> {
  const cookie = authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
}

function getProjectId(): string | undefined {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId
  );
}

/** Pide permiso y devuelve el ExponentPushToken, o null si no se puede obtener. */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null; // los simuladores no reciben push remoto

  if (Platform.OS === "android") {
    // Android 13+ exige el canal creado antes de pedir el token.
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificaciones",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#4f00f6",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    status = req.status;
  }
  if (status !== "granted") return null;

  const projectId = getProjectId();
  if (!projectId) {
    // Sin projectId (falta `eas init`) no se puede emitir el token.
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch {
    return null;
  }
}

/** Registra el token del dispositivo en el backend. Silencioso ante errores. */
export async function syncPushToken(): Promise<void> {
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    await fetch(`${API_URL}/api/me/push-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ token }),
    });
  } catch {
    // nunca rompe el arranque de la app
  }
}

/** Desregistra el token al cerrar sesión. */
export async function removePushToken(): Promise<void> {
  try {
    const projectId = getProjectId();
    if (!projectId || !Device.isDevice) return;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await fetch(`${API_URL}/api/me/push-token`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ token }),
    });
  } catch {
    // silencioso
  }
}
