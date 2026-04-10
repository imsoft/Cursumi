"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  courseId: string;
  isLoggedIn: boolean;
  /** Tamaño del botón */
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({ courseId, isLoggedIn, size = "md", className = "" }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((ids: string[]) => setSaved(ids.includes(courseId)))
      .catch(() => {});
  }, [courseId, isLoggedIn]);

  const toggle = useCallback(async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, isLoggedIn, router]);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Quitar de wishlist" : "Guardar en wishlist"}
      title={saved ? "Quitar de guardados" : "Guardar para después"}
      className={`rounded-full border border-border bg-background/90 transition-colors hover:bg-muted disabled:opacity-50 ${btnSize} ${className}`}
    >
      <Heart
        className={`${iconSize} transition-colors ${saved ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
      />
    </button>
  );
}
