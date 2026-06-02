import { Monitor, MapPin, Video } from "lucide-react";
import { MODALITY_CONFIG, type Modality } from "@/lib/modality";
import { cn } from "@/lib/utils";

function modalityKey(modality: string): Modality {
  if (modality === "presencial") return "presencial";
  if (modality === "live") return "live";
  return "virtual";
}

function ModalityIcon({ modalityKey: k, className }: { modalityKey: Modality; className?: string }) {
  if (k === "virtual") return <Monitor className={className} />;
  if (k === "live") return <Video className={className} />;
  return <MapPin className={className} />;
}

interface ModalityBadgeProps {
  modality: Modality | string;
  size?: "sm" | "md";
  className?: string;
}

export function ModalityBadge({ modality, size = "sm", className }: ModalityBadgeProps) {
  const key = modalityKey(modality);
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
  const key = modalityKey(modality);
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
