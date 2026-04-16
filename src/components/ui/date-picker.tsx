"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Si true, no permite fechas pasadas */
  disablePast?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  className,
  disablePast = false,
}: DatePickerProps) {
  const selected = value ?? undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected ? format(selected, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onChange}
          locale={es}
          disabled={disablePast ? (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** Versión controlada con string ISO (YYYY-MM-DD) — compatible con react-hook-form */
interface DatePickerFieldProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  disablePast?: boolean
}

export function DatePickerField({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  disablePast,
}: DatePickerFieldProps) {
  const dateValue = value ? new Date(value + "T12:00:00") : undefined

  return (
    <DatePicker
      value={dateValue}
      onChange={(date) => {
        if (onChange) {
          onChange(date ? format(date, "yyyy-MM-dd") : "")
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      disablePast={disablePast}
    />
  )
}
