"use client";

import { useMemo } from "react";
import { MEXICO_STATES_CITIES } from "@/lib/mexico-cities";
import { getCitiesForState } from "@/lib/mexico-location-helpers";
import { Combobox } from "@/components/ui/combobox";

const STATE_NAMES = MEXICO_STATES_CITIES.map((g) => g.value);

export function MexicoStateCityFields({
  state,
  city,
  onStateChange,
  onCityChange,
  disabled,
  stateError,
  cityError,
  stateLabel = "Estado *",
  cityLabel = "Ciudad o municipio *",
}: {
  state: string;
  city: string;
  onStateChange: (v: string) => void;
  onCityChange: (v: string) => void;
  disabled?: boolean;
  stateError?: string;
  cityError?: string;
  stateLabel?: string;
  cityLabel?: string;
}) {
  const cityOptions = useMemo(() => {
    const base = getCitiesForState(state);
    if (city && !base.includes(city)) return [...base, city];
    return base;
  }, [state, city]);

  const stateComboboxOptions = useMemo(
    () => STATE_NAMES.map((s) => ({ value: s, label: s })),
    [],
  );

  const cityComboboxOptions = useMemo(
    () => cityOptions.map((c) => ({ value: c, label: c })),
    [cityOptions],
  );

  const handleState = (next: string) => {
    onStateChange(next);
    const cities = getCitiesForState(next);
    if (city && !cities.includes(city)) onCityChange("");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Combobox
          label={stateLabel}
          options={stateComboboxOptions}
          value={state}
          onValueChange={handleState}
          placeholder="Buscar estado…"
          searchPlaceholder="Buscar estado…"
          disabled={disabled}
        />
        {stateError && <p className="text-xs text-destructive">{stateError}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Combobox
          label={cityLabel}
          options={cityComboboxOptions}
          value={city}
          onValueChange={onCityChange}
          placeholder="Buscar ciudad o municipio…"
          searchPlaceholder="Buscar ciudad o municipio…"
          disabled={disabled || !state}
          emptyText={!state ? "Selecciona un estado primero" : "Sin resultados"}
        />
        {cityError && <p className="text-xs text-destructive">{cityError}</p>}
      </div>
    </div>
  );
}

