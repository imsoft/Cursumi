"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useMemo } from "react";

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Borradores" },
  { value: "archived", label: "Archivados" },
];

const modalityOptions = [
  { value: "all", label: "Todas" },
  { value: "virtual", label: "Virtual" },
  { value: "live", label: "En vivo" },
  { value: "presencial", label: "Presencial" },
];

interface CoursesFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  modalityFilter: string;
  onModalityChange: (modality: string) => void;
  onClear: () => void;
}

export const CoursesFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  modalityFilter,
  onModalityChange,
  onClear,
}: CoursesFiltersProps) => {
  const activeFilters = useMemo(
    () => statusFilter !== "all" || modalityFilter !== "all" || searchTerm.trim().length > 0,
    [statusFilter, modalityFilter, searchTerm],
  );

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <Input
            label="Buscar curso"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="grid w-full gap-4 md:w-auto md:grid-cols-2">
          <Combobox
            label="Estado"
            options={statusOptions}
            value={statusFilter}
            onValueChange={onStatusChange}
          />
          <Combobox
            label="Modalidad"
            options={modalityOptions}
            value={modalityFilter}
            onValueChange={onModalityChange}
          />
        </div>
        <div>
          <Button variant="ghost" size="sm" className="w-full" disabled={!activeFilters} onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
