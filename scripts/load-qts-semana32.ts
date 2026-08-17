import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { HORARIOS, diasDaSemana, importarQtsColado, horasPorDisciplina } from "../lib/qts"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 32
const DIAS = diasDaSemana(SEMANA) // Seg 17/08 … Dom 23/08

// Transcrição literal da foto do QTS mestre — semana de 17/08 a 23/08/2026.
// A planilha rotula a coluna da esquerda como "SEMANA 32" (Turma 13) e a da
// direita como "SEMANA 29" (outra turma); a numeração do portal — semanaAtual()
// a partir de 12/01/2026 — também dá 32.
//
// Cada dia ocupa DUAS subcolunas: ESQUERDA = Turma 13, direita = outra turma.
// Por isso os pares aparecem trocados entre os blocos (seg. POE|EASPE às 08h00
// e EASPE|POE às 10h00). O parser em `lib/qts.ts` extrai a coluna da esquerda,
// normaliza as siglas da planilha para as do banco (EASPE→EASE, DPPPM→DPPM) e
// expande cada faixa nos tempos de HORARIOS que ela cobre.
//
// Sáb 22/08 e Dom 23/08 estão em branco na foto (sem aula).
// Obs.: o "AP" de qua. 19/08 às 10h00 aparece RISCADO na foto — é a subcoluna
// da outra turma, então não afeta a grade da Turma 13.
//
// A transcrição vive em scripts/data/qts-semana32.txt (compartilhada com
// scripts/qts-cartaz-pdf.ts). A planilha real é colada com TAB entre as
// células; no arquivo usamos "|" só para manter o bloco legível.
const PLANILHA = readFileSync(join(__dirname, "data", "qts-semana32.txt"), "utf8")
const COLADO = PLANILHA.trim().split("\n").map(l => l.split("|").map(c => c.trim()).join("\t")).join("\n")

async function main() {
  const { grade, linhas, siglas } = importarQtsColado(COLADO, DIAS, { colunasPorDia: 2, coluna: "esquerda" })
  console.log(`Faixas lidas: ${linhas.length} · siglas: ${siglas.join(", ")}`)

  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  // Atualização INCREMENTAL: soma as horas desta semana à carga já gravada
  // (capada no total) — respeita as edições manuais como base.
  const horas = horasPorDisciplina(grade)
  for (const [sigla, h] of Object.entries(horas).sort()) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const nova = Math.min(disc.cargaTotal, disc.cargaMinistrada + h)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    console.log(`  • ${sigla}: ${disc.cargaMinistrada}/${disc.cargaTotal} +${h}h → ${nova}/${disc.cargaTotal} (${status})`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
