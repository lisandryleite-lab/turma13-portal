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

// Data prevista de término do CFO — 05/01/2027 (previsão da turma, ago/2026).
// Meia-noite UTC para o cálculo não escorregar de dia em fuso negativo.
export const DATA_FIM_CFO = new Date("2027-01-05T00:00:00.000Z")

// Dias que faltam para o término, contando o dia de hoje como já vivido:
// 25/08/2026 → 133. Nunca negativo — depois da data, zera.
export function diasParaFimCFO(agora: Date = new Date()): number {
  const hojeUTC = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate())
  return Math.max(0, Math.round((DATA_FIM_CFO.getTime() - hojeUTC) / 86_400_000))
}
