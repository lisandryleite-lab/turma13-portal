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

// Transcrito da foto do QTS mestre — Semana 29 (27/07 a 02/08/2026).
// Cada dia da foto tem DUAS subcolunas: a da ESQUERDA é a Turma 13, a da direita
// é a outra turma (mesmo critério das semanas 25/27/28). Por isso os pares
// aparecem trocados entre os blocos (ex.: ter. TFM2|MPC e depois MPC|TFM2).
// Mapeamento das linhas da foto para os índices de HORARIOS:
//   07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 · 10h00 às 11h40 → idx3,4
//   13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 · 18h20 às 19h10 → idx10
// Siglas normalizadas p/ o banco: INTSIP→INTSISP, EASPE→EASE.
const grade: Record<string, string[]> = {
  "Seg 27/07": ["", "EPCR","EPCR","","", "EASE","EASE", "","", "",""],
  "Ter 28/07": ["", "TFM2","TFM2","MPC","MPC", "AP","AP", "TCEM","TCEM", "","TCEM"],
  "Qua 29/07": ["", "APHT","APHT","TFM2","TFM2", "POE","POE", "APHT","APHT", "",""],
  "Qui 30/07": ["", "AM","AM","AM","AM", "AP","AP", "AP","AP", "","AP"],
  "Sex 31/07": ["", "MPC","MPC","POE","POE", "TCEM","TCEM", "INTSISP","INTSISP", "",""],
  "Sáb 01/08": ["","","","","","","","","","",""],
  "Dom 02/08": ["", "AP","AP","AP","AP", "PJM","PJM", "PJM","PJM", "",""],
}

// A foto da semana 29 está recortada e NÃO mostra os contadores de carga —
// por isso, ao contrário das semanas 27/28 (que traziam o valor absoluto),
// aqui a carga é INCREMENTADA a partir do valor já gravado no banco,
// somando as horas da própria grade acima. Limitado a cargaTotal.

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  const horasSemana: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const sigla of slots) {
      if (sigla) horasSemana[sigla] = (horasSemana[sigla] || 0) + 1
    }
  }

  for (const [sigla, horas] of Object.entries(horasSemana).sort()) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const nova = Math.min(disc.cargaTotal, disc.cargaMinistrada + horas)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} +${horas}h → ${nova}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
