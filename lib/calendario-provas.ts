// Calendário de provas escritas — CFO 2026 (T13-T18).
// Fonte: "Planejamento de Avaliações Escritas", versão de 02/09/2026.
// As siglas seguem as disciplinas do portal (o calendário oficial escreve
// "DPPPM" e "EASP"; aqui usamos DPPM e EASE, como cadastradas em Aulas).

export type Prova = { sigla: string; rotulo?: string }
export type SemanaProva = {
  semana: number
  inicio: string // YYYY-MM-DD (segunda)
  fim: string    // YYYY-MM-DD (domingo)
  provas: Prova[]
  obs?: string
}

export const CALENDARIO_FONTE = "Planejamento de Avaliações Escritas — CFO 2026 (T13-T18) · atualizado em 02/09/2026"

export const CALENDARIO_PROVAS: SemanaProva[] = [
  { semana: 34, inicio: "2026-08-31", fim: "2026-09-06", provas: [{ sigla: "TCEM", rotulo: "2ª AE" }, { sigla: "GC" }] },
  { semana: 35, inicio: "2026-09-07", fim: "2026-09-13", provas: [],
    obs: "Sem avaliação teórica — Desfile 7SET, Balística, Simulado GC, Palestra CMT-G e balizamento de C/H entre as turmas." },
  { semana: 36, inicio: "2026-09-14", fim: "2026-09-20", provas: [{ sigla: "AM", rotulo: "2ª AE" }, { sigla: "INTSISP" }] },
  { semana: 37, inicio: "2026-09-21", fim: "2026-09-27", provas: [{ sigla: "DPPM", rotulo: "1ª AE" }, { sigla: "EASE" }] },
  { semana: 38, inicio: "2026-09-28", fim: "2026-10-04", provas: [{ sigla: "EPCR" }, { sigla: "PJM", rotulo: "1ª AE" }] },
  { semana: 39, inicio: "2026-10-05", fim: "2026-10-11", provas: [{ sigla: "POE", rotulo: "1ª AE" }, { sigla: "PE" }] },
]

/** "2026-09-14" → "14/09" */
export function dmy(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

/** Período legível da semana: "14 a 20/09" ou "28/09 a 04/10". */
export function periodo(s: SemanaProva): string {
  const [, mi, di] = s.inicio.split("-")
  const [, mf, df] = s.fim.split("-")
  return mi === mf ? `${di} a ${df}/${mf}` : `${di}/${mi} a ${df}/${mf}`
}

/** Situação da semana em relação a hoje (YYYY-MM-DD). */
export function situacao(s: SemanaProva, hojeISO: string): "passada" | "atual" | "futura" {
  if (hojeISO > s.fim) return "passada"
  if (hojeISO < s.inicio) return "futura"
  return "atual"
}

/** sigla → semana em que a matéria tem prova (a próxima, se houver mais de uma). */
export function provasPorMateria(hojeISO: string): Map<string, { semana: SemanaProva; prova: Prova }> {
  const mapa = new Map<string, { semana: SemanaProva; prova: Prova }>()
  for (const s of CALENDARIO_PROVAS) {
    for (const p of s.provas) {
      const atual = mapa.get(p.sigla)
      // prefere a semana ainda não passada; senão mantém a primeira encontrada
      if (!atual || (situacao(atual.semana, hojeISO) === "passada" && situacao(s, hojeISO) !== "passada")) {
        mapa.set(p.sigla, { semana: s, prova: p })
      }
    }
  }
  return mapa
}

/** Hoje no fuso de Recife, em YYYY-MM-DD (evita divergência servidor/cliente). */
export function hojeRecifeISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Recife", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
}
