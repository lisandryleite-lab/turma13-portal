import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 24

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 22/06","Ter 23/06","Qua 24/06","Qui 25/06","Sex 26/06","Sáb 27/06","Dom 28/06"]

// ordem dos 11 slots = HORARIOS. "" = vazio. Siglas conforme banco.
// idx0 = 07h00 (vago todos os dias) · manhã = idx1–4 · tarde = idx5–8 · idx9,10 vagos
const grade: Record<string, string[]> = {
  "Seg 22/06": ["", "À disp. CA","À disp. CA","À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA","",""],
  "Ter 23/06": ["", "À disp. CA","À disp. CA","À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA","",""],
  "Qua 24/06": ["", "Feriado","Feriado","Feriado","Feriado", "Feriado","Feriado", "Feriado","Feriado","",""],
  "Qui 25/06": ["", "GC","GC","GC","GC", "DADM","DADM", "LPMO","LPMO","",""],
  "Sex 26/06": ["", "DADM","DADM","DADM","DADM", "AM","AM", "TCEM","TCEM","",""],
  "Sáb 27/06": ["", "","","","", "","", "","","",""],
  "Dom 28/06": ["", "OU2","OU2","OU2","OU2", "OU2","OU2", "À disp. CA","À disp. CA","",""],
}

// total de aulas (cumulativo) ao fim da semana 24, conforme o QTS oficial (X/Y)
const cargas: { sigla: string; ministrada: number }[] = [
  { sigla: "GC",   ministrada: 14 },
  { sigla: "DADM", ministrada: 54 },
  { sigla: "LPMO", ministrada: 30 },
  { sigla: "AM",   ministrada: 14 },
  { sigla: "TCEM", ministrada: 12 },
  { sigla: "OU2",  ministrada: 22 },
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
