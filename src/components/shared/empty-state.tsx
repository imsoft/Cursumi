"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) => {

  return (
    <Card className={cn("border border-border bg-card/90", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 px-4">
        {Icon && (
          <div className="rounded-full bg-muted p-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {(action || secondaryAction) && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {secondaryAction && (
              secondaryAction.href ? (
                <Button asChild variant={secondaryAction.variant || "outline"}>
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant || "outline"}
                >
                  {secondaryAction.label}
                </Button>
              )
            )}
            {action && (
              action.href ? (
                <Button asChild variant={action.variant || "default"}>
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ) : (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                >
                  {action.label}
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

