"use client";

import { useMemo } from "react";
import { MEXICO_STATES_CITIES } from "@/lib/mexico-cities";
import { getCitiesForState } from "@/lib/mexico-location-helpers";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";

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

  const handleState = (next: string) => {
    onStateChange(next);
    const cities = getCitiesForState(next);
    if (city && !cities.includes(city)) onCityChange("");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SearchableCombobox
        label={stateLabel}
        options={STATE_NAMES}
        value={state}
        onChange={handleState}
        placeholder="Buscar estado…"
        disabled={disabled}
        error={stateError}
      />
      <SearchableCombobox
        label={cityLabel}
        options={cityOptions}
        value={city}
        onChange={onCityChange}
        placeholder="Buscar ciudad o municipio…"
        disabled={disabled || !state}
        hintWhenEmpty={!state ? "Selecciona un estado primero" : undefined}
        error={cityError}
      />
    </div>
  );
}
