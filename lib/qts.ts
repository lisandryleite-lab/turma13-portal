// ── QTS — utilitários compartilhados ──────────────────────────────────────────
// Módulo puro (sem Prisma, sem `server-only`): usado pela página, pelo editor
// admin ("use client") e pelos scripts `scripts/load-qts-semana*.ts`.

export type QtsDados = { dias: string[]; horarios: string[]; grade: Record<string, string[]> }

/** Os 11 tempos de aula do dia. A grade do QTS é sempre um array desse tamanho. */
export const HORARIOS = [
  "07h00-07h50", "08h00-08h50", "08h50-09h40",
  "10h00-10h50", "10h50-11h40",
  "13h40-14h30", "14h30-15h20",
  "15h40-16h30", "16h30-17h20", "17h30-18h20", "18h20-19h10",
]

// Data local (não UTC) — primeira segunda-feira do curso. Construída com
// componentes ano/mês/dia para evitar o deslize de fuso que jogava o início
// da semana para domingo.
export const DATA_INICIO_QTS = new Date(2026, 0, 12)

/** Rótulos "Seg 17/08" … "Dom 23/08" da semana informada (7 dias). */
export function diasDaSemana(semana: number): string[] {
  const seg = new Date(DATA_INICIO_QTS.getTime() + (semana - 1) * 7 * 24 * 60 * 60 * 1000)
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  // 7 dias (Seg–Dom): há semanas com aula no domingo (ex.: OU-II, PO)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg.getTime() + i * 24 * 60 * 60 * 1000)
    return `${labels[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
  })
}

export function gradeVazia(dias: string[]): Record<string, string[]> {
  const g: Record<string, string[]> = {}
  for (const d of dias) g[d] = new Array(HORARIOS.length).fill("")
  return g
}

// ── Normalização de siglas ────────────────────────────────────────────────────
// A planilha mestre usa abreviações que divergem do cadastro de `Disciplina`.
// Chaves já sem espaços e em maiúsculas (é assim que `normalizaSigla` consulta).
export const ALIAS_SIGLA: Record<string, string> = {
  EASPE: "EASE",     // Economia Aplicada ao Setor Público
  DPPPM: "DPPM",     // Direito Penal e Processual Penal Militar
  INTSIP: "INTSISP", // Inteligência e Sistema de Informação de Seg. Pública
  TFMI: "TFM1",
  TFMII: "TFM2",
  OUI: "OU1",
  OUII: "OU2",
  DPPI: "DPP1",
  DPPII: "DPP2",
  MAPI: "MAP1",
  MAPII: "MAP2",
}

/** Limpa uma célula da planilha e devolve a sigla do banco ("" se vazia). */
export function normalizaSigla(bruto: string): string {
  const s = (bruto || "").replace(/\s+/g, "").replace(/[.,;:]+$/, "").toUpperCase()
  // Traços/travessões isolados são o "vago" da planilha
  if (!s || /^[-–—x]+$/i.test(s)) return ""
  return ALIAS_SIGLA[s] ?? s
}

// ── Faixas de horário → índices de HORARIOS ───────────────────────────────────
const SLOTS = HORARIOS.map(h => {
  const [ini, fim] = h.split("-")
  const min = (t: string) => {
    const [hh, mm] = t.split("h")
    return Number(hh) * 60 + Number(mm || 0)
  }
  return { ini: min(ini), fim: min(fim) }
})

const RE_FAIXA = /(\d{1,2})\s*[h:]\s*(\d{2})\D+?(\d{1,2})\s*[h:]\s*(\d{2})/

/** Extrai {ini,fim} em minutos de um rótulo tipo "08h00 às 09h40". */
export function faixaHorario(texto: string): { ini: number; fim: number } | null {
  const m = RE_FAIXA.exec(texto || "")
  if (!m) return null
  const ini = Number(m[1]) * 60 + Number(m[2])
  const fim = Number(m[3]) * 60 + Number(m[4])
  return fim > ini ? { ini, fim } : null
}

// A planilha agrupa os tempos em blocos ("08h00 às 09h40" = dois tempos de 50min).
// Tolerância de 15min absorve os arredondamentos do rótulo — p.ex. "15h30 às
// 17h20" cobre os tempos de 15h40 e 16h30, mas não o de 17h30.
const TOLERANCIA = 15

/** Índices de HORARIOS contidos na faixa. */
export function slotsDaFaixa(ini: number, fim: number): number[] {
  const dentro = SLOTS.flatMap((s, i) => (s.ini >= ini - TOLERANCIA && s.fim <= fim + TOLERANCIA ? [i] : []))
  if (dentro.length) return dentro
  // Faixa fora do padrão: cai para qualquer tempo que a intersecte
  return SLOTS.flatMap((s, i) => (s.ini < fim && s.fim > ini ? [i] : []))
}

// ── Importação por colagem da planilha mestre ─────────────────────────────────
export type LinhaImportada = {
  /** Rótulo da faixa como veio da planilha ("08h00 às 09h40"). */
  faixa: string
  /** Índices de HORARIOS que essa faixa preenche. */
  slots: number[]
  /** Sigla já normalizada por dia (mesma ordem de `dias`). */
  valores: string[]
}

export type ResultadoImportacao = {
  grade: Record<string, string[]>
  linhas: LinhaImportada[]
  /** Siglas distintas encontradas, ordenadas. */
  siglas: string[]
}

/**
 * Converte um trecho colado da planilha mestre do QTS numa grade.
 *
 * Formato esperado: uma linha por faixa de horário, células separadas por TAB
 * (a colagem do Excel/Sheets) ou por 2+ espaços. Linhas sem faixa de horário
 * reconhecível (cabeçalhos, "SEMANA 32") são ignoradas, e as células à
 * esquerda da faixa também — só o que vem depois dela conta como dia.
 *
 * No QTS mestre cada dia ocupa DUAS subcolunas: a da esquerda é a Turma 13 e a
 * da direita é a outra turma. Daí `colunasPorDia: 2` + `coluna: "esquerda"`
 * como padrão.
 *
 * Atenção: células riscadas na planilha (aula cancelada) chegam aqui como texto
 * normal — precisam ser apagadas à mão depois de aplicar.
 */
export function importarQtsColado(
  texto: string,
  dias: string[],
  opts: { colunasPorDia?: 1 | 2; coluna?: "esquerda" | "direita" } = {},
): ResultadoImportacao {
  const passo = opts.colunasPorDia ?? 2
  const desloc = passo === 2 && opts.coluna === "direita" ? 1 : 0

  const grade = gradeVazia(dias)
  const linhas: LinhaImportada[] = []
  const siglas = new Set<string>()

  for (const bruta of (texto || "").split(/\r?\n/)) {
    if (!bruta.trim()) continue
    const celulas = bruta.includes("\t") ? bruta.split("\t") : bruta.split(/\s{2,}/)

    const iFaixa = celulas.findIndex(c => faixaHorario(c))
    if (iFaixa < 0) continue
    const faixa = faixaHorario(celulas[iFaixa])!
    const slots = slotsDaFaixa(faixa.ini, faixa.fim)
    if (!slots.length) continue

    const celulasDia = celulas.slice(iFaixa + 1)
    const valores = dias.map((dia, d) => {
      const sigla = normalizaSigla(celulasDia[d * passo + desloc] ?? "")
      if (sigla) {
        siglas.add(sigla)
        for (const s of slots) grade[dia][s] = sigla
      }
      return sigla
    })

    linhas.push({ faixa: celulas[iFaixa].trim(), slots, valores })
  }

  return { grade, linhas, siglas: [...siglas].sort() }
}

/** Horas por disciplina numa grade (1 tempo = 1 hora), regra usada no editor. */
export function horasPorDisciplina(grade: Record<string, string[]>): Record<string, number> {
  const h: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const s of slots) if (s) h[s] = (h[s] || 0) + 1
  }
  return h
}
