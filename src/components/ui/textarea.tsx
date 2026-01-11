import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label
            htmlFor={props.id}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "min-h-[140px] rounded-2xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            className,
          )}
          {...props}
        />
        {helperText && (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

