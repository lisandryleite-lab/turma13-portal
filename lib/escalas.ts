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
// Grupos da 7X1 — regime VIGENTE (setembro/2026 em diante).
export const GRUPOS_7X1 = ["GOLF", "HOTEL", "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER"] as const
// Grupos da 3X1 — valeu só em agosto/2026. Mantidos para os dias daquele mês
// continuarem corretos (a semana 34 do portal começa em 31/08).
export const GRUPOS_3X1 = ["ALPHA", "BRAVO", "CHARLIE", "DELTA"] as const

export type Grupo7x1 = typeof GRUPOS_7X1[number]
export type Grupo3x1 = typeof GRUPOS_3X1[number]
export type GrupoPlantao = Grupo7x1 | Grupo3x1

// O que as telas listam = o regime vigente.
export const GRUPOS_PLANTAO = GRUPOS_7X1

// Cor por grupo de plantão — fonte única (evita paletas divergentes entre telas)
export const CORES_PLANTAO: Record<string, string> = {
  // 7X1 (vigente)
  GOLF: "#15803D", HOTEL: "#B91C1C", INDIA: "#1D4ED8", JULIETT: "#B45309",
  KILO: "#7E22CE", LIMA: "#0F766E", MIKE: "#BE185D", NOVEMBER: "#4D7C0F",
  // 3X1 (agosto/2026)
  ALPHA: "#15803D", BRAVO: "#B91C1C", CHARLIE: "#1D4ED8", DELTA: "#B45309",
}

// ─────────────────────────────────────────────────────────────
//  Dois regimes, uma função
//
//  Agosto/2026 foi de 3X1 (4 grupos). Setembro/2026 VOLTOU para a 7X1 de 8
//  grupos — fonte: "MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · SETEMBRO/2026" e
//  "ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO - ESCALA 7X1 ·
//  SETEMBRO/2026" (1ª CIA, 1º Ten Tenório).
//
//  A virada é 01/09/2026. Antes disso vale a 3X1; de lá em diante, a 7X1.
// ─────────────────────────────────────────────────────────────
const INICIO_7X1_UTC = Date.UTC(2026, 8, 1) // 01/09/2026

// 7X1 — referência: 01/09/2026 (Ter) = ÍNDIA (índice 2). Conferida contra os 30
// dias do mês na escala diária: bate em todos, inclusive 07/09 = GOLF,
// 23/09 = GOLF e 30/09 = NOVEMBER.
// (Confere também com a referência antiga de 26/05/2026 = GOLF: 98 dias de
// diferença, 98 mod 8 = 2 = ÍNDIA. O ciclo de 8 dias nunca se perdeu por baixo;
// agosto foi uma sobreposição.)
const REF_7X1_UTC = Date.UTC(2026, 8, 1)
const REF_7X1_IDX = 2 // ÍNDIA

// 3X1 — referência: 25/08/2026 (Ter) = BRAVO (índice 1).
const REF_3X1_UTC = Date.UTC(2026, 7, 25)
const REF_3X1_IDX = 1 // BRAVO

function ciclico<T extends readonly string[]>(grupos: T, refUTC: number, refIdx: number, dataUTC: number): T[number] {
  const dias = Math.floor((dataUTC - refUTC) / 86_400_000)
  const n = grupos.length
  return grupos[(((refIdx + dias) % n) + n) % n]
}

export function grupoPlantaoPorData(data: Date): GrupoPlantao {
  const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  return dataUTC >= INICIO_7X1_UTC
    ? ciclico(GRUPOS_7X1, REF_7X1_UTC, REF_7X1_IDX, dataUTC)
    : ciclico(GRUPOS_3X1, REF_3X1_UTC, REF_3X1_IDX, dataUTC)
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

// Composição dos grupos de plantão — escala 7X1, SETEMBRO/2026 (vigente).
// Transcrita do "MAPA DE DIVISÃO DAS EQUIPES DE PLANTÃO DA 1ª COMPANHIA -
// ESCALA 7X1 · PERÍODO: SETEMBRO/2026" (1ª CIA, 1º Ten Tenório), filtrando as
// 34 matrículas da Turma 13 das 26 linhas × 8 colunas da companhia inteira.
//
// Ao contrário do mapa 3X1 de agosto, este traz 108 LISANDRY explicitamente
// (ÍNDIA, linha 14). Seguem de fora só 211 DÁRIO e 213 R SILVA.
//
// Obs. do documento: 105 LUCAS EDUARDO é adventista — os plantões de sexta dele
// vão para quinta, e os de sábado para domingo.
export const MEMBROS_7X1: Record<Grupo7x1, { mat: number; nome: string }[]> = {
  GOLF:     [{ mat: 7,   nome: "ALDO SILVA" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 57,  nome: "CLEYTON" }, { mat: 143, nome: "VIDAL" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
  HOTEL:    [{ mat: 13,  nome: "JONAS" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 144, nome: "SAMUEL SANTOS" }],
  INDIA:    [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 108, nome: "LISANDRY" }, { mat: 116, nome: "BERTIPALHA" }],
  JULIETT:  [{ mat: 94,  nome: "ANDRÉ CARDOSO" }, { mat: 153, nome: "HUGO" }],
  KILO:     [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }, { mat: 212, nome: "CAMILA BUONORA" }],
  LIMA:     [{ mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 174, nome: "ALEXANDRE" }, { mat: 186, nome: "SAMUEL SILVA" }],
  MIKE:     [{ mat: 45,  nome: "GABRIELE COSTA" }, { mat: 81,  nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 165, nome: "KEVIN GOMES" }],
  NOVEMBER: [{ mat: 55,  nome: "SHIRLAYNE" }, { mat: 71,  nome: "LEIMIG" }, { mat: 76,  nome: "ARAÚJO JR" }],
}

// Composição da 3X1 — agosto/2026. Mantida para os dias daquele mês (a semana
// 34 do portal começa em 31/08) continuarem mostrando a equipe certa.
export const MEMBROS_3X1: Record<Grupo3x1, { mat: number; nome: string }[]> = {
  ALPHA:   [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 94,  nome: "ANDRÉ CARDOSO" }, { mat: 108, nome: "LISANDRY" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 153, nome: "HUGO" }],
  BRAVO:   [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 167, nome: "GUSTAVO NETO" }, { mat: 174, nome: "ALEXANDRE" }, { mat: 186, nome: "SAMUEL SILVA" }, { mat: 212, nome: "CAMILA BUONORA" }],
  CHARLIE: [{ mat: 45,  nome: "GABRIELE COSTA" }, { mat: 55,  nome: "SHIRLAYNE" }, { mat: 71,  nome: "LEIMIG" }, { mat: 76,  nome: "ARAÚJO JR" }, { mat: 81,  nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 165, nome: "KEVIN GOMES" }],
  DELTA:   [{ mat: 7,   nome: "ALDO SILVA" }, { mat: 13,  nome: "JONAS" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 57,  nome: "CLEYTON" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 143, nome: "VIDAL" }, { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
}

// Os dois regimes juntos: `grupoPlantaoPorData` devolve nome de 3X1 para agosto
// e de 7X1 daí em diante, então quem procura a equipe do dia precisa dos 12.
export const MEMBROS_PLANTAO: Record<GrupoPlantao, { mat: number; nome: string }[]> = {
  ...MEMBROS_7X1,
  ...MEMBROS_3X1,
}

// Alunos da Turma 13 ainda sem equipe no mapa da 1ª CIA (também ausentes do
// mapa 7X1 de setembro). Não chutar: esperar a 1ª CIA publicar.
export const SEM_EQUIPE_PLANTAO = [211, 213] as const
