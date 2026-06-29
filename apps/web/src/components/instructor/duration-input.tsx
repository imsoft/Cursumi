"use client";

import { useId } from "react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DURATION_UNIT_OPTIONS,
  formatDuration,
  parseDuration,
  type DurationUnit,
} from "@/lib/duration";

interface DurationInputProps {
  label?: string;
  /** Valor canónico almacenado, p. ej. "8 horas". */
  value: string;
  /** Recibe el nuevo valor canónico ("8 horas") o "" si se vacía. */
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}

/**
 * Captura la duración como número + unidad y la emite como un único string
 * canónico ("8 horas"). Ver `@/lib/duration`.
 */
export const DurationInput = ({ label, value, onChange, error, hint }: DurationInputProps) => {
  const id = useId();
  const { value: amount, unit } = parseDuration(value);

  const emit = (next: { amount?: string; unit?: DurationUnit }) => {
    const nextAmount = next.amount ?? amount;
    const nextUnit = next.unit ?? unit;
    onChange(nextAmount ? formatDuration(nextAmount, nextUnit) : "");
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          min={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) => emit({ amount: e.target.value })}
          aria-invalid={error ? true : undefined}
          className={cn(
            "border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          )}
        />
        <Select
          options={DURATION_UNIT_OPTIONS}
          value={unit}
          onChange={(e) => emit({ unit: e.target.value as DurationUnit })}
          className="w-36 shrink-0"
          aria-label="Unidad de duración"
        />
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
