import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";

const modalityOptions: SelectOption[] = [
  { value: "all", label: "Todas las modalidades" },
  { value: "virtual", label: "Virtual" },
  { value: "presencial", label: "Presencial" },
];

const categoryOptions: SelectOption[] = [
  { value: "all", label: "Todas las categorías" },
  { value: "programacion", label: "Programación" },
  { value: "marketing", label: "Marketing" },
  { value: "diseno", label: "Diseño" },
  { value: "negocios", label: "Negocios" },
];

const cityOptions: SelectOption[] = [
  { value: "all", label: "Todas las ciudades" },
  { value: "CDMX", label: "CDMX" },
  { value: "Guadalajara", label: "Guadalajara" },
  { value: "Monterrey", label: "Monterrey" },
  { value: "Online", label: "Online" },
];

const orderOptions: SelectOption[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "populares", label: "Más populares" },
  { value: "calificados", label: "Mejor calificados" },
];

export interface FiltersBarProps {
  searchText: string;
  modality: string;
  category: string;
  city: string;
  order: string;
  totalResults: number;
  hasFiltersApplied: boolean;
  onSearchChange: (value: string) => void;
  onModalityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onClear: () => void;
}

export const FiltersBar = ({
  searchText,
  modality,
  category,
  city,
  order,
  totalResults,
  hasFiltersApplied,
  onSearchChange,
  onModalityChange,
  onCategoryChange,
  onCityChange,
  onOrderChange,
  onClear,
}: FiltersBarProps) => {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        {/* Search row */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Buscar cursos"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          {hasFiltersApplied && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="mb-0.5 shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Filter selects */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Modalidad"
            options={modalityOptions}
            value={modality}
            onChange={(event) => onModalityChange(event.target.value)}
          />
          <Select
            label="Categoría"
            options={categoryOptions}
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          />
          <Select
            label="Ciudad"
            options={cityOptions}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
          />
          <Select
            label="Ordenar por"
            options={orderOptions}
            value={order}
            onChange={(event) => onOrderChange(event.target.value)}
          />
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{totalResults}</span>{" "}
            {totalResults === 1 ? "curso encontrado" : "cursos encontrados"}
            {hasFiltersApplied && " con los filtros actuales"}
          </p>
        </div>
      </div>
    </section>
  );
};
