import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────────────────────
//  Fuso da turma — America/Recife (UTC−3, sem horário de verão)
//
//  As funções da Vercel rodam em UTC. Sem converter, `new Date().getDate()`
//  no servidor vira o dia às 21h de Recife: das 21h à meia-noite o portal
//  mostrava o plantão e a faxina DE AMANHÃ, as funções de destaque do dia
//  errado, a contagem regressiva um dia a menos, e no domingo às 21h a
//  semana já pulava.
//
//  Regra: todo cálculo de "que dia é hoje" no SERVIDOR passa por aqui.
//  Componentes client não precisam — o navegador do aluno já está em Recife.
//  `new Date()` como carimbo de instante (dataPagamento, expires) continua
//  correto e não deve ser trocado.
// ─────────────────────────────────────────────────────────────
export const TZ_TURMA = "America/Recife"

/** Ano, mês (1–12) e dia do calendário de Recife no instante dado. */
export function partesEmRecife(instante: Date = new Date()): { ano: number; mes: number; dia: number } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_TURMA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instante)
  const num = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value)
  return { ano: num("year"), mes: num("month"), dia: num("day") }
}

/**
 * O dia corrente em Recife como Date de meia-noite no fuso do processo.
 * Use quando o valor for repassado a helpers que leem `getDate()`/`getDay()`
 * (`grupoPlantaoPorData`, `grupoFaxinaPorData`) — ambos os lados ficam no
 * mesmo fuso e a conta fecha.
 */
export function hojeEmRecife(instante: Date = new Date()): Date {
  const { ano, mes, dia } = partesEmRecife(instante)
  return new Date(ano, mes - 1, dia)
}

// DATA_INICIO = primeira segunda-feira do curso (12/01/2026)
// Semana 20 = 25/05 a 31/05/2026
export const DATA_INICIO = new Date("2026-01-12")

// A semana vira na segunda-feira 00h de Recife (não 00h UTC, que é 21h de domingo).
export function semanaAtual(agora: Date = new Date()): number {
  const { ano, mes, dia } = partesEmRecife(agora)
  const diff = Date.UTC(ano, mes - 1, dia) - DATA_INICIO.getTime()
  return Math.min(52, Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1))
}

// Data prevista de término do CFO — 05/01/2027 (previsão da turma, ago/2026).
// Meia-noite UTC para o cálculo não escorregar de dia em fuso negativo.
export const DATA_FIM_CFO = new Date("2027-01-05T00:00:00.000Z")

// Dias que faltam para o término, contando o dia de hoje como já vivido:
// 25/08/2026 → 133. Nunca negativo — depois da data, zera.
export function diasParaFimCFO(agora: Date = new Date()): number {
  const { ano, mes, dia } = partesEmRecife(agora)
  const hojeUTC = Date.UTC(ano, mes - 1, dia)
  return Math.max(0, Math.round((DATA_FIM_CFO.getTime() - hojeUTC) / 86_400_000))
}
