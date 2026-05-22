// ─────────────────────────────────────────────────────────────
//  Cálculos automáticos de escalas — Turma 13 CFO PM 2026
// ─────────────────────────────────────────────────────────────

// Matrícula ordenada por antiguidade (menor = mais antigo)
export const MATRICULAS_ORDEM = [
  1, 7, 13, 19, 23, 26, 37, 41, 45, 54, 55, 57, 60, 65,
  71, 76, 81, 94, 98, 105, 106, 108, 114, 116, 131, 143,
  144, 153, 165, 167, 174, 186, 191, 206, 207,
]

// Semana de referência: semana 16 → P1=41 (idx 7), P3=45 (idx 8), P4=54 (idx 9)
const REF_SEMANA = 16
const REF_P1_IDX = 7

export function calcularServico(semana: number): {
  p1: number | null
  p3: number | null
  p4: number | null
} {
  const offset = semana - REF_SEMANA
  const get = (i: number) => MATRICULAS_ORDEM[REF_P1_IDX + offset + i] ?? null
  return { p1: get(0), p3: get(1), p4: get(2) }
}

// ─────────────────────────────────────────────────────────────
//  Grupo de plantão externo — cicla a cada dia corrido
//  Referência confirmada: 20/05/2026 (terça) = LIMA
//  Ciclo: LIMA → GOLF → HOTEL → INDIA → JULIETT → KILO → (repete)
//  Inclui fins de semana
// ─────────────────────────────────────────────────────────────
export const GRUPOS_PLANTAO = ["LIMA", "GOLF", "HOTEL", "INDIA", "JULIETT", "KILO"] as const
export type GrupoPlantao = typeof GRUPOS_PLANTAO[number]

// Referência: 20/05/2026 = LIMA (índice 0) — confirmado pela turma
const REF_PLANTAO = new Date(2026, 4, 20) // 20 de maio de 2026

export function grupoPlantaoPorData(data: Date): GrupoPlantao {
  const diffDias = Math.floor((data.getTime() - REF_PLANTAO.getTime()) / 86_400_000)
  return GRUPOS_PLANTAO[((diffDias % 6) + 6) % 6]
}

// ─────────────────────────────────────────────────────────────
//  Faxina — cicla por dias úteis (seg-sex)
//  Referência: 01/05/2026 (Sex, dia útil) = G3
// ─────────────────────────────────────────────────────────────
export const GRUPOS_FAXINA = ["G1","G2","G3","G4","G5","G6","G7","G8"] as const
export type GrupoFaxina = typeof GRUPOS_FAXINA[number]

const REF_FAXINA_DATA = new Date(2026, 4, 1)  // 01/05/2026
const REF_FAXINA_GRUPO_IDX = 2               // G3 = índice 2

function isDiaUtil(d: Date): boolean {
  const dia = d.getDay()
  return dia !== 0 && dia !== 6
}

function contarDiasUteis(de: Date, ate: Date): number {
  let count = 0
  const cur = new Date(de)
  cur.setHours(0, 0, 0, 0)
  const fim = new Date(ate)
  fim.setHours(0, 0, 0, 0)
  const passo = de <= ate ? 1 : -1
  while (cur.getTime() !== fim.getTime()) {
    if (isDiaUtil(cur)) count += passo
    cur.setDate(cur.getDate() + passo)
  }
  return count
}

export function grupoFaxinaPorData(data: Date): GrupoFaxina | null {
  if (!isDiaUtil(data)) return null
  const dias = contarDiasUteis(REF_FAXINA_DATA, data)
  const idx = (((REF_FAXINA_GRUPO_IDX + dias) % 8) + 8) % 8
  return GRUPOS_FAXINA[idx]
}

// Gera calendário de faxina de um mês inteiro
export function calendarioFaxinaMes(ano: number, mes: number): {
  data: Date
  diaSemana: string
  tipo: "util" | "fds"
  grupoFaxina: GrupoFaxina | null
  grupoPlantao: GrupoPlantao
}[] {
  const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
  const dias: ReturnType<typeof calendarioFaxinaMes> = []
  const totalDias = new Date(ano, mes, 0).getDate()

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes - 1, d)
    const util = isDiaUtil(data)
    dias.push({
      data,
      diaSemana: DIAS[data.getDay()],
      tipo: util ? "util" : "fds",
      grupoFaxina: util ? grupoFaxinaPorData(data) : null,
      grupoPlantao: grupoPlantaoPorData(data),
    })
  }
  return dias
}

// Composição dos grupos de faxina (estática, definida na turma)
export const COMPOSICAO_FAXINA: Record<GrupoFaxina, { mat: number; nome: string }[]> = {
  G1: [{ mat: 191, nome: "GOMES NASCIMENTO" }, { mat: 143, nome: "VIDAL" }, { mat: 153, nome: "HUGO" }, { mat: 174, nome: "ALEXANDRE" }],
  G2: [{ mat: 167, nome: "GUSTAVO NETO" }, { mat: 186, nome: "SAMUEL SILVA" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 13, nome: "JONAS" }],
  G3: [{ mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 165, nome: "KEVIN GOMES" }, { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 94, nome: "ANDRÉ CARDOSO" }],
  G4: [{ mat: 108, nome: "LISANDRY" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 81, nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }],
  G5: [{ mat: 98, nome: "JOSÉ MENEZES" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 71, nome: "LEIMIG" }, { mat: 76, nome: "ARAÚJO JR" }],
  G6: [{ mat: 55, nome: "SHIRLAYNE" }, { mat: 65, nome: "KAUHANNI" }, { mat: 41, nome: "ALAN SILVA" }, { mat: 60, nome: "JOÃO NUNES" }],
  G7: [{ mat: 54, nome: "ELDER CARVALHO" }, { mat: 57, nome: "CLEYTON" }, { mat: 19, nome: "THAIS FIGUEIREDO" }, { mat: 45, nome: "GABRIELE COSTA" }],
  G8: [{ mat: 7, nome: "ALDO SILVA" }, { mat: 37, nome: "PABLO TORRES" }, { mat: 23, nome: "RODOLFO MOURA" }, { mat: 26, nome: "ANDRÉ" }],
}

// Composição dos grupos de plantão — documento oficial 13/04/2026
export const MEMBROS_PLANTAO: Record<GrupoPlantao, { mat: number; nome: string }[]> = {
  GOLF:    [{ mat: 7,   nome: "ALDO SILVA" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 57,  nome: "CLEYTON" }, { mat: 143, nome: "VIDAL" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
  HOTEL:   [{ mat: 13,  nome: "JONAS" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 45,  nome: "GABRIELE COSTA" }, { mat: 54,  nome: "ELDER CARVALHO" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 165, nome: "KEVIN GOMES" }],
  INDIA:   [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 81,  nome: "FERNANDO ROCHA" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 153, nome: "HUGO" }],
  JULIETT: [{ mat: 55,  nome: "SHIRLAYNE" }, { mat: 71,  nome: "LEIMIG" }, { mat: 76,  nome: "ARAÚJO JR" }, { mat: 94,  nome: "ANDRÉ CARDOSO" }, { mat: 174, nome: "ALEXANDRE" }],
  KILO:    [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }],
  LIMA:    [{ mat: 108, nome: "LISANDRY" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 186, nome: "SAMUEL SILVA" }],
}
