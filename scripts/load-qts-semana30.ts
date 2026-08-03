import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 30

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 03/08","Ter 04/08","Qua 05/08","Qui 06/08","Sex 07/08","Sáb 08/08","Dom 09/08"]

// Transcrito da foto do QTS mestre — Turma 13 (coluna da esquerda de cada dia),
// semana de 03/08 a 09/08/2026 (a planilha rotula "SEMANA 29"; a numeração do
// portal — semanaAtual() a partir de 12/01/2026 — dá 30).
// Mapeamento das linhas da foto para os índices de HORARIOS (mesma convenção
// da semana 29 revisada): 07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 ·
//   10h00 às 11h40 → idx3,4 · 13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 ·
//   18h20 às 19h10 → idx10 (tempo único; idx9 fica vago).
// Siglas da foto → banco: EASPE → EASE · INTSIP → INTSISP · DPPPM → DPPM.
// Sáb 08/08 e Dom 09/08 não constam na foto (sem aula).
const grade: Record<string, string[]> = {
  "Seg 03/08": ["", "PJM","PJM", "INTSISP","INTSISP", "PJM","PJM", "INTSISP","INTSISP", "",""],
  "Ter 04/08": ["", "TFM2","TFM2", "TFM2","TFM2", "EPCR","EPCR", "TCEM","TCEM", "",""],
  "Qua 05/08": ["", "AM","AM", "AM","AM", "APHT","APHT", "TPE","TPE", "","EASE"],
  "Qui 06/08": ["", "AP","AP", "AP","AP", "EASE","EASE", "EASE","EASE", "","EASE"],
  "Sex 07/08": ["", "DPPM","DPPM", "DPPM","DPPM", "TCEM","TCEM", "TPE","TPE", "",""],
  "Sáb 08/08": ["","","","","","","","","","",""],
  "Dom 09/08": ["","","","","","","","","","",""],
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
