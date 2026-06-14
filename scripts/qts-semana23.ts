import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 23

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 15/06","Ter 16/06","Qua 17/06","Qui 18/06","Sex 19/06","Sáb 20/06","Dom 21/06"]

// ordem dos 11 slots = HORARIOS. "" = vazio. Siglas conforme banco.
const grade: Record<string, string[]> = {
  "Seg 15/06": ["", "DPPM","DPPM","GC","GC", "DPPM","DPPM", "LPMO","LPMO","",""],
  "Ter 16/06": ["", "AM","AM","DADM","DADM", "LPMO","LPMO", "TCEM","TCEM","TCEM","TCEM"],
  "Qua 17/06": ["", "DADM","DADM","TFM2","TFM2", "ACE","ACE", "DADM","DADM","MPC","MPC"],
  "Qui 18/06": ["", "GC","GC","MPC","MPC", "À disp. CA","À disp. CA", "MPC","MPC","",""],
  "Sex 19/06": ["", "AM","AM","DPPM","DPPM", "TCEM","TCEM", "DPPM","DPPM","DPPM","DPPM"],
  "Sáb 20/06": ["", "","","","", "","", "","","",""],
  "Dom 21/06": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "PO","PO","PO","PO"],
}

// total de aulas (cumulativo) ao fim da semana 23, conforme o QTS oficial (X/Y)
const cargas: { sigla: string; ministrada: number }[] = [
  { sigla: "DPPM", ministrada: 10 },
  { sigla: "GC",   ministrada: 10 },
  { sigla: "LPMO", ministrada: 28 },
  { sigla: "AM",   ministrada: 11 },
  { sigla: "DADM", ministrada: 48 },
  { sigla: "TCEM", ministrada: 10 },
  { sigla: "TFM2", ministrada: 26 },
  { sigla: "ACE",  ministrada: 30 },
  { sigla: "MPC",  ministrada: 6 },
  { sigla: "OU2",  ministrada: 16 },
  { sigla: "PO",   ministrada: 28 },
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
