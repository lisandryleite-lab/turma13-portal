import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 29

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 27/07","Ter 28/07","Qua 29/07","Qui 30/07","Sex 31/07","Sáb 01/08","Dom 02/08"]

// Transcrito da foto do QTS mestre — Turma 13 (coluna da esquerda de cada dia),
// Semana 29 (27/07–02/08/2026). A foto está em blocos de 2 tempos; cada bloco
// preenche 2 slots do array de 11. idx0 = 07h00 (vago).
// Blocos: idx1,2 = 08h00–09h40 · idx3,4 = 10h00–11h40 · idx5,6 = 13h40–15h20 ·
//         idx7,8 = 15h40–17h20 · idx9,10 = 17h30–19h10.
// EASPE da foto → EASE no banco. Sáb 01/08 livre; Dom 02/08 tem aula (AP + PJM).
const grade: Record<string, string[]> = {
  "Seg 27/07": ["", "EPCR","EPCR", "","", "EASE","EASE", "","", "",""],
  "Ter 28/07": ["", "TFM2","TFM2", "MPC","MPC", "AP","AP", "TCEM","TCEM", "TCEM","TCEM"],
  "Qua 29/07": ["", "APHT","APHT", "TFM2","TFM2", "POE","POE", "APHT","APHT", "",""],
  "Qui 30/07": ["", "AM","AM", "AM","AM", "AP","AP", "AP","AP", "AP","AP"],
  "Sex 31/07": ["", "MPC","MPC", "POE","POE", "TCEM","TCEM", "INTSISP","INTSISP", "",""],
  "Sáb 01/08": ["","","","","","","","","","",""],
  "Dom 02/08": ["", "AP","AP", "AP","AP", "PJM","PJM", "PJM","PJM", "",""],
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  // Contagem de horas por disciplina (1 slot = 1 hora), igual ao editor.
  const horas: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const s of slots) if (s) horas[s] = (horas[s] || 0) + 1
  }

  // Atualização INCREMENTAL: soma as horas desta semana à carga atual
  // (capada no total) — respeita as edições manuais como base.
  for (const [sigla, h] of Object.entries(horas)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const nova = Math.min(disc.cargaTotal, disc.cargaMinistrada + h)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} +${h} → ${nova}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
