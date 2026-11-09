import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 44

// Folha DEIP/APMP "HORÁRIO DE AULA SEMANAL - TURMA 13", semana 44 (09 a 15/11/2026):
// manhã, tarde e noite em 13 faixas, igual à semana 43.
const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20",
  "18h00-18h50","18h50-19h40","20h00-20h50","20h50-21h40",
]

const DIAS = ["Seg 09/11","Ter 10/11","Qua 11/11","Qui 12/11","Sex 13/11","Sáb 14/11","Dom 15/11"]

// Siglas da folha → banco: DPPPM → DPPM · UDFIT → UDF · TDPV → TDV · "À disp. do CA" → "À disp. CA".
// Marcas de prova (📄 "2") na folha: qua. 11/11 POE 53–54 e DPPM 59–60; qui. 12/11 UDF 47–50;
// sex. 13/11 TP 57–60. Sábado 14/11 sem aula; DOMINGO 15/11 com TDV o dia todo (1 a 12/36).
const grade: Record<string, string[]> = {
  "Seg 09/11": ["", "DPPM","DPPM", "DPPM","DPPM", "UDF","UDF",   "UDF","UDF",   "","",       "",""],
  "Ter 10/11": ["", "UDF","UDF",   "UDF","UDF",   "TP","TP",     "TP","TP",     "","",       "",""],
  "Qua 11/11": ["", "POE","POE",   "DPPM","DPPM", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "PU","PU", "PU","PU"],
  "Qui 12/11": ["", "PU","PU",     "PU","PU",     "UDF","UDF",   "UDF","UDF",   "","",       "",""],
  "Sex 13/11": ["", "TP","TP",     "TP","TP",     "PU","PU",     "PU","PU",     "PU","PU",   "",""],
  "Sáb 14/11": new Array(HORARIOS.length).fill(""),
  "Dom 15/11": ["TDV", "TDV","TDV", "TDV","TDV",  "TDV","TDV",   "TDV","TDV",   "TDV","TDV", "TDV",""],
}

// Último contador de cada disciplina na folha — carga ABSOLUTA ao fim da semana.
// DPPM: a folha pula de 56 (seg.) para 59–60 (qua.); a T14 teve 57–58 — vale o documento.
const FIM_44: Record<string, number> = {
  DPPM: 60, UDF: 50, TP: 60, POE: 54, PU: 20, TDV: 12,
}

async function main() {
  for (const [dia, aulas] of Object.entries(grade)) {
    if (aulas.length !== HORARIOS.length) throw new Error(`${dia}: ${aulas.length} faixas, esperado ${HORARIOS.length}`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({ where: { semana: SEMANA }, update: { dados }, create: { semana: SEMANA, dados } })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias, ${HORARIOS.length} faixas).`)

  console.log(`\n── Carga ao fim da semana ${SEMANA} (contadores da folha) ──`)
  for (const [sigla, fim] of Object.entries(FIM_44)) {
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
