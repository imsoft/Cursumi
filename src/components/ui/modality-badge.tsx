import { Monitor, MapPin } from "lucide-react";
import { MODALITY_CONFIG, type Modality } from "@/lib/modality";
import { cn } from "@/lib/utils";

interface ModalityBadgeProps {
  modality: Modality | string;
  size?: "sm" | "md";
  className?: string;
}

export function ModalityBadge({ modality, size = "sm", className }: ModalityBadgeProps) {
  const key = modality === "presencial" ? "presencial" : "virtual";
  const config = MODALITY_CONFIG[key];
  const Icon = key === "virtual" ? Monitor : MapPin;

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
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.shortLabel}
    </span>
  );
}

export function ModalityOverlayBadge({ modality }: { modality: Modality | string }) {
  const key = modality === "presencial" ? "presencial" : "virtual";
  const config = MODALITY_CONFIG[key];
  const Icon = key === "virtual" ? Monitor : MapPin;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm",
        config.color.badgeBg,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.shortLabel}
    </span>
  );
}
