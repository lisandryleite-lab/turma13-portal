/**
 * Carrega as escalas de SETEMBRO/2026 e o QTS da semana corrente.
 *
 * Fontes (1ª CIA, 1º Ten Tenório — SEI):
 *   • MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · SETEMBRO/2026 (atualizada)
 *   • ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO - 7X1 · SETEMBRO/2026
 *   • ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · SETEMBRO/2026
 *   • ESCALA 1ª COMPANHIA - FUNÇÕES NAS FORMATURAS GERAIS (guarda-bandeira)
 *   • Foto do QTS "SEMANA 33" (31/08 a 06/09/2026)
 *
 * Idempotente: pode rodar de novo sem duplicar.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MEMBROS_7X1, SEM_EQUIPE_PLANTAO } from "../lib/escalas"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// ── 1. Grupo de plantão de cada aluno (User.grupoPlantao) ────────────────
// Agosto era 3X1 (ALPHA..DELTA); setembro voltou para a 7X1 (GOLF..NOVEMBER),
// então o campo que o dashboard mostra em "Seus Dados" está desatualizado.

// ── 2. Funções nas formaturas matinais ───────────────────────────────────
// Colunas do documento: MESTRE DE CERIMÔNIA | LEITOR DE BI | DISCURSO AO CFO |
// COMANDANTE DA 1ª CIA. Matrículas da 1ª CIA inteira, não só da Turma 13 — é a
// formatura da companhia, e o portal resolve o nome de quem estiver cadastrado.
// Sem entradas em 05,06,07,12,13,19,20,26,27 (fins de semana e 07/09).
const FUNCOES: Array<[string, number, number, number, number]> = [
  // [data, Mestre, Leitor, Discurso, Comandante]
  ["2026-09-01", 157, 38, 41, 48],
  ["2026-09-02", 128, 130, 141, 145],
  ["2026-09-03", 198, 202, 212, 20],
  ["2026-09-04", 203, 207, 217, 4],
  ["2026-09-08", 144, 147, 154, 170],
  ["2026-09-09", 56, 67, 60, 63],
  ["2026-09-10", 150, 153, 158, 161],
  ["2026-09-11", 26, 37, 58, 61],
  ["2026-09-14", 10, 18, 22, 55],
  ["2026-09-15", 111, 143, 159, 184],
  ["2026-09-16", 195, 200, 206, 9],
  ["2026-09-17", 59, 70, 78, 90],
  ["2026-09-18", 163, 173, 181, 190],
  ["2026-09-21", 214, 64, 84, 87],
  ["2026-09-22", 31, 76, 79, 92],
  ["2026-09-23", 191, 196, 197, 199],
  ["2026-09-24", 13, 21, 23, 24],
  ["2026-09-25", 102, 108, 116, 118],
  ["2026-09-28", 14, 40, 49, 50],
  ["2026-09-29", 73, 81, 88, 97],
  ["2026-09-30", 52, 71, 110, 115],
]

// ── 3. Guarda-bandeira do 1º Pelotão — 16/09 (quarta) ────────────────────
// Único dia do 1º Pelotão em setembro. Vai como Aviso porque
// FuncaoDestaqueDia tem @@unique([data, funcao]) e aqui são 8 "Guarda".
const GUARDA_DATA = "16/09/2026 (quarta-feira)"
const GUARDA: Array<[number, string, string]> = [
  [165, "KEVIN GOMES", "Pavilhão Nacional"],
  [114, "JOSIANE FARIAS", "Comandante da Guarda de Honra"],
  [71, "LEIMIG", "Bandeira de Pernambuco"],
  [76, "ARAÚJO JÚNIOR", "Bandeira da Confederação do Equador"],
  [94, "ANDRÉ CARDOSO", "Bandeira da APMP"],
  [57, "CLEYTON", "Porta-flâmula"],
  [23, "RODOLFO MOURA", "Guarda"],
  [37, "PABLO TORRES", "Guarda"],
  [41, "ALAN SILVA", "Guarda"],
  [45, "GABRIELE COSTA", "Guarda"],
  [60, "JOÃO NUNES", "Guarda"],
  [98, "JOSÉ MENEZES", "Guarda"],
  [105, "LUCAS EDUARDO", "Guarda"],
  [108, "LISANDRY", "Guarda"],
]

// ── 4. QTS da semana 31/08 a 06/09 ───────────────────────────────────────
// O documento oficial rotula esta semana como "SEMANA 33", mas a contagem do
// portal (DATA_INICIO = 12/01/2026) põe 31/08–06/09 na SEMANA 34 — a semana 33
// do portal é 24–30/08, que já está carregada. Gravado sob o número do PORTAL,
// senão o dashboard (que lê semanaAtual()) não acha a semana corrente.
const SEMANA_PORTAL = 34

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]
const DIAS = ["Seg 31/08","Ter 01/09","Qua 02/09","Qui 03/09","Sex 04/09","Sáb 05/09","Dom 06/09"]

// Cada dia da foto tem DUAS subcolunas: a da ESQUERDA é a Turma 13, a da
// direita é a Turma 14 (as duas se revezam nas mesmas matérias).
// Siglas da foto → banco: INTSIP → INTSISP, EASPE → EASE.
// Quarta 10h-11h40 tinha POE RISCADO no documento (aula cancelada) → vazio.
const grade: Record<string, string[]> = {
  "Seg 31/08": ["", "INTSISP","INTSISP", "POE","POE",   "EASE","EASE", "PE","PE",   "PE","PE"],
  "Ter 01/09": ["", "PJM","PJM",         "PJM","PJM",   "AM","AM",     "AM","AM",   "",""],
  "Qua 02/09": ["", "POE","POE",         "","",         "TCEM","TCEM", "GC","GC",   "",""],
  "Qui 03/09": ["", "","",               "","",         "AP","AP",     "PE","PE",   "PE","PE"],
  "Sex 04/09": ["", "EPCR","EPCR",       "TFM2","TFM2", "PE","PE",     "AP","AP",   "AP","AP"],
  "Sáb 05/09": ["","","","","","","","","","",""],
  "Dom 06/09": ["","","","","","","","","","",""],
}

async function main() {
  // 1. grupoPlantao ------------------------------------------------------
  console.log("── 1. Grupo de plantão (3X1 → 7X1) ──")
  let mudou = 0
  for (const [grupo, membros] of Object.entries(MEMBROS_7X1)) {
    for (const { mat } of membros) {
      const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
      if (!u) { console.log(`   ⚠ matrícula ${mat} não existe no banco`); continue }
      if (u.grupoPlantao !== grupo) {
        await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: grupo } })
        console.log(`   ${String(mat).padStart(3)} ${String(u.grupoPlantao ?? "—").padEnd(8)} → ${grupo}`)
        mudou++
      }
    }
  }
  for (const mat of SEM_EQUIPE_PLANTAO) {
    const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
    if (u?.grupoPlantao != null) {
      await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: null } })
      console.log(`   ${String(mat).padStart(3)} ${u.grupoPlantao} → (sem equipe no mapa de setembro)`)
      mudou++
    }
  }
  console.log(`   ${mudou} alteração(ões)\n`)

  // 2. funções de destaque ----------------------------------------------
  console.log("── 2. Funções nas formaturas (setembro) ──")
  const PAPEIS = ["Mestre", "Leitor", "Discurso", "Comandante"] as const
  let criadas = 0, atualizadas = 0
  for (const [iso, ...mats] of FUNCOES) {
    const data = new Date(`${iso}T12:00:00.000Z`)
    for (let i = 0; i < PAPEIS.length; i++) {
      const funcao = PAPEIS[i]
      const matricula = mats[i]
      const existe = await prisma.funcaoDestaqueDia.findUnique({ where: { data_funcao: { data, funcao } } })
      await prisma.funcaoDestaqueDia.upsert({
        where: { data_funcao: { data, funcao } },
        update: { matricula },
        create: { data, funcao, matricula },
      })
      if (existe) atualizadas++; else criadas++
    }
  }
  console.log(`   ${criadas} criadas, ${atualizadas} atualizadas (${FUNCOES.length} datas × ${PAPEIS.length})\n`)

  // 3. guarda-bandeira ---------------------------------------------------
  console.log("── 3. Guarda-bandeira do 1º Pelotão ──")
  const destaques = GUARDA.filter(g => g[2] !== "Guarda")
  const guardas = GUARDA.filter(g => g[2] === "Guarda")
  const corpo = [
    `O 1º Pelotão (Turma 13) faz a guarda-bandeira da formatura geral em ${GUARDA_DATA}.`,
    "",
    ...destaques.map(([mat, nome, funcao]) => `• ${funcao}: ${mat} ${nome}`),
    "",
    `• Guarda: ${guardas.map(([mat, nome]) => `${mat} ${nome}`).join(", ")}`,
    "",
    "Fonte: ESCALA 1ª COMPANHIA — FUNÇÕES NAS FORMATURAS GERAIS, setembro/2026.",
  ].join("\n")

  const TITULO = "Guarda-bandeira — 16/09 (1º Pelotão)"
  const jaExiste = await prisma.aviso.findFirst({ where: { titulo: TITULO } })
  if (jaExiste) {
    await prisma.aviso.update({ where: { id: jaExiste.id }, data: { corpo, fixado: true, destaque: true } })
    console.log(`   aviso atualizado (${GUARDA.length} militares)\n`)
  } else {
    await prisma.aviso.create({ data: { titulo: TITULO, corpo, fixado: true, destaque: true } })
    console.log(`   aviso criado (${GUARDA.length} militares)\n`)
  }

  // 4. QTS ---------------------------------------------------------------
  console.log("── 4. QTS 31/08–06/09 ──")
  const siglas = new Set(Object.values(grade).flat().filter(Boolean))
  for (const s of siglas) {
    const d = await prisma.disciplina.findUnique({ where: { sigla: s } })
    if (!d) console.log(`   ⚠ sigla ${s} não existe em Disciplina`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA_PORTAL },
    update: { dados },
    create: { semana: SEMANA_PORTAL, dados },
  })
  const tempos: Record<string, number> = {}
  for (const slots of Object.values(grade)) for (const s of slots) if (s) tempos[s] = (tempos[s] || 0) + 1
  console.log(`   QTS da semana ${SEMANA_PORTAL} salvo (rotulado "SEMANA 33" no documento oficial)`)
  console.log(`   Tempos: ${Object.entries(tempos).map(([k, v]) => `${k} ${v}h`).join(", ")}`)
  console.log(`   cargaMinistrada NÃO alterada — a foto do QTS não traz o contador X/Y.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
