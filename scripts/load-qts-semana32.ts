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

// Transcrição do QTS OFICIAL — "HORÁRIO DE AULA SEMANAL, TURMA 13, Semana 32"
// (Divisão de Ensino / APM do Paudalho, CFO/PM-2024.3), 17 a 23/08/2026.
// A numeração do portal — semanaAtual() a partir de 12/01/2026 — também dá 32.
//
// O QTS oficial é melhor que a foto da planilha mestre usada nas semanas
// anteriores: já vem só com a Turma 13 (uma coluna por dia, sem a subcoluna da
// outra turma), tem uma coluna por tempo de aula — batendo 1:1 com HORARIOS — e
// traz o CONTADOR ACUMULADO de cada disciplina (ex.: "POE 7/60" … "POE 14/60").
//
// Por isso a grade vem de scripts/data/qts-semana32.txt com colunasPorDia: 1, e
// a carga é gravada em valor ABSOLUTO (mesma convenção das semanas 27/28), lido
// do último contador de cada disciplina na semana — não somada por cima do que
// está no banco. lib/qts.ts normaliza EASPE→EASE e DPPPM→DPPM.
//
// Sáb 22/08 e Dom 23/08 em branco (sem aula).
//
// O arquivo usa "|" no lugar do TAB só para ficar legível no repositório.
const PLANILHA = readFileSync(join(__dirname, "data", "qts-semana32.txt"), "utf8")
const COLADO = PLANILHA.trim().split("\n").map(l => l.split("|").map(c => c.trim()).join("\t")).join("\n")

// Último contador de cada disciplina no QTS oficial da semana 32 = carga
// acumulada ao fim da semana. Confere com a grade: a diferença em relação ao
// primeiro contador da semana é exatamente o nº de tempos lançados aqui.
const ABSOLUTO: Record<string, number> = {
  POE: 14,   // 7/60 → 14/60  (+8)
  EASE: 14,  // 7/30 → 14/30  (+8)
  TFM2: 44,  // 41/60 → 44/60 (+4)
  TPE: 10,   // 5/40 → 10/40  (+6)
  DPPM: 28,  // 25/60 → 28/60 (+4)
  AP: 34,    // 29/50 → 34/50 (+6)
  GC: 20,    // 17/30 → 20/30 (+4)
  TCEM: 34,  // 31/40 → 34/40 (+4)
  PE: 2,     // 1/20 → 2/20   (+2)
}

async function main() {
  const { grade, linhas, siglas } = importarQtsColado(COLADO, DIAS, { colunasPorDia: 1 })
  console.log(`Faixas lidas: ${linhas.length} · siglas: ${siglas.join(", ")}`)

  // Trava de sanidade: o nº de tempos da grade tem de fechar com o salto dos
  // contadores do QTS oficial. Se a transcrição escorregar, o script para.
  const horas = horasPorDisciplina(grade)
  const totalGrade = Object.values(horas).reduce((a, b) => a + b, 0)
  console.log(`Tempos lançados: ${totalGrade}h — ${Object.entries(horas).sort().map(([s, h]) => `${s} ${h}h`).join(" · ")}`)
  for (const sigla of siglas) {
    if (ABSOLUTO[sigla] === undefined) throw new Error(`Sigla ${sigla} está na grade mas não em ABSOLUTO.`)
  }

  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  for (const [sigla, carga] of Object.entries(ABSOLUTO).sort()) {
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
