// ─────────────────────────────────────────────────────────────
//  Feriados nacionais 2026 — usado pra classificar dia útil x fim de semana
//  na regra de Permuta de Plantões (feriado segue a regra de fim de semana).
// ─────────────────────────────────────────────────────────────
export const FERIADOS_NACIONAIS_2026 = new Set([
  "2026-01-01", // Confraternização Universal
  "2026-04-03", // Sexta-feira Santa
  "2026-04-21", // Tiradentes
  "2026-05-01", // Dia do Trabalho
  "2026-06-04", // Corpus Christi
  "2026-09-07", // Independência do Brasil
  "2026-10-12", // Nossa Senhora Aparecida
  "2026-11-02", // Finados
  "2026-11-15", // Proclamação da República
  "2026-11-20", // Consciência Negra
  "2026-12-25", // Natal
])

// Normaliza pra "YYYY-MM-DD" a partir dos componentes locais (evita deslize de fuso)
export function isoData(data: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
}

export type TipoDia = "util" | "fds"

export function tipoDia(data: Date): TipoDia {
  const dia = data.getDay()
  const ehFeriado = FERIADOS_NACIONAIS_2026.has(isoData(data))
  return dia === 0 || dia === 6 || ehFeriado ? "fds" : "util"
}
