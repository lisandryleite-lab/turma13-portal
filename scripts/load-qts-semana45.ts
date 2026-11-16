import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 45

// Folha DEIP/APMP "HORÁRIO DE AULA SEMANAL - TURMA 13", semana 45 (16 a 22/11/2026):
// manhã, tarde e noite em 13 faixas, igual às semanas 43 e 44.
const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20",
  "18h00-18h50","18h50-19h40","20h00-20h50","20h50-21h40",
]

const DIAS = ["Seg 16/11","Ter 17/11","Qua 18/11","Qui 19/11","Sex 20/11","Sáb 21/11","Dom 22/11"]

// Siglas da folha → banco: TDPV → TDV.
// seg. e ter.: TDV o dia todo (07h00 às 20h50), 13 a 36/36 — marca 📄 em 33–36 (ter. tarde/noite).
// qua.: AE 41 a 50/50 (marca 📄 "2" em 47–50). qui. e sex.: PU 21 a 40/40
// (marca 📄 "1" em 21–24, qui. manhã; marca 📄 "2" em 37–40, sex. tarde/noite).
// Sábado 21/11 e domingo 22/11 sem aula.
const TDV12 = ["TDV","TDV","TDV", "TDV","TDV", "TDV","TDV", "TDV","TDV", "TDV","TDV", "TDV",""]
const grade: Record<string, string[]> = {
  "Seg 16/11": TDV12,
  "Ter 17/11": TDV12,
  "Qua 18/11": ["", "AE","AE",   "AE","AE",   "AE","AE",   "AE","AE",   "AE","AE",   "",""],
  "Qui 19/11": ["", "PU","PU",   "PU","PU",   "PU","PU",   "PU","PU",   "PU","PU",   "",""],
  "Sex 20/11": ["", "PU","PU",   "PU","PU",   "PU","PU",   "PU","PU",   "PU","PU",   "",""],
  "Sáb 21/11": new Array(HORARIOS.length).fill(""),
  "Dom 22/11": new Array(HORARIOS.length).fill(""),
}

// Último contador de cada disciplina na folha — carga ABSOLUTA ao fim da semana.
// As três disciplinas fecham a carga total nesta semana.
const FIM_45: Record<string, number> = { TDV: 36, AE: 50, PU: 40 }

async function main() {
  for (const [dia, aulas] of Object.entries(grade)) {
    if (aulas.length !== HORARIOS.length) throw new Error(`${dia}: ${aulas.length} faixas, esperado ${HORARIOS.length}`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({ where: { semana: SEMANA }, update: { dados }, create: { semana: SEMANA, dados } })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias, ${HORARIOS.length} faixas).`)

  console.log(`\n── Carga ao fim da semana ${SEMANA} (contadores da folha) ──`)
  for (const [sigla, fim] of Object.entries(FIM_45)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const depois = Math.min(fim, disc.cargaTotal)
    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })
    console.log(`  ${status === "Concluída" ? "✔" : "•"} ${sigla.padEnd(5)} ${disc.cargaMinistrada}h → ${depois}/${disc.cargaTotal}h  ${status}`)
  }
  console.log(" ⚠ Lançado como PREVISTO: a carga é a do fim da semana.")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
