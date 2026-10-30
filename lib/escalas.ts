// ─────────────────────────────────────────────────────────────
//  Cálculos automáticos de escalas — Turma 13 CFO PM 2026
// ─────────────────────────────────────────────────────────────

// Converte "YYYY-MM-DD" em Date de meia-noite LOCAL — nunca usar `new Date(string)`
// direto com uma data-only string: o JS interpreta como UTC e, em fuso negativo,
// `.getDate()` depois volta um dia (mesmo problema já registrado em calendarioFaxinaMes).
import { mesDaData } from "./escalas-cia"

export function parseDataLocal(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
}

// Matrícula ordenada por antiguidade (menor = mais antigo) — 31 alunos da Turma 13
// (1 HELLTON FERNANDES e 54 ELDER CARVALHO saíram em jun/2026; em out/2026 saíram
// 211 DÁRIO e 213 R SILVA, que deixaram a CIA, e 212 CAMILA BUONORA, que é do 7º Pelotão)
export const MATRICULAS_ORDEM = [
  7, 13, 19, 23, 26, 37, 41, 45, 55, 57, 60, 65,
  71, 76, 81, 94, 98, 105, 106, 108, 114, 116, 131, 143,
  144, 153, 165, 167, 174, 186, 191,
]

// Rodízio de P1/P3/P4: anda UMA posição por semana (quem é P4 vira P3 e depois
// P1) e, ao chegar no fim da lista, volta ao começo.
// Out/2026: a xerifância passou a seguir a mesma antiguidade (13 JONAS na semana
// 40, 19 THAIS na 41…) e os dois rodízios coincidiam — o mesmo aluno acumulava
// xerife e P1/P3/P4. A escala de funções foi ADIANTADA 3 semanas (o que seria a
// semana 43 passou para a 40): semana 40 → P1=23 RODOLFO MOURA, P3=26 ANDRÉ,
// P4=37 PABLO TORRES. Assim cada aluno faz P4 → P3 → P1 em semanas seguidas,
// folga uma semana e só então é xerife — nunca duas funções na mesma semana.
const REF_SEMANA = 40
const REF_P1_IDX = MATRICULAS_ORDEM.indexOf(23)

export function calcularServico(semana: number): {
  p1: number | null
  p3: number | null
  p4: number | null
} {
  const n = MATRICULAS_ORDEM.length
  const base = REF_P1_IDX + (semana - REF_SEMANA)
  const get = (i: number) => MATRICULAS_ORDEM[(((base + i) % n) + n) % n]
  return { p1: get(0), p3: get(1), p4: get(2) }
}

// Xerife previsto — segue a antiguidade de MATRICULAS_ORDEM, uma semana cada.
// Referência: semana 40 (13/10/2026) = 13 JONAS, xerife em exercício.
const REF_XERIFE_SEMANA = 40
const REF_XERIFE_IDX = MATRICULAS_ORDEM.indexOf(13)

