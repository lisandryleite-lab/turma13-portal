import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 25

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 29/06","Ter 30/06","Qua 01/07","Qui 02/07","Sex 03/07","Sáb 04/07","Dom 05/07"]

// Transcrito da foto do QTS mestre (ANA 26 / Semana 26 da planilha da escola).
// Cada linha da foto (ex.: "08h00 às 09h40") é UM bloco de 100min de UMA só disciplina
// (a da esquerda da célula) — a segunda sigla à direita é de outra turma/grupo, não da
// Turma 13. idx0 = 07h00 (vago) · manhã = idx1–4 · tarde = idx5–8 · idx9,10 = 17h30–19h10.
const grade: Record<string, string[]> = {
  "Seg 29/06": ["", "TFM2","TFM2","TFM2","TFM2", "","", "","","",""],
  "Ter 30/06": ["", "MPC","MPC","MPC","MPC", "DADM","DADM", "DADM","DADM","","DADM"],
  "Qua 01/07": ["", "TFM2","TFM2","GC","GC", "LPMO","LPMO", "MPC","MPC","",""],
  "Qui 02/07": ["", "MPC","MPC","AM","AM", "AM","AM", "TCEM","TCEM","","TCEM"],
  "Sex 03/07": ["", "DPPM","DPPM","GC","GC", "EPCR","EPCR", "LPMO","LPMO","","EPCR"],
  "Sáb 04/07": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "","","",""],
  "Dom 05/07": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "","","",""],
}

// cargaMinistrada de cada disciplina ANTES da semana 25 (baseline já confirmado no banco)
const baseline: Record<string, number> = {
  TFM2: 26, MPC: 2, GC: 14, AM: 14, DPPM: 9, DADM: 54, LPMO: 30, TCEM: 12, EPCR: 0, OU2: 22,
}

// horas desta semana por disciplina, já recalculadas com a grade corrigida
const horasSemana: { sigla: string; horas: number }[] = [
  { sigla: "TFM2", horas: 6 },
  { sigla: "MPC",  horas: 8 },
  { sigla: "GC",   horas: 4 },
  { sigla: "DADM", horas: 5 },
  { sigla: "DPPM", horas: 2 },
  { sigla: "LPMO", horas: 4 },
  { sigla: "AM",   horas: 4 },
  { sigla: "TCEM", horas: 3 },
  { sigla: "EPCR", horas: 3 },
  { sigla: "OU2",  horas: 12 },
]

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} corrigido e salvo (${DIAS.length} dias).`)

  for (const { sigla, horas } of horasSemana) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const carga = Math.min(disc.cargaTotal, (baseline[sigla] ?? disc.cargaMinistrada) + horas)
    const status = carga >= disc.cargaTotal ? "Concluída" : carga > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: carga, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} → ${carga}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
