"use client";

import { EmptyState as SharedEmptyState } from "@/components/shared/empty-state";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export const EmptyState = ({ onResetFilters }: EmptyStateProps) => {
  return (
    <SharedEmptyState
      title="Ningún curso coincide"
      description="Ajusta los filtros o crea un curso nuevo."
      action={{
        label: "Crear nuevo curso",
        href: "/instructor/courses/new",
        variant: "default",
      }}
      secondaryAction={{
        label: "Limpiar filtros",
        onClick: onResetFilters,
        variant: "outline",
      }}
    />
  );
};

