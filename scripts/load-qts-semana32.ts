import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 32

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 17/08","Ter 18/08","Qua 19/08","Qui 20/08","Sex 21/08","Sáb 22/08","Dom 23/08"]

// Fonte: "QTS do CFO PM 2024.3 — QTS SEMANA 32 (TURMA 13) PARA OS ALUNOS.pdf",
// emitido pela Divisão de Ensino da APMP em 17/08/2026 (semana de 17 a 23/08/2026).
// Diferente das semanas anteriores, este QTS traz o CONTADOR OFICIAL de tempos por
// disciplina (ex.: "POE 7/60"), o que permite sincronizar a carga de forma ABSOLUTA
// em vez de incremental.
//
// O bloco da noite (17h30 e 18h20) sai desalinhado na extração de texto do PDF; a
// atribuição por dia foi resolvida pela ordem crescente dos contadores oficiais:
//   Seg noite = EASPE 11/30 e 12/30 (vem depois de EASPE 9,10 da tarde de segunda)
//   Qua noite = TPE   9/40 e 10/40  (vem depois de TPE 7,8 da tarde de quarta)
//   Qui noite = TCEM 33/40 e 34/40  (vem depois de TCEM 31,32 da tarde de quinta)
//   Ter e Sex não têm aula à noite.
//
// Siglas do QTS → banco: EASPE → EASE · DPPPM → DPPM · "TFM - II" → TFM2.
const grade: Record<string, string[]> = {
  "Seg 17/08": ["", "POE","POE",   "EASE","EASE",     "POE","POE",   "EASE","EASE",   "EASE","EASE"],
  "Ter 18/08": ["", "TFM2","TFM2", "POE","POE",       "TPE","TPE",   "DPPM","DPPM",   "",""],
  "Qua 19/08": ["", "AP","AP",     "POE","POE",       "AP","AP",     "TPE","TPE",     "TPE","TPE"],
  "Qui 20/08": ["", "GC","GC",     "TFM2","TFM2",     "AP","AP",     "TCEM","TCEM",   "TCEM","TCEM"],
  "Sex 21/08": ["", "DPPM","DPPM", "GC","GC",         "EASE","EASE", "PE","PE",       "",""],
  "Sáb 22/08": ["","","","","","","","","","",""],
  "Dom 23/08": ["","","","","","","","","","",""],
}

// Contador OFICIAL do QTS ao fim da semana 32 (último "X/Y" de cada disciplina).
// Prevalece sobre o acumulado do portal — é o número que a Divisão de Ensino usa.
const OFICIAL: Record<string, { antes: number; depois: number }> = {
  POE:  { antes: 6,  depois: 14 },  // 7/60 … 14/60
  EASE: { antes: 6,  depois: 14 },  // EASPE 7/30 … 14/30
  TFM2: { antes: 40, depois: 44 },  // TFM-II 41/60 … 44/60
  TPE:  { antes: 4,  depois: 10 },  // 5/40 … 10/40
  DPPM: { antes: 24, depois: 28 },  // DPPPM 25/60 … 28/60
  AP:   { antes: 28, depois: 34 },  // 29/50 … 34/50
  TCEM: { antes: 30, depois: 34 },  // 31/40 … 34/40
  GC:   { antes: 16, depois: 20 },  // 17/30 … 20/30
  PE:   { antes: 0,  depois: 2  },  // 1/20 … 2/20
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  const tempos: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const s of slots) if (s) tempos[s] = (tempos[s] || 0) + 1
  }

  console.log("\n── Conferência do portal contra o QTS oficial ──")
  for (const [sigla, { antes, depois }] of Object.entries(OFICIAL)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    const desvio = disc.cargaMinistrada - antes
    const marca = desvio === 0 ? "ok " : desvio > 0 ? "▲  " : "▼  "
    const nota = desvio === 0 ? "" : ` (portal estava ${desvio > 0 ? "+" : ""}${desvio}h)`

    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })

    console.log(`  ${marca}${sigla.padEnd(5)} antes ${String(disc.cargaMinistrada).padStart(2)}h → QTS ${String(antes).padStart(2)}h  +${tempos[sigla] ?? 0}h  ⇒  ${depois}/${disc.cargaTotal}h ${status}${nota}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada/total*100)}%)`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
