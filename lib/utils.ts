import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DATA_INICIO = new Date("2026-01-05")

export function semanaAtual(): number {
  const diff = Date.now() - DATA_INICIO.getTime()
  return Math.min(52, Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))))
}
