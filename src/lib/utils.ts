import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en formato de moneda mexicana (MXN)
 * @param price - Precio numérico a formatear
 * @param showDecimals - Si se deben mostrar decimales (default: false)
 * @returns String formateado como "$1,234.56" o "$1,234"
 */
export function formatPriceMXN(price: number, showDecimals: boolean = false): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price)
}
