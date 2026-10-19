import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 41

// Três faixas a mais no fim: na seg. 19/10 a aula de QAGV vai das 18h20 até 21h40.
const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
  "19h10-20h00","20h00-20h50","20h50-21h40",
]

const DIAS = ["Seg 19/10","Ter 20/10","Qua 21/10","Qui 22/10","Sex 23/10","Sáb 24/10","Dom 25/10"]

// Transcrito do QTS mestre — Turma 13 (coluna da ESQUERDA de cada dia), semana de
// 19/10 a 25/10/2026, com a mesma convenção da semana 36:
// 07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 · 10h00 às 11h40 → idx3,4 ·
// 13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 · 18h20 às 19h10 → idx10.
// idx9 (17h30–18h20) não aparece na folha — fica vago.
// Seg 19/10: QAGV das 18h20 às 21h40 (idx10 a idx13), avisado pela turma.
// Siglas da folha → banco: DPPPM → DPPM · UDFIT → UDF.
// Sáb 24/10 e Dom 25/10 sem aula.
// Sem contador X/Y nesta folha: a carga das disciplinas NÃO é mexida aqui.
const grade: Record<string, string[]> = {
  "Seg 19/10": ["", "TPE","TPE", "TPE","TPE", "TPE","TPE", "TPE","TPE", "", "QAGV", "QAGV","QAGV","QAGV"],
  "Ter 20/10": ["", "TP","TP",   "TP","TP",   "AE","AE",   "AE","AE",   "", "AE",   "","",""],
  "Qua 21/10": ["", "AE","AE",   "AE","AE",   "TCC","TCC", "TCC","TCC", "", "DPPM", "","",""],
  "Qui 22/10": ["", "UDF","UDF", "UDF","UDF", "UDF","UDF", "UDF","UDF", "", "UDF",  "","",""],
  "Sex 23/10": ["", "TCC","TCC", "TCC","TCC", "TP","TP",   "TP","TP",   "", "",     "","",""],
  "Sáb 24/10": new Array(HORARIOS.length).fill(""),
  "Dom 25/10": new Array(HORARIOS.length).fill(""),
}

async function main() {
  for (const [dia, aulas] of Object.entries(grade)) {
    if (aulas.length !== HORARIOS.length) throw new Error(`${dia}: ${aulas.length} faixas, esperado ${HORARIOS.length}`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias, ${HORARIOS.length} faixas).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
