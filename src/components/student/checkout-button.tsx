"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";

interface CheckoutButtonProps {
  courseId: string;
  price: number;
  label?: string;
}

export function CheckoutButton({ courseId, price, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar el pago");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={handleCheckout} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        {loading ? "Redirigiendo..." : (label || `Comprar — ${new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price / 100)}`)}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
