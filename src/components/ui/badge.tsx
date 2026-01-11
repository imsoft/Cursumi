"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
}

export const Badge = ({ children, variant = "default" }: BadgeProps) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]";
  const styles =
    variant === "outline"
      ? "border border-border bg-background text-muted-foreground"
      : "bg-primary/10 text-primary";
  return <span className={`${base} ${styles}`}>{children}</span>;
};

