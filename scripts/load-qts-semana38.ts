import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 38

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 28/09","Ter 29/09","Qua 30/09","Qui 01/10","Sex 02/10","Sáb 03/10","Dom 04/10"]

// Transcrito da folha oficial "HORÁRIO DE AULA SEMANAL - TURMA 13" (quadro de
// cima; o de baixo é a Turma 14), semana de 28/09 a 04/10/2026.
// A 1ª versão deste script veio do QTS mestre de duas sub-colunas e errou três
// faixas (ter. tarde estava QAGV, qua. manhã estava TPE, faltava o AE das 17h30
// de qui.) — corrigido aqui pela folha da Turma 13, que traz o contador X/Y.
// As 11 colunas da folha batem uma a uma com HORARIOS.
// Siglas da folha → banco: DPPPM → DPPM · TFM - II → TFM2.
// Sáb 03/10 e Dom 04/10 sem aula.
const grade: Record<string, string[]> = {
  "Seg 28/09": ["", "EPCR","EPCR", "PJM","PJM",   "DPPM","DPPM", "PE","PE",     "",""],
  "Ter 29/09": ["", "TP","TP",     "TP","TP",     "TPE","TPE",   "TPE","TPE",   "",""],
  "Qua 30/09": ["", "QAGV","QAGV", "QAGV","QAGV", "PJM","PJM",   "EPCR","EPCR", "",""],
  "Qui 01/10": ["", "AE","AE",     "TFM2","TFM2", "PE","PE",     "AE","AE",     "AE","AE"],
  "Sex 02/10": ["", "TCC","TCC",   "TCC","TCC",   "TP","TP",     "TP","TP",     "",""],
  "Sáb 03/10": ["","","","","","","","","","",""],
  "Dom 04/10": ["","","","","","","","","","",""],
}

// Contador oficial ao fim da semana 38, gravado de forma ABSOLUTA. Só entram as
// disciplinas que NÃO voltam na semana 39 — as demais (PJM, TP, PE, AE, QAGV,
// TFM2, TCC) já têm a carga definida pelo contador da 39, mais recente; regravar
// o valor da 38 aqui faria a carga andar para trás.
// EPCR: a folha conta 19/20 … 22/20, passando do total — fica capada em 20.
const CONTADOR_38: Record<string, number> = {
  EPCR: 22,  // 19/20 … 22/20 (seg 2 + qua 2)
  DPPM: 34,  // DPPPM 33/60 … 34/60 (seg 2)
  TPE:  24,  // 21/40 … 24/40 (ter 4)
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  console.log("\n── Carga ao fim da semana 38, pelo contador oficial ──")
  for (const [sigla, contador] of Object.entries(CONTADOR_38)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const nova = Math.min(disc.cargaTotal, contador)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    const capada = contador > disc.cargaTotal ? `  (folha diz ${contador}/${disc.cargaTotal} — capada)` : ""
    console.log(`  ${status === "Concluída" ? "✔" : "•"} ${sigla.padEnd(6)} ${String(disc.cargaMinistrada).padStart(2)}h → ${nova}/${disc.cargaTotal}h  ${status}${capada}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const encerradas = todas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0).length
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada / total * 100)}%) · ${encerradas}/${todas.length} encerradas`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
