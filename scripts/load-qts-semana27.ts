import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 27

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 13/07","Ter 14/07","Qua 15/07","Qui 16/07","Sex 17/07","Sáb 18/07","Dom 19/07"]

// Transcrito da foto do QTS mestre — Turma 13, Semana 27 (13–19/07/2026).
// idx0 = 07h00 (vago) · manhã = idx1–4 (08h00,08h50,10h00,10h50) ·
// tarde = idx5–8 (13h40,14h30,15h40,16h30) · idx9,10 = 17h30–19h10 (vago p/ T13).
// Siglas mapeadas p/ o banco: TFM-II→TFM2, OU-II→OU2, DPPPM→DPPM, PO 2→PO.
const grade: Record<string, string[]> = {
  "Seg 13/07": ["", "AP","AP","MPC","MPC", "AP","AP", "LPMO","LPMO", "",""],
  "Ter 14/07": ["", "TFM2","TFM2","DPPM","DPPM", "INTSISP","INTSISP", "OU2","OU2", "",""],
  "Qua 15/07": ["", "INTSISP","INTSISP","INTSISP","INTSISP", "AM","AM", "AM","AM", "",""],
  "Qui 16/07": ["", "PO","PO","GPGA","GPGA", "OU2","OU2", "TCEM","TCEM", "",""],
  "Sex 17/07": ["", "AP","AP","AP","AP", "AM","AM", "AM","AM", "",""],
  "Sáb 18/07": ["","","","","","","","","","",""],
  "Dom 19/07": ["","","","","","","","","","",""],
}

// Valor ABSOLUTO de cargaMinistrada após a Semana 27 (último contador da foto).
// A foto é a fonte oficial — inclui as correções p/ baixo de MPC/TFM2/OU2
// (confirmado pelo Lisandry em 13/07/2026).
const absoluto: Record<string, number> = {
  AP: 8, MPC: 18, LPMO: 38, TFM2: 32, DPPM: 14,
  INTSISP: 12, OU2: 36, AM: 32, PO: 40, GPGA: 30, TCEM: 18,
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
