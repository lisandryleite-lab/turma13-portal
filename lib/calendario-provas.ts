// ─────────────────────────────────────────────────────────────
//  Calendário de provas do CFO 2026 (T13–T18)
//
//  Fonte: "PLANEJAMENTO DE AVALIAÇÕES ESCRITAS — CFO 2026 (T13-T18)",
//  divulgado pela Seção de Provas em 02/09/2026. É uma PREVISÃO — atualizar
//  este arquivo sempre que a Seção de Provas divulgar um novo planejamento.
//
//  As siglas seguem as usadas no portal (`Disciplina.sigla`), para que o link
//  do memento resolva. Duas divergem da grafia do PDF, anotadas em `siglaPdf`.
// ─────────────────────────────────────────────────────────────

export const CALENDARIO_ATUALIZADO_EM = "02/09/2026"

export type ProvaCalendario = {
  /** sigla da disciplina no portal — usada no link do memento */
  sigla: string
  /** grafia do PDF, quando diferente da sigla do portal */
  siglaPdf?: string
  /** rótulo da avaliação, ex.: "1AE", "2AE" */
  avaliacao?: string
}

export type SemanaCalendario = {
  semana: number
  /** rótulo curto "31/08" */
  inicio: string
  fim: string
  /** datas ISO da semana (segunda a domingo) — usadas pela grade do calendário */
  inicioIso: string
  fimIso: string
  provas: ProvaCalendario[]
  /** semanas sem avaliação teórica trazem só a observação */
  semAvaliacao?: boolean
  obs?: string
}

export const MENSAGEM_SECAO_PROVAS = [
  "Senhores, a Seção de Provas decidiu elaborar um calendário mais extenso, com uma previsão das próximas avaliações, para que todos possam se organizar e se preparar com maior antecedência.",
  "Ressaltamos, porém, que se trata apenas de uma PREVISÃO, portanto, existe a possibilidade de alterações. Além disso, entraremos em uma sequência de instruções que tende a dificultar ainda mais a organização do calendário de provas.",
  "Por esse motivo, teremos algumas semanas consecutivas com avaliações, sendo importante que todos já estejam cientes e se programem para esse período.",
  "Assim que houver qualquer alteração ou confirmação, informaremos no grupo. Ademais, semana que vem não teremos prova, pois haverá eventos misteriosos…",
]

export const CALENDARIO_PROVAS: SemanaCalendario[] = [
  {
    semana: 34,
    inicio: "31/08",
    fim: "06/09",
    inicioIso: "2026-08-31",
    fimIso: "2026-09-06",
    provas: [
      { sigla: "TCEM", avaliacao: "2AE" },
      { sigla: "GC" },
    ],
  },
  {
    semana: 35,
    inicio: "07/09",
    fim: "13/09",
    inicioIso: "2026-09-07",
    fimIso: "2026-09-13",
    provas: [],
    semAvaliacao: true,
    obs: "Desfile 7SET, Balística, Simulado GC, Palestra CMT-G e balizamento de C/H entre as turmas.",
  },
  {
    semana: 36,
    inicio: "14/09",
    fim: "20/09",
    inicioIso: "2026-09-14",
    fimIso: "2026-09-20",
    provas: [
      { sigla: "AM", avaliacao: "2AE" },
      { sigla: "INTSISP" },
    ],
  },
  {
    semana: 37,
    inicio: "21/09",
    fim: "27/09",
    inicioIso: "2026-09-21",
    fimIso: "2026-09-27",
    provas: [
      { sigla: "DPPM", siglaPdf: "DPPPM", avaliacao: "1AE" },
      { sigla: "EASE", siglaPdf: "EASP" },
    ],
  },
  {
    semana: 38,
    inicio: "28/09",
    fim: "04/10",
    inicioIso: "2026-09-28",
    fimIso: "2026-10-04",
    provas: [
      { sigla: "EPCR" },
      { sigla: "PJM", avaliacao: "1AE" },
    ],
  },
  {
    semana: 39,
    inicio: "05/10",
    fim: "11/10",
    inicioIso: "2026-10-05",
    fimIso: "2026-10-11",
    provas: [
      { sigla: "POE", avaliacao: "1AE" },
      { sigla: "PE" },
    ],
  },
]

/** Link direto para a matéria dentro de /mementos. */
export function linkMemento(sigla: string) {
  return `/mementos?materia=${encodeURIComponent(sigla)}`
}

// ── Auxiliares de exibição (usados pelo bloco de provas em /mementos) ──

/** Hoje no fuso de Recife, em YYYY-MM-DD (evita divergência servidor/cliente). */
export function hojeRecifeISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Recife", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
}

/** Situação da semana em relação a hoje (YYYY-MM-DD). */
export function situacao(s: SemanaCalendario, hojeISO: string): "passada" | "atual" | "futura" {
  if (hojeISO > s.fimIso) return "passada"
  if (hojeISO < s.inicioIso) return "futura"
  return "atual"
}

/** Período legível da semana: "14 a 20/09" ou "28/09 a 04/10". */
export function periodo(s: SemanaCalendario): string {
  const [di, mi] = s.inicio.split("/")
  const [df, mf] = s.fim.split("/")
  return mi === mf ? `${di} a ${df}/${mf}` : `${s.inicio} a ${s.fim}`
}

/** sigla → semana em que a matéria tem prova (prefere a que ainda não passou). */
export function provasPorMateria(hojeISO: string): Map<string, { semana: SemanaCalendario; prova: ProvaCalendario }> {
  const mapa = new Map<string, { semana: SemanaCalendario; prova: ProvaCalendario }>()
  for (const s of CALENDARIO_PROVAS) {
    for (const p of s.provas) {
      const atual = mapa.get(p.sigla)
      if (!atual || (situacao(atual.semana, hojeISO) === "passada" && situacao(s, hojeISO) !== "passada")) {
        mapa.set(p.sigla, { semana: s, prova: p })
      }
    }
  }
  return mapa
}
