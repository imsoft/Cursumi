"use client";

import { EmptyState as SharedEmptyState } from "@/components/shared/empty-state";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export const EmptyState = ({ onResetFilters }: EmptyStateProps) => {
  return (
    <SharedEmptyState
      title="No encontramos cursos"
      description="Ajusta los filtros para ver más cursos o crea uno nuevo."
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

