import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// DATA_INICIO = primeira segunda-feira do curso (12/01/2026)
// Semana 20 = 25/05 a 31/05/2026
export const DATA_INICIO = new Date("2026-01-12")

export function semanaAtual(): number {
  const diff = Date.now() - DATA_INICIO.getTime()
  return Math.min(52, Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1))
}
