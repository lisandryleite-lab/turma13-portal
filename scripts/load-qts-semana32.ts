import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 32

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 17/08","Ter 18/08","Qua 19/08","Qui 20/08","Sex 21/08","Sáb 22/08","Dom 23/08"]

// Transcrito da foto do QTS mestre — semana de 17/08 a 23/08/2026 (a planilha
// rotula "SEMANA 32", igual à numeração do portal — semanaAtual() a partir de
// 12/01/2026).
// Cada dia da foto tem DUAS subcolunas: a da ESQUERDA é a Turma 13, a da direita
// é a outra turma (mesmo critério das semanas 25/27/28/29/30) — por isso os pares
// aparecem trocados entre os blocos (ex.: seg. POE|EASPE e depois EASPE|POE).
// Mapeamento das linhas da foto para os índices de HORARIOS:
//   07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 · 10h00 às 11h40 → idx3,4
//   13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 · 18h20 às 19h10 → idx10
// O bloco idx9 (17h30–18h20) não aparece na foto — fica vago.
// Siglas da foto → banco: EASPE → EASE · DPPPM → DPPM.
// O AP riscado na qua. 19/08 (10h00–11h40) está na subcoluna da OUTRA turma —
// não afeta a grade da Turma 13.
// Sáb 22/08 e Dom 23/08 não constam na foto (sem aula).
const grade: Record<string, string[]> = {
  "Seg 17/08": ["", "POE","POE",   "EASE","EASE", "POE","POE", "EASE","EASE", "","EASE"],
  "Ter 18/08": ["", "TFM2","TFM2", "POE","POE",   "TPE","TPE", "DPPM","DPPM", "",""],
  "Qua 19/08": ["", "AP","AP",     "POE","POE",   "AP","AP",   "TPE","TPE",   "","TPE"],
  "Qui 20/08": ["", "GC","GC",     "TFM2","TFM2", "AP","AP",   "TCEM","TCEM", "","TCEM"],
  "Sex 21/08": ["", "DPPM","DPPM", "GC","GC",     "EASE","EASE", "PE","PE",   "",""],
  "Sáb 22/08": ["","","","","","","","","","",""],
  "Dom 23/08": ["","","","","","","","","","",""],
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
