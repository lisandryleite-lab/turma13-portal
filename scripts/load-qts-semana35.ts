import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 35

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 07/09","Ter 08/09","Qua 09/09","Qui 10/09","Sex 11/09","Sáb 12/09","Dom 13/09"]

// Fonte: QTS SEMANA 35 (07 a 13/09/2026), emitido em 07/09/2026 — tabela de cima
// da folha ("HORÁRIO DE AULA SEMANAL - TURMA 13"; a de baixo é a Turma 14).
// Segunda 07/09 sem aula (feriado da Independência).
// Siglas do QTS → banco: EASPE → EASE · "TFM - II" → TFM2.
// "À disp. do CA" = à disposição do Corpo de Alunos; não é disciplina e não conta carga.
const grade: Record<string, string[]> = {
  "Seg 07/09": ["","","","","","","","","","",""],
  "Ter 08/09": ["", "EPCR","EPCR", "EPCR","EPCR", "AP","AP",   "AP","AP",     "INTSISP","INTSISP"],
  "Qua 09/09": ["", "POE","POE",   "AM","AM",     "POE","POE", "AM","AM",     "À disp. CA","À disp. CA"],
  "Qui 10/09": ["", "TFM2","TFM2", "TFM2","TFM2", "EASE","EASE", "EASE","EASE", "",""],
  "Sex 11/09": ["", "EPCR","EPCR", "EPCR","EPCR", "TFM2","TFM2", "TFM2","TFM2", "",""],
  "Sáb 12/09": ["","","","","","","","","","",""],
  "Dom 13/09": ["","","","","","","","","","",""],
}

// Contador oficial no INÍCIO da semana 35 (primeiro X de cada disciplina, menos 1),
// ou seja: a carga real ao FIM da semana 34.
//
// Rodado em 04/09/2026, com a semana 34 já cumprida (31/08 a 04/09) e a 35 ainda
// por vir — por isso a carga NÃO é adiantada para o fim da 35. O `antes` entra como
// TETO: o contador do QTS nunca anda para trás, então disciplina em que o portal
// esteja ACIMA do `antes` está inflada e desce. Abaixo do `antes`, seriam aulas
// ainda não dadas — não mexer.
//
// Todas as 7 estavam infladas: resíduo dos carregadores antigos, que somavam a
// grade da semana em vez de gravar o contador oficial (ver CLAUDE.md).
const ANTES_35: Record<string, number> = {
  EPCR:    8,   // 9/20 …
  AP:     46,   // 47/50 …
  INTSISP: 26,  // 27/30 …
  POE:    24,   // 25/60 …
  AM:     52,   // 53/60 …
  TFM2:   42,   // TFM-II 43/60 …
  EASE:   24,   // EASPE 25/30 …
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  console.log("\n── Portal x contador oficial no início da semana 35 ──")
  const corrigidas: string[] = []
  for (const [sigla, antes] of Object.entries(ANTES_35)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    if (disc.cargaMinistrada > antes) {
      // Impossível: o contador do QTS nunca anda para trás. O portal contou aula
      // que não foi dada (herança da soma incremental dos carregadores antigos).
      const status = antes >= disc.cargaTotal ? "Concluída" : antes > 0 ? "Em andamento" : "Início"
      await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: antes, status } })
      corrigidas.push(sigla)
      console.log(`  ▼ ${sigla.padEnd(8)} ${disc.cargaMinistrada}h → ${antes}h  (portal estava +${disc.cargaMinistrada - antes}h — corrigido)`)
    } else if (disc.cargaMinistrada < antes) {
      console.log(`  · ${sigla.padEnd(8)} ${disc.cargaMinistrada}h  (faltam ${antes - disc.cargaMinistrada}h da semana 34 — ainda não aconteceram, não mexer)`)
    } else {
      console.log(`  ok ${sigla.padEnd(8)} ${disc.cargaMinistrada}h  — em dia`)
    }
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada/total*100)}%)`)
  console.log(` ${corrigidas.length} disciplina(s) corrigida(s): ${corrigidas.join(", ") || "nenhuma"}`)
  console.log(`\n ⚠ A carga NÃO foi adiantada para o fim da semana 35 — aquelas aulas são de 07 a 11/09.`)
  console.log(` ⚠ As disciplinas da semana 34 que NÃO aparecem na 35 (PE, PJM, TPE, TCEM, GC)
   não têm contador nesta folha — ficam sem conferência até saírem num QTS.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