export function calcularXerife(semana: number): number {
  const n = MATRICULAS_ORDEM.length
  return MATRICULAS_ORDEM[(((REF_XERIFE_IDX + semana - REF_XERIFE_SEMANA) % n) + n) % n]
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
// Novembro/2026 em diante: plantão por pelotão (1º ao 6º, seg a sex). A Turma 13
// inteira é o 1º Pelotão — os demais só aparecem como "pelotão do dia".
export const PELOTOES = ["1º PEL", "2º PEL", "3º PEL", "4º PEL", "5º PEL", "6º PEL", "7º PEL"] as const
export type GrupoPelotao = typeof PELOTOES[number]
export type GrupoPlantao = Grupo7x1 | Grupo3x1 | GrupoPelotao

// O que as telas listam = o regime vigente.
export const GRUPOS_PLANTAO: readonly GrupoPlantao[] = ["1º PEL"]

// Cor por grupo de plantão — fonte única (evita paletas divergentes entre telas)
export const CORES_PLANTAO: Record<string, string> = {
  // 7X1 (vigente)
  GOLF: "#15803D", HOTEL: "#B91C1C", INDIA: "#1D4ED8", JULIETT: "#B45309",
  KILO: "#7E22CE", LIMA: "#0F766E", MIKE: "#BE185D", NOVEMBER: "#4D7C0F",
  // 3X1 (agosto/2026)
  ALPHA: "#15803D", BRAVO: "#B91C1C", CHARLIE: "#1D4ED8", DELTA: "#B45309",
  // Pelotões (novembro/2026)
  "1º PEL": "#15803D", "2º PEL": "#B91C1C", "3º PEL": "#1D4ED8", "4º PEL": "#B45309",
  "5º PEL": "#7E22CE", "6º PEL": "#0F766E", "7º PEL": "#BE185D",
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
// A partir de novembro/2026 o plantão é por pelotão, sem ciclo fixo: só vale a
// tabela do mês publicado em lib/escalas-cia.
const INICIO_PELOTOES_UTC = Date.UTC(2026, 10, 1) // 01/11/2026

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

export function grupoPlantaoPorData(data: Date): GrupoPlantao | null {
  // Mês com escala publicada (lib/escalas-cia): o grupo vem da tabela do
  // documento — outubro/2026, p.ex., tem fins de semana sem plantão e 10/10
  // fora do ciclo. Sem tabela, cai na conta do ciclo.
  const pad = (n: number) => String(n).padStart(2, "0")
  const iso = `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
  const mes = mesDaData(iso)
  if (mes) {
    const dia = mes.plantao.find(p => p.data === iso)
    if (dia) return dia.grupo
  }
  const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  if (dataUTC >= INICIO_PELOTOES_UTC) return null
  return dataUTC >= INICIO_7X1_UTC
    ? ciclico(GRUPOS_7X1, REF_7X1_UTC, REF_7X1_IDX, dataUTC)
    : ciclico(GRUPOS_3X1, REF_3X1_UTC, REF_3X1_IDX, dataUTC)
}

// ─────────────────────────────────────────────────────────────
//  Faxina — "ESCALA SEMANAL DE MANUTENÇÃO DA SALA DE INSTRUÇÃO - TURMA 13"
//  (vigente a partir da semana 40, 12/10/2026). Cinco equipes fixas, uma por
//  dia útil. DOMINGO também tem faxina: as equipes se revezam, começando pela
//  SEGUNDA em 18/10 e seguindo a sequência (TERÇA em 25/10, QUARTA em 01/11…),
//  conforme a obs. do documento.
//  Substituiu o rodízio de 8 grupos (G1–G8) por dia útil.
// ─────────────────────────────────────────────────────────────
export const GRUPOS_FAXINA = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"] as const
export type GrupoFaxina = typeof GRUPOS_FAXINA[number]

const INICIO_FAXINA_SEMANAL = "2026-10-12"

// Primeiro domingo do rodízio (equipe SEGUNDA).
const PRIMEIRO_DOMINGO_UTC = Date.UTC(2026, 9, 18)

function isDiaUtil(d: Date): boolean {
  const dia = d.getDay()
  return dia !== 0 && dia !== 6
}

export function grupoFaxinaPorData(data: Date): GrupoFaxina | null {
  const pad = (n: number) => String(n).padStart(2, "0")
  const iso = `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`
  if (iso < INICIO_FAXINA_SEMANAL) return null
  const dia = data.getDay()
  if (dia >= 1 && dia <= 5) return GRUPOS_FAXINA[dia - 1]
  if (dia === 0) {
    const semanas = Math.round((Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) - PRIMEIRO_DOMINGO_UTC) / (7 * 86_400_000))
    return semanas >= 0 ? GRUPOS_FAXINA[semanas % GRUPOS_FAXINA.length] : null
  }
  return null
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
  grupoPlantao: GrupoPlantao | null
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
      grupoFaxina: grupoFaxinaPorData(dataObj),
      grupoPlantao: grupoPlantaoPorData(dataObj),
    })
  }
  return dias
}

// Composição das equipes de faxina — fallback quando FaxinaGrupoMembro (BD) está vazia.
// Transcrita da "ESCALA SEMANAL DE MANUTENÇÃO DA SALA DE INSTRUÇÃO - TURMA 13" (out/2026).
export const COMPOSICAO_FAXINA: Record<GrupoFaxina, { mat: number; nome: string }[]> = {
  SEGUNDA: [{ mat: 7, nome: "ALDO SILVA" }, { mat: 13, nome: "JONAS" }, { mat: 37, nome: "PABLO TORRES" }, { mat: 23, nome: "RODOLFO MOURA" }, { mat: 153, nome: "HUGO" }, { mat: 26, nome: "ANDRÉ" }, { mat: 174, nome: "ALEXANDRE" }],
  "TERÇA": [{ mat: 19, nome: "THAIS FIGUEIREDO" }, { mat: 41, nome: "ALAN SILVA" }, { mat: 45, nome: "GABRIELE COSTA" }, { mat: 60, nome: "JOÃO NUNES" }, { mat: 186, nome: "SAMUEL SILVA" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 167, nome: "GUSTAVO NETO" }],
  QUARTA: [{ mat: 55, nome: "SHIRLAYNE" }, { mat: 71, nome: "LEIMIG" }, { mat: 65, nome: "KAUHANNI" }, { mat: 76, nome: "ARAÚJO JÚNIOR" }, { mat: 94, nome: "ANDRÉ CARDOSO" }, { mat: 144, nome: "SAMUEL SANTOS" }],
  QUINTA: [{ mat: 81, nome: "FERNANDO ROCHA" }, { mat: 98, nome: "JOSÉ MENEZES" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 57, nome: "CLEYTON" }],
  SEXTA: [{ mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 108, nome: "LISANDRY" }, { mat: 165, nome: "KEVIN GOMES" }, { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 143, nome: "VIDAL" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
}

// Composição dos grupos de plantão — escala 7X1, SETEMBRO/2026 (vigente).
// Transcrita do "MAPA DE DIVISÃO DAS EQUIPES DE PLANTÃO DA 1ª COMPANHIA -
// ESCALA 7X1 · PERÍODO: SETEMBRO/2026" (1ª CIA, 1º Ten Tenório), filtrando as
// matrículas da Turma 13 das 26 linhas × 8 colunas da companhia inteira.
//
// Ao contrário do mapa 3X1 de agosto, este traz 108 LISANDRY explicitamente
// (ÍNDIA, linha 14).
//
// Obs. do documento: 105 LUCAS EDUARDO é adventista — os plantões de sexta dele
// vão para quinta, e os de sábado para domingo.
export const MEMBROS_7X1: Record<Grupo7x1, { mat: number; nome: string }[]> = {
  GOLF:     [{ mat: 7,   nome: "ALDO SILVA" }, { mat: 19,  nome: "THAIS FIGUEIREDO" }, { mat: 57,  nome: "CLEYTON" }, { mat: 143, nome: "VIDAL" }, { mat: 191, nome: "GOMES NASCIMENTO" }],
  HOTEL:    [{ mat: 13,  nome: "JONAS" }, { mat: 23,  nome: "RODOLFO MOURA" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 144, nome: "SAMUEL SANTOS" }],
  INDIA:    [{ mat: 41,  nome: "ALAN SILVA" }, { mat: 60,  nome: "JOÃO NUNES" }, { mat: 108, nome: "LISANDRY" }, { mat: 116, nome: "BERTIPALHA" }],
  JULIETT:  [{ mat: 94,  nome: "ANDRÉ CARDOSO" }, { mat: 153, nome: "HUGO" }],
  KILO:     [{ mat: 26,  nome: "ANDRÉ" }, { mat: 37,  nome: "PABLO TORRES" }, { mat: 65,  nome: "KAUHANNI" }, { mat: 98,  nome: "JOSÉ MENEZES" }],
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
// Pelotões (novembro/2026): a Turma 13 é o 1º Pelotão inteiro; dos outros a
// Turma 13 não guarda composição (fica em lib/escalas-cia, mapa do mês).
export const MEMBROS_PELOTAO: Record<GrupoPelotao, { mat: number; nome: string }[]> = {
  "1º PEL": [
    { mat: 7, nome: "ALDO SILVA" }, { mat: 13, nome: "JONAS" }, { mat: 19, nome: "THAIS FIGUEIREDO" }, { mat: 23, nome: "RODOLFO MOURA" },
    { mat: 26, nome: "ANDRÉ" }, { mat: 37, nome: "PABLO TORRES" }, { mat: 41, nome: "ALAN SILVA" }, { mat: 45, nome: "GABRIELE COSTA" },
    { mat: 55, nome: "SHIRLAYNE" }, { mat: 57, nome: "CLEYTON" }, { mat: 60, nome: "JOÃO NUNES" }, { mat: 65, nome: "KAUHANNI" },
    { mat: 71, nome: "LEIMIG" }, { mat: 76, nome: "ARAÚJO JR" }, { mat: 81, nome: "FERNANDO ROCHA" }, { mat: 94, nome: "ANDRÉ CARDOSO" },
    { mat: 98, nome: "JOSÉ MENEZES" }, { mat: 105, nome: "LUCAS EDUARDO" }, { mat: 106, nome: "RAFAEL RIBEIRO" }, { mat: 108, nome: "LISANDRY" },
    { mat: 114, nome: "JOSIANE FARIAS" }, { mat: 116, nome: "BERTIPALHA" }, { mat: 131, nome: "JOSÉ INÁCIO" }, { mat: 143, nome: "VIDAL" },
    { mat: 144, nome: "SAMUEL SANTOS" }, { mat: 153, nome: "HUGO" }, { mat: 165, nome: "KEVIN GOMES" }, { mat: 167, nome: "GUSTAVO NETO" },
    { mat: 174, nome: "ALEXANDRE" }, { mat: 186, nome: "SAMUEL SILVA" }, { mat: 191, nome: "GOMES NASCIMENTO" },
  ],
  "2º PEL": [], "3º PEL": [], "4º PEL": [], "5º PEL": [], "6º PEL": [], "7º PEL": [],
}

export const MEMBROS_PLANTAO: Record<GrupoPlantao, { mat: number; nome: string }[]> = {
  ...MEMBROS_7X1,
  ...MEMBROS_3X1,
  ...MEMBROS_PELOTAO,
}

// Alunos da Turma 13 ainda sem equipe no mapa da 1ª CIA (também ausentes do
// mapa 7X1 de setembro). Não chutar: esperar a 1ª CIA publicar.
export const SEM_EQUIPE_PLANTAO = [] as const
