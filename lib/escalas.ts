// ─────────────────────────────────────────────────────────────
//  Cálculos automáticos de escalas — Turma 13 CFO PM 2026
// ─────────────────────────────────────────────────────────────

// Matrícula ordenada por antiguidade (menor = mais antigo) — 33 alunos (206 e 207 removidos)
export const MATRICULAS_ORDEM = [
  1, 7, 13, 19, 23, 26, 37, 41, 45, 54, 55, 57, 60, 65,
  71, 76, 81, 94, 98, 105, 106, 108, 114, 116, 131, 143,
  144, 153, 165, 167, 174, 186, 191,
]

// Semana de referência: semana 20 → P1=65 KAUHANNI (idx 13), P3=71 LEIMIG (idx 14), P4=76 ARAUJO JUNIOR (idx 15)
const REF_SEMANA = 20
const REF_P1_IDX = 13

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
//  Referência confirmada: 26/05/2026 = GOLF (índice 0)
//  Ciclo: GOLF → HOTEL → INDIA → JULIETT → KILO → LIMA → MIKE → NOVEMBER → (repete)
//  Inclui fins de semana. Verificação: 02/06/2026 = NOVEMBER.
// ─────────────────────────────────────────────────────────────
export const GRUPOS_PLANTAO = ["GOLF", "HOTEL", "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER"] as const
export type GrupoPlantao = typeof GRUPOS_PLANTAO[number]

// Referência: 26/05/2026 = GOLF (índice 0) — confirmado pela turma
// Normaliza para UTC midnight para evitar problemas de fuso horário
const REF_PLANTAO_UTC = new Date("2026-05-26T00:00:00.000Z").getTime()

export function grupoPlantaoPorData(data: Date): GrupoPlantao {
  const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  const diffDias = Math.floor((dataUTC - REF_PLANTAO_UTC) / 86_400_000)
  return GRUPOS_PLANTAO[((diffDias % 8) + 8) % 8]
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
// IMPORTANTE: `data` é uma string "YYYY-MM-DD" (tz-estável). Construir com
// `new Date(string)` no cliente e chamar getDate() causava deslize de fuso
// (ex.: 01/06 aparecia como 31/05 em UTC-3). O número do dia deve vir da string.
export function calendarioFaxinaMes(ano: number, mes: number): {
  data: string
  diaSemana: string
  tipo: "util" | "fds"
  grupoFaxina: GrupoFaxina | null
  grupoPlantao: GrupoPlantao
}[] {
  const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
  const pad = (n: number) => String(n).padStart(2, "0")
  const dias: ReturnType<typeof calendarioFaxinaMes> = []
  const totalDias = new Date(ano, mes, 0).getDate()

  for (let d = 1; d <= totalDias; d++) {
    const dataObj = new Date(ano, mes - 1, d)
    const util = isDiaUtil(dataObj)
    dias.push({
      data: `${ano}-${pad(mes)}-${pad(d)}`,
      diaSemana: DIAS[dataObj.getDay()],
      tipo: util ? "util" : "fds",
      grupoFaxina: util ? grupoFaxinaPorData(dataObj) : null,
      grupoPlantao: grupoPlantaoPorData(dataObj),
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

// Composição dos grupos de plantão — atualizado maio/2026 (8 grupos)
export const MEMBROS_PLANTAO: Record<GrupoPlantao, { mat: number; nome: string }[]> = {
  GOLF:     [{ mat: 1,   nome: "HELLTON FERNANDES" }, { mat: 7,   nome: "ALDO SILVA" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 57,  nome: "CLEYTON" }, { mat: 143, nome: "VIDAL" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
  HOTEL:    [{ mat: 13,  nome: "JONAS" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 144, nome: "SAMUEL SANTOS" }],
  INDIA:    [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 116, nome: "BERTIPALHA" }],
  JULIETT:  [{ mat: 94,  nome: "ANDRÉ CARDOSO" }],
  KILO:     [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }],
  LIMA:     [{ mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 174, nome: "ALEXANDRE" }, { mat: 186, nome: "SAMUEL SILVA" }],
  MIKE:     [{ mat: 45,  nome: "GABRIELE COSTA" }, { mat: 54,  nome: "ELDER CARVALHO" }, { mat: 81,  nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 108, nome: "LISANDRY" }, { mat: 153, nome: "HUGO" }, { mat: 165, nome: "KEVIN GOMES" }],
  NOVEMBER: [{ mat: 55,  nome: "SHIRLAYNE" }, { mat: 71,  nome: "LEIMIG" }, { mat: 76,  nome: "ARAÚJO JR" }],
}
