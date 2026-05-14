"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShoppingCart, Tag, X, Check } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";

interface CheckoutButtonProps {
  courseId: string;
  price: number;
  label?: string;
  sessionId?: string;
  disabled?: boolean;
}

export function CheckoutButton({ courseId, price, label, sessionId, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPct: number;
    description: string | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const discountedPrice = appliedCoupon
    ? Math.round(price * (1 - appliedCoupon.discountPct / 100))
    : price;

  const validateCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setValidating(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Cupón inválido");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponInput("");
      }
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          ...(sessionId ? { sessionId } : {}),
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar el pago");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Coupon input */}
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            className="flex-1"
            value={couponInput}
            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); validateCoupon(); } }}
            placeholder="Código de descuento (opcional)"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={validateCoupon}
            disabled={!couponInput.trim() || validating}
          >
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-900/20 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-mono font-semibold text-green-700 dark:text-green-300">
              {appliedCoupon.code}
            </span>
            <span className="text-green-600 dark:text-green-400">
              -{appliedCoupon.discountPct}% aplicado
            </span>
          </div>
          <button type="button" onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {couponError && <p className="text-xs text-destructive">{couponError}</p>}

      {/* Price with discount */}
      {appliedCoupon && (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{formatPriceMXN(discountedPrice)}</span>
          <span className="text-sm line-through text-muted-foreground">{formatPriceMXN(price)}</span>
        </div>
      )}

      <Button size="lg" onClick={handleCheckout} disabled={disabled || loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        {loading
          ? "Redirigiendo..."
          : label || `Comprar — ${formatPriceMXN(discountedPrice)}`}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
