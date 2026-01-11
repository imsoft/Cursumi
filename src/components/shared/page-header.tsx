"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
    icon?: ReactNode;
  };
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  action,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <>
          {action.href ? (
            <Button
              variant={action.variant || "default"}
              className="w-full md:w-auto"
              asChild
            >
              <Link href={action.href}>
                {action.icon}
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button
              variant={action.variant || "default"}
              className="w-full md:w-auto"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

