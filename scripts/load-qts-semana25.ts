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

// Transcrito a partir da foto do QTS mestre (ANA 26 / Semana 26 da planilha da escola).
// idx0 = 07h00 (vago todos os dias) · manhã = idx1–4 · tarde = idx5–8 · idx9,10 = 17h30–19h10
// ⚠ Conferir no /qts (admin) — algumas células do fim de tarde (17h30–19h10) estavam
// pouco legíveis na foto; ajuste direto na grade visual se algo estiver errado.
const grade: Record<string, string[]> = {
  "Seg 29/06": ["", "TFM2","TFM2","TFM2","TFM2", "","", "","","",""],
  "Ter 30/06": ["", "MPC","GC","MPC","GC", "DADM","DPPM", "DADM","DPPM","",""],
  "Qua 01/07": ["", "TFM2","GC","GC","TFM2", "LPMO","MPC", "MPC","LPMO","",""],
  "Qui 02/07": ["", "MPC","AM","AM","MPC", "AM","TCEM", "TCEM","AM","","TCEM"],
  "Sex 03/07": ["", "DPPM","GC","GC","DPPM", "EPCR","LPMO", "LPMO","EPCR","","EPCR"],
  "Sáb 04/07": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "","","",""],
  "Dom 05/07": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "","","",""],
}

// horas desta semana por disciplina (somadas ao cargaMinistrada atual no banco)
const horasSemana: { sigla: string; horas: number }[] = [
  { sigla: "TFM2", horas: 6 },
  { sigla: "MPC",  horas: 6 },
  { sigla: "GC",   horas: 6 },
  { sigla: "DADM", horas: 2 },
  { sigla: "DPPM", horas: 4 },
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
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  for (const { sigla, horas } of horasSemana) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const carga = Math.min(disc.cargaTotal, disc.cargaMinistrada + horas)
    const status = carga >= disc.cargaTotal ? "Concluída" : carga > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: carga, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} → ${carga}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
