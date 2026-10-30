import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 43

// Folha nova (DEIP/APMP, "HORÁRIO DE AULA SEMANAL - TURMA 13", semana 43): manhã,
// tarde e NOITE em 13 faixas — gravadas como estão, sem a convenção de 11 faixas.
const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20",
  "18h00-18h50","18h50-19h40","20h00-20h50","20h50-21h40",
]

const DIAS = ["Seg 02/11","Ter 03/11","Qua 04/11","Qui 05/11","Sex 06/11","Sáb 07/11","Dom 08/11"]

// Siglas da folha → banco: DPPPM → DPPM · UDFIT → UDF · "À disp. do CA" → "À disp. CA".
// Marcas de prova (📄) na folha: sex. 06/11 ABAA 19–20/20 e UDF 37–38 ("1");
// dom. 08/11 AV 49–50 ("2"). Sábado 07/11 sem aula; DOMINGO 08/11 com AV o dia todo.
const grade: Record<string, string[]> = {
  "Seg 02/11": ["", "AE","AE",     "AE","AE",     "DPPM","DPPM", "DPPM","DPPM", "DPPM","DPPM", "",""],
  "Ter 03/11": ["", "UDF","UDF",   "UDF","UDF",   "TP","TP",     "TP","TP",     "POE","POE",   "POE","POE"],
  "Qua 04/11": ["", "POE","POE",   "POE","POE",   "UDF","UDF",   "UDF","UDF",   "AV","AV",     "",""],
  "Qui 05/11": ["", "TP","TP",     "TP","TP",     "POE","POE",   "POE","POE",   "À disp. CA","À disp. CA", "AV","AV"],
  "Sex 06/11": ["", "ABAA","ABAA", "UDF","UDF",   "AV","AV",     "DPPM","DPPM", "POE","POE",   "POE","POE"],
  "Sáb 07/11": new Array(HORARIOS.length).fill(""),
  "Dom 08/11": ["", "AV","AV",     "AV","AV",     "AV","AV",     "AV","AV",     "AV","AV",     "",""],
}

// A folha numera as aulas (ex.: "AV 50/50"): a carga ao fim da semana é o último
// contador de cada disciplina — gravada de forma ABSOLUTA (rodar de novo não soma).
// AE: a folha vai de 35 a 40 (pula 38–39; a T14 também) — vale o documento.
const FIM_43: Record<string, number> = {
  AE: 40, DPPM: 54, UDF: 38, TP: 52, POE: 56, AV: 50, ABAA: 20,
}

async function main() {
  for (const [dia, aulas] of Object.entries(grade)) {
    if (aulas.length !== HORARIOS.length) throw new Error(`${dia}: ${aulas.length} faixas, esperado ${HORARIOS.length}`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({ where: { semana: SEMANA }, update: { dados }, create: { semana: SEMANA, dados } })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias, ${HORARIOS.length} faixas).`)

  console.log("\n── Carga ao fim da semana 43 (contadores da folha) ──")
  for (const [sigla, fim] of Object.entries(FIM_43)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const depois = Math.min(fim, disc.cargaTotal)
    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })
    console.log(`  ${status === "Concluída" ? "✔" : "•"} ${sigla.padEnd(5)} ${disc.cargaMinistrada}h → ${depois}/${disc.cargaTotal}h  ${status}`)
  }
  console.log(" ⚠ Lançado como PREVISTO: a semana ainda não começou.")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
