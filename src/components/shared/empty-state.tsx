"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
    <Empty className={cn("border", className)}>
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {(action || secondaryAction) && (
        <EmptyContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            {secondaryAction && (
              secondaryAction.href ? (
                <Button asChild variant={secondaryAction.variant ?? "outline"}>
                  <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                </Button>
              ) : (
                <Button onClick={secondaryAction.onClick} variant={secondaryAction.variant ?? "outline"}>
                  {secondaryAction.label}
                </Button>
              )
            )}
            {action && (
              action.href ? (
                <Button asChild variant={action.variant ?? "default"}>
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ) : (
                <Button onClick={action.onClick} variant={action.variant ?? "default"}>
                  {action.label}
                </Button>
              )
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
};
