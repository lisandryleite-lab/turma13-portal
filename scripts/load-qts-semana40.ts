import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 40

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 12/10","Ter 13/10","Qua 14/10","Qui 15/10","Sex 16/10","Sáb 17/10","Dom 18/10"]

// Transcrito do QTS mestre — semana 40, de 12 a 18/10/2026. Folha de DUAS
// sub-colunas por dia: a da ESQUERDA é a Turma 13 (só ela entra aqui).
// Faixas da folha → HORARIOS: 08h00–09h40 → idx1,2 · 10h00–11h40 → idx3,4 ·
// 13h40–15h20 → idx5,6 · 15h30–17h20 → idx7,8 · 18h20–19h10 → idx10 (tempo único).
// Siglas da folha → banco: DPPPM → DPPM · UDFIT → UDF. PU = Patrulhamento Urbano.
// Quinta 15/10 de manhã está livre na folha: haverá patrulhamento urbano (PU),
// informado pela turma. Sábado sem aula; DOMINGO 18/10 com instrução (TPE e PU)
// — pela escala de faxina, a equipe SEGUNDA cobre esse domingo.
const grade: Record<string, string[]> = {
  "Seg 12/10": ["", "AE","AE",     "AE","AE",     "DPPM","DPPM", "DPPM","DPPM", "","DPPM"],
  "Ter 13/10": ["", "AV","AV",     "AV","AV",     "TP","TP",     "TP","TP",     "","TPE"],
  "Qua 14/10": ["", "POE","POE",   "POE","POE",   "UDF","UDF",   "UDF","UDF",   "","UDF"],
  "Qui 15/10": ["", "PU","PU",     "PU","PU",     "PJM","PJM",   "PJM","PJM",   "","PJM"],
  "Sex 16/10": ["", "TP","TP",     "TP","TP",     "QAGV","QAGV", "QAGV","QAGV", "",""],
  "Sáb 17/10": ["","","","","","","","","","",""],
  "Dom 18/10": ["", "TPE","TPE",   "TPE","TPE",   "PU","PU",     "PU","PU",     "",""],
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  const horas: Record<string, number> = {}
  for (const slots of Object.values(grade)) for (const sl of slots) if (sl) horas[sl] = (horas[sl] || 0) + 1

  // Folha SEM contador oficial: soma a grade à carga atual (que veio do contador
  // da semana 39), capada no total. NÃO rodar duas vezes — soma de novo.
  console.log("\n── Carga somada pela grade (sem contador nesta folha) ──")
  const capadas: string[] = []
  for (const [sigla, h] of Object.entries(horas)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const bruta = disc.cargaMinistrada + h
    const nova = Math.min(disc.cargaTotal, bruta)
    if (bruta > disc.cargaTotal) capadas.push(`${sigla} (${bruta} → ${nova})`)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    console.log(`  ${status === "Concluída" ? "✔" : "•"} ${sigla.padEnd(6)} ${String(disc.cargaMinistrada).padStart(2)}h +${h} → ${nova}/${disc.cargaTotal}h  ${status}`)
  }
  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((t, d) => t + d.cargaTotal, 0)
  const dada = todas.reduce((t, d) => t + d.cargaMinistrada, 0)
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada / total * 100)}%)`)
  if (capadas.length) console.log(` ⚠ Capadas no total: ${capadas.join(", ")}`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
