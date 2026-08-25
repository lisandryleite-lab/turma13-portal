// ─────────────────────────────────────────────────────────────
//  Cálculos automáticos de escalas — Turma 13 CFO PM 2026
// ─────────────────────────────────────────────────────────────

// Converte "YYYY-MM-DD" em Date de meia-noite LOCAL — nunca usar `new Date(string)`
// direto com uma data-only string: o JS interpreta como UTC e, em fuso negativo,
// `.getDate()` depois volta um dia (mesmo problema já registrado em calendarioFaxinaMes).
export function parseDataLocal(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

// Matrícula ordenada por antiguidade (menor = mais antigo) — 34 alunos
// (206 e 207 removidos; 1 HELLTON FERNANDES e 54 ELDER CARVALHO saíram da Turma 13 em jun/2026;
// 213 R SILVA entrou em jun/2026; 211 DÁRIO e 212 CAMILA BUONORA entraram em jul/2026 — Mapa de Equipes JULHO/2026)
export const MATRICULAS_ORDEM = [
  7, 13, 19, 23, 26, 37, 41, 45, 55, 57, 60, 65,
  71, 76, 81, 94, 98, 105, 106, 108, 114, 116, 131, 143,
  144, 153, 165, 167, 174, 186, 191, 211, 212, 213,
]

// Semana de referência: semana 20 → P1=65 KAUHANNI (idx 11), P3=71 LEIMIG (idx 12), P4=76 ARAUJO JUNIOR (idx 13)
// (idx recalibrado em jun/2026 após remoção de 1 e 54 do array, que ficavam antes do índice original 13)
const REF_SEMANA = 20
const REF_P1_IDX = 11

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
//  Grupo de plantão externo — ESCALA 3X1 (a partir de agosto/2026)
//  Ciclo: ALPHA → BRAVO → CHARLIE → DELTA → (repete), um grupo por dia
//  corrido, fins de semana incluídos. Cada grupo dá plantão a cada 4 dias.
//
//  Substituiu a escala 7x1 de 8 grupos (GOLF…NOVEMBER), que valia até
//  julho/2026 com referência 26/05/2026 = GOLF.
//
//  Fonte: "MAPA DE EQUIPES DE PLANTÃO - ESCALA 3X1 · AGOSTO/2026" (SEI, 1ª CIA,
//  assinado em 21/08/2026) e "ESCALA - 3X1 - AGOSTO (ATUALIZADA ATÉ 19.08)".
//  Referência: 25/08/2026 (Ter) = BRAVO. Conferida contra os 12 dias de 20 a
//  31/08 da escala diária — bate em todos.
// ─────────────────────────────────────────────────────────────
export const GRUPOS_PLANTAO = ["ALPHA", "BRAVO", "CHARLIE", "DELTA"] as const
export type GrupoPlantao = typeof GRUPOS_PLANTAO[number]

// Cor por grupo de plantão — fonte única (evita paletas divergentes entre telas)
export const CORES_PLANTAO: Record<string, string> = {
  ALPHA: "#15803D", BRAVO: "#B91C1C", CHARLIE: "#1D4ED8", DELTA: "#B45309",
}

// Referência: 25/08/2026 = BRAVO (índice 1).
// Normaliza para UTC midnight para evitar problemas de fuso horário.
const REF_PLANTAO_UTC = new Date("2026-08-25T00:00:00.000Z").getTime()
const REF_PLANTAO_IDX = 1 // BRAVO

export function grupoPlantaoPorData(data: Date): GrupoPlantao {
  const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  const diffDias = Math.floor((dataUTC - REF_PLANTAO_UTC) / 86_400_000)
  const n = GRUPOS_PLANTAO.length
  return GRUPOS_PLANTAO[(((REF_PLANTAO_IDX + diffDias) % n) + n) % n]
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

// Composição dos grupos de faxina — fallback quando FaxinaGrupoMembro (BD) está vazia.
// Sincronizada com o BD em jul/2026 (211 DÁRIO e 213 R SILVA no G7; 212 CAMILA BUONORA no G8).
export const COMPOSICAO_FAXINA: Record<GrupoFaxina, { mat: number; nome: string }[]> = {
  G1: [{ mat: 143, nome: "VIDAL" }, { mat: 153, nome: "HUGO" }, { mat: 174, nome: "ALEXANDRE" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
  G2: [{ mat: 13, nome: "JONAS" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 186, nome: "SAMUEL SILVA" }],
  G3: [{ mat: 108, nome: "LISANDRY" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 165, nome: "KEVIN GOMES" }],
  G4: [{ mat: 81, nome: "FERNANDO ROCHA" }, { mat: 94, nome: "ANDRÉ CARDOSO" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 144, nome: "SAMUEL SANTOS" }],
  G5: [{ mat: 71, nome: "LEIMIG" }, { mat: 76, nome: "ARAÚJO JR" }, { mat: 98, nome: "JOSÉ MENEZES" }, { mat: 105, nome: "LUCAS EDUARDO" }],
  G6: [{ mat: 41, nome: "ALAN SILVA" }, { mat: 55, nome: "SHIRLAYNE" }, { mat: 60, nome: "JOÃO NUNES" }, { mat: 65, nome: "KAUHANNI" }],
  G7: [{ mat: 19, nome: "THAIS FIGUEIREDO" }, { mat: 45, nome: "GABRIELE COSTA" }, { mat: 57, nome: "CLEYTON" }, { mat: 211, nome: "DÁRIO" }, { mat: 213, nome: "R SILVA" }],
  G8: [{ mat: 7, nome: "ALDO SILVA" }, { mat: 23, nome: "RODOLFO MOURA" }, { mat: 26, nome: "ANDRÉ" }, { mat: 37, nome: "PABLO TORRES" }, { mat: 212, nome: "CAMILA BUONORA" }],
}

// Composição dos grupos de plantão — escala 3X1, agosto/2026.
// Transcrita do "MAPA DE DIVISÃO DAS EQUIPES DE PLANTÃO DA 1ª COMPANHIA" (SEI,
// assinado em 21/08/2026), filtrando as 34 matrículas da Turma 13.
//
// ATENÇÃO: o mapa da 1ª CIA lista só 31 dos 34 alunos da Turma 13 — 108 LISANDRY,
// 211 DÁRIO e 213 R SILVA não aparecem em nenhuma das 4 equipes (busca no texto do
// PDF por "108", "LISANDRY", "DÁRIO" e "R SILVA" não acha nada; é omissão do
// documento, não outro grupo).
//   • 108 LISANDRY está em ALPHA — informado pelo próprio em 25/08/2026.
//   • 211 e 213 seguem sem equipe. Não chutar: esperar a 1ª CIA publicar.
export const MEMBROS_PLANTAO: Record<GrupoPlantao, { mat: number; nome: string }[]> = {
  ALPHA:   [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 94,  nome: "ANDRÉ CARDOSO" }, { mat: 108, nome: "LISANDRY" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 153, nome: "HUGO" }],
  BRAVO:   [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 174, nome: "ALEXANDRE" }, { mat: 186, nome: "SAMUEL SILVA" }, { mat: 212, nome: "CAMILA BUONORA" }],
  CHARLIE: [{ mat: 45,  nome: "GABRIELE COSTA" }, { mat: 55,  nome: "SHIRLAYNE" }, { mat: 71,  nome: "LEIMIG" }, { mat: 76,  nome: "ARAÚJO JR" }, { mat: 81,  nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 165, nome: "KEVIN GOMES" }, { mat: 214, nome: "DAMASCENA" }],
  DELTA:   [{ mat: 7,   nome: "ALDO SILVA" }, { mat: 13,  nome: "JONAS" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 57,  nome: "CLEYTON" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 143, nome: "VIDAL" }, { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
}

// Alunos da Turma 13 ainda sem equipe no mapa 3X1 da 1ª CIA.
export const SEM_EQUIPE_PLANTAO = [211, 213] as const
