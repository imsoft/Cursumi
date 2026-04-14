"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function requestAndSubscribePush() {
  if (!VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const sub = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
        },
      }),
    });
  } catch {
    // silencioso
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushDismissed, setPushDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently ignore — bell is non-critical
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // Cerrar con Escape + click fuera
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Mover foco al primer ítem cuando se abre el dropdown
  useEffect(() => {
    if (open) {
      setTimeout(() => firstItemRef.current?.focus(), 50);
    }
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const showPushPrompt =
    !pushDismissed &&
    VAPID_PUBLIC_KEY &&
    typeof Notification !== "undefined" &&
    Notification.permission === "default";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificaciones"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
            aria-label={`${unreadCount} notificaciones sin leer`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Panel de notificaciones"
          className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground" id="notifications-heading">
              Notificaciones
            </p>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-muted-foreground"
                onClick={markAllRead}
                aria-label="Marcar todas las notificaciones como leídas"
              >
                <CheckCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                Marcar todas
              </Button>
            )}
          </div>

          {/* Banner para solicitar push */}
          {showPushPrompt && (
            <div className="border-b border-border bg-primary/5 px-4 py-3">
              <p className="text-xs font-medium text-foreground mb-1">Activar notificaciones push</p>
              <p className="text-xs text-muted-foreground mb-2">
                Recibe alertas aunque no tengas Cursumi abierto.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => requestAndSubscribePush().then(() => setPushDismissed(true))}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Activar
                </button>
                <button
                  onClick={() => setPushDismissed(true)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  No, gracias
                </button>
              </div>
            </div>
          )}

          <div
            className="max-h-80 overflow-y-auto"
            role="list"
            aria-labelledby="notifications-heading"
          >
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Sin notificaciones
              </p>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  role="menuitem"
                  tabIndex={0}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={i === 0 ? (firstItemRef as any) : undefined}
                  onClick={() => {
                    if (!n.read) markRead(n.id);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }
                  }}
                  className={`flex cursor-pointer gap-3 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                  aria-label={`${n.read ? "" : "Sin leer: "}${n.title}. ${n.body}`}
                >
                  {!n.read && (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                  <div className={!n.read ? "" : "pl-5"}>
                    {n.link ? (
                      <Link href={n.link} className="block" tabIndex={-1}>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      </>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      <time dateTime={n.createdAt}>
                        {new Date(n.createdAt).toLocaleDateString("es-MX")}
                      </time>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
