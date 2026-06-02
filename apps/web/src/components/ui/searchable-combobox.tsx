"use client";

import { useMemo, useRef, useState, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchableCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Buscar…",
  emptyText = "Sin resultados",
  disabled,
  error,
  className,
  hintWhenEmpty,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  hintWhenEmpty?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const showPanel = open && !disabled;
  const noOptions = options.length === 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <label htmlFor={uid} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <button
        type="button"
        id={uid}
        disabled={disabled}
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {showPanel && (
        <div className="absolute z-50 mt-1 w-full min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="mb-1 flex h-9 w-full rounded-sm border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <ul className="max-h-60 overflow-auto rounded-sm p-0.5">
            {noOptions ? (
              <li className="px-2 py-2 text-sm text-muted-foreground">{hintWhenEmpty ?? emptyText}</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted-foreground">{emptyText}</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                      value === opt && "bg-accent/50",
                    )}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {value === opt ? <Check className="h-4 w-4" /> : null}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
