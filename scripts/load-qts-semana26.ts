import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 26

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 06/07","Ter 07/07","Qua 08/07","Qui 09/07","Sex 10/07","Sáb 11/07","Dom 12/07"]

// Transcrito do Quadro-Mestre de Horário Semanal (Turma 13) — semana 26, 06/07 a 12/07/2026.
// idx0 = 07h00 (vago) · manhã = idx1–4 · tarde = idx5–8 · idx9,10 = 17h30–19h10.
const grade: Record<string, string[]> = {
  "Seg 06/07": ["", "INTSISP","INTSISP","À disp. CA","À disp. CA", "INTSISP","INTSISP", "INTSISP","INTSISP","",""],
  "Ter 07/07": ["", "APHT","APHT","MPC","MPC", "LPMO","LPMO", "APHT","APHT","APHT","APHT"],
  "Qua 08/07": ["", "MPC","MPC","PO","PO", "DADM","DADM", "PO","PO","OU2","OU2"],
  "Qui 09/07": ["", "OU2","OU2","À disp. CA","À disp. CA", "AM","AM", "AM","AM","",""],
  "Sex 10/07": ["", "PO","PO","MPC","MPC", "PO","PO", "EPCR","EPCR","",""],
  "Sáb 11/07": ["", "","","","", "","", "","","",""],
  "Dom 12/07": ["", "APHT","APHT","APHT","APHT", "PO","PO", "PO","PO","",""],
}

// total de aulas (cumulativo) ao fim da semana 26, conforme o QTS oficial (X/Y)
const cargas: { sigla: string; ministrada: number }[] = [
  { sigla: "INTSISP", ministrada: 6 },
  { sigla: "APHT",    ministrada: 10 },
  { sigla: "MPC",     ministrada: 16 },
  { sigla: "LPMO",    ministrada: 36 },
  { sigla: "PO",      ministrada: 38 },
  { sigla: "DADM",    ministrada: 60 },
  { sigla: "OU2",     ministrada: 32 },
  { sigla: "AM",      ministrada: 24 },
  { sigla: "EPCR",    ministrada: 2 },
]

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  for (const { sigla, ministrada } of cargas) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const carga = Math.min(disc.cargaTotal, ministrada)
    const status = carga >= disc.cargaTotal ? "Concluída" : carga > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: carga, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} → ${carga}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
