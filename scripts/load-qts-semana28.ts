import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 28

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 20/07","Ter 21/07","Qua 22/07","Qui 23/07","Sex 24/07","Sáb 25/07","Dom 26/07"]

// Transcrito da foto do QTS mestre — Turma 13, Semana 28 (20–26/07/2026).
// idx0 = 07h00 (vago) · manhã = idx1–4 (08h00,08h50,10h00,10h50) ·
// tarde = idx5–8 (13h40,14h30,15h40,16h30) · idx9,10 = 17h30–19h10.
// Siglas mapeadas p/ o banco: OU-II→OU2, DPPPM→DPPM.
// Sexta 24/07 é "À disp. do CA" — fica em branco (não é disciplina).
const grade: Record<string, string[]> = {
  "Seg 20/07": ["", "AP","AP","INTSISP","INTSISP", "AP","AP", "INTSISP","INTSISP", "INTSISP","INTSISP"],
  "Ter 21/07": ["", "OU2","OU2","OU2","OU2", "APHT","APHT", "APHT","APHT", "",""],
  "Qua 22/07": ["", "MPC","MPC","POE","POE", "MPC","MPC", "DPPM","DPPM", "DPPM","DPPM"],
  "Qui 23/07": ["", "TCEM","TCEM","LPMO","LPMO", "INTSISP","INTSISP", "POE","POE", "POE","POE"],
  "Sex 24/07": ["", "MPC","MPC","","", "","", "","", "",""],
  "Sáb 25/07": ["","","","","","","","","","",""],
  "Dom 26/07": ["","","","","","","","","","",""],
}

// Valor ABSOLUTO de cargaMinistrada após a Semana 28 — lido direto dos
// contadores da foto (último slot de cada disciplina na semana).
const absoluto: Record<string, number> = {
  AP: 12, INTSISP: 20, OU2: 40, APHT: 14,
  MPC: 24, POE: 6, DPPM: 18, TCEM: 20, LPMO: 40,
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  for (const [sigla, carga] of Object.entries(absoluto)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const nova = Math.min(disc.cargaTotal, carga)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    const seta = nova === disc.cargaMinistrada ? "=" : nova > disc.cargaMinistrada ? "↑" : "↓"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} ${seta} ${nova}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
