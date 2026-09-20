import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 36

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 14/09","Ter 15/09","Qua 16/09","Qui 17/09","Sex 18/09","Sáb 19/09","Dom 20/09"]

// Transcrito da foto do QTS mestre — Turma 13 (coluna da ESQUERDA de cada dia),
// semana de 14/09 a 20/09/2026. A planilha rotula "SEMANA 36" e a numeração do
// portal (semanaAtual() a partir de 12/01/2026) também dá 36.
// Mapeamento das linhas da foto para os índices de HORARIOS (mesma convenção
// das semanas 29/30): 07h00 às 08h00 → idx0 (vago) · 08h00 às 09h40 → idx1,2 ·
//   10h00 às 11h40 → idx3,4 · 13h40 às 15h20 → idx5,6 · 15h30 às 17h20 → idx7,8 ·
//   18h20 às 19h10 → idx10.
// idx9 (17h30–18h20) não aparece na foto — fica vago, como nas semanas anteriores.
// Siglas da foto → banco: INTSIP → INTSISP · DPPPM → DPPM. As demais são iguais:
//   AM Armamento e Munição · AV Abordagem a Veículos · AE Abordagem a Edificações ·
//   QAGV Qualidade do Atendimento aos Grupos Vulneráveis · TPE Teoria e Prática do
//   Ensino · TFM2 Treinamento Físico Militar II · EPCR Elaboração de Projetos e
//   Captação de Recursos · PJM Polícia Judiciária Militar.
// O TPE riscado na qua. 16/09 às 10h00 está na coluna da direita, não na da
// Turma 13 — não entra na contagem.
// Sáb 19/09 e Dom 20/09 sem aula.
const grade: Record<string, string[]> = {
  "Seg 14/09": ["", "AM","AM", "AV","AV", "EPCR","EPCR", "EPCR","EPCR", "", ""],
  "Ter 15/09": ["", "AE","AE", "QAGV","QAGV", "PJM","PJM", "PJM","PJM", "", "PJM"],
  "Qua 16/09": ["", "TPE","TPE", "TFM2","TFM2", "INTSISP","INTSISP", "AM","AM", "", ""],
  "Qui 17/09": ["", "AE","AE", "TPE","TPE", "AE","AE", "AE","AE", "", "AE"],
  "Sex 18/09": ["", "AV","AV", "DPPM","DPPM", "AV","AV", "AV","AV", "", "AV"],
  "Sáb 19/09": ["","","","","","","","","","",""],
  "Dom 20/09": ["","","","","","","","","","",""],
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
