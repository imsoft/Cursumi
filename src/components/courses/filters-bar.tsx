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
  onSearchChange,
  onModalityChange,
  onCategoryChange,
  onCityChange,
  onOrderChange,
  onClear,
}: FiltersBarProps) => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <Input
            label="Buscar"
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Ordenar"
            options={orderOptions}
            value={order}
            onChange={(event) => onOrderChange(event.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      </div>
    </section>
  );
};

