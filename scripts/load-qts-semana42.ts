import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 42

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 26/10","Ter 27/10","Qua 28/10","Qui 29/10","Sex 30/10","Sáb 31/10","Dom 01/11"]

// Transcrito do QTS mestre — Turma 13 (coluna da ESQUERDA de cada dia), semana de
// 26/10 a 01/11/2026, com a convenção da semana 36:
// 07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 · 10h00 às 11h40 → idx3,4 ·
// 13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 · 18h20 às 19h10 → idx10.
// idx9 (17h30–18h20) não aparece na folha — fica vago.
// Siglas da folha → banco: ABA → ABAA · DPPPM → DPPM · UDFIT → UDF.
// O ABA riscado na qua. 28/10 está na coluna da direita — não é da Turma 13.
// Sáb 31/10 sem aula; DOMINGO 01/11 com AE à tarde e às 18h20.
const grade: Record<string, string[]> = {
  "Seg 26/10": ["", "ABAA","ABAA", "ABAA","ABAA", "ABAA","ABAA", "","",       "", ""],
  "Ter 27/10": ["", "TP","TP",     "TP","TP",     "AV","AV",     "AV","AV",   "", "AV"],
  "Qua 28/10": ["", "UDF","UDF",   "UDF","UDF",   "UDF","UDF",   "UDF","UDF", "", "UDF"],
  "Qui 29/10": ["", "PJM","PJM",   "PJM","PJM",   "TP","TP",     "TP","TP",   "", ""],
  "Sex 30/10": ["", "QAGV","QAGV", "PJM","PJM",   "DPPM","DPPM", "","",       "", ""],
  "Sáb 31/10": new Array(HORARIOS.length).fill(""),
  "Dom 01/11": ["", "","",         "","",         "AE","AE",     "AE","AE",   "", "AE"],
}

// Sem contador X/Y nesta folha: a carga é somada pela grade (1 faixa = 1h) sobre
// o que estava no banco ao fim da semana 41, gravando de forma ABSOLUTA (rodar de
// novo não soma). DPPM partia de 44h (ajustada no portal depois da semana 41).
const ANTES_42: Record<string, number> = {
  ABAA: 8, TP: 40, AV: 28, UDF: 19, PJM: 34, QAGV: 18, DPPM: 44, AE: 33,
}
// Encerradas informadas pela turma: TPE fechou as 40h (a semana 41 deixou 38h
// previstas) e QAGV termina nesta semana — bate com a grade (18h + 2h = 20h).
const CONCLUIDAS = ["TPE"]

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

  const horas: Record<string, number> = {}
  for (const aulas of Object.values(grade)) for (const s of aulas) if (s) horas[s] = (horas[s] ?? 0) + 1

  console.log("\n── Carga ao fim da semana 42 (somada pela grade) ──")
  for (const [sigla, h] of Object.entries(horas)) {
    const antes = ANTES_42[sigla]
    if (antes === undefined) throw new Error(`${sigla} sem carga de referência em ANTES_42`)
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const depois = Math.min(antes + h, disc.cargaTotal)
    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })
    const sobra = antes + h > disc.cargaTotal ? `  ⚠ grade passa do total em ${antes + h - disc.cargaTotal}h` : ""
    console.log(`  ${status === "Concluída" ? "✔" : "•"} ${sigla.padEnd(5)} ${antes}h +${h} → ${depois}/${disc.cargaTotal}h  ${status}${sobra}`)
  }
  for (const sigla of CONCLUIDAS) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: disc.cargaTotal, status: "Concluída" } })
    console.log(`  ✔ ${sigla.padEnd(5)} ${disc.cargaMinistrada}h → ${disc.cargaTotal}/${disc.cargaTotal}h  Concluída (informado pela turma)`)
  }
  console.log(" ⚠ Lançado como PREVISTO: a semana ainda está em curso.")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
