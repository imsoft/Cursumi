import { Monitor, MapPin, Video, Calendar } from "lucide-react";
import {
  MODALITY_CONFIG,
  normalizeModality,
  SESSION_FORMAT_CONFIG,
  normalizeSessionFormat,
  type Modality,
  type SessionFormat,
} from "@/lib/modality";
import { cn } from "@/lib/utils";

function ModalityIcon({ modalityKey: k, className }: { modalityKey: Modality; className?: string }) {
  if (k === "virtual") return <Monitor className={className} />;
  return <Calendar className={className} />;
}

interface ModalityBadgeProps {
  modality: Modality | string;
  size?: "sm" | "md";
  className?: string;
}

export function ModalityBadge({ modality, size = "sm", className }: ModalityBadgeProps) {
  const key = normalizeModality(modality);
  const config = MODALITY_CONFIG[key];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color.bg,
        config.color.text,
        config.color.border,
        "border",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        className,
      )}
    >
      <ModalityIcon modalityKey={key} className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.shortLabel}
    </span>
  );
}

export function ModalityOverlayBadge({ modality }: { modality: Modality | string }) {
  const key = normalizeModality(modality);
  const config = MODALITY_CONFIG[key];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm",
        config.color.badgeBg,
      )}
    >
      <ModalityIcon modalityKey={key} className="h-3 w-3" />
      {config.shortLabel}
    </span>
  );
}

/** Badge del formato de una sesión concreta: presencial o videollamada. */
export function SessionFormatBadge({
  format,
  size = "sm",
  className,
}: {
  format: SessionFormat | string;
  size?: "sm" | "md";
  className?: string;
}) {
  const key = normalizeSessionFormat(format);
  const config = SESSION_FORMAT_CONFIG[key];
  const Icon = key === "online" ? Video : MapPin;
  const tone =
    key === "online"
      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        tone,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.label}
    </span>
  );
}
