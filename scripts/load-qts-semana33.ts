import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 33

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 24/08","Ter 25/08","Qua 26/08","Qui 27/08","Sex 28/08","Sáb 29/08","Dom 30/08"]

// Fonte: QTS SEMANA 33 (24 a 30/08/2026), emitido em 24/08/2026 — tabela de cima
// da folha ("HORÁRIO DE AULA SEMANAL - TURMA 13"; a de baixo é a Turma 14).
// Como na semana 32, o QTS traz o contador oficial de tempos (`GC 21/30`), então a
// carga é gravada de forma ABSOLUTA. Aulas à noite (17h30/18h20) só seg, ter e qua.
// Siglas do QTS → banco: EASPE → EASE.
const grade: Record<string, string[]> = {
  "Seg 24/08": ["", "GC","GC",   "EASE","EASE", "GC","GC",     "EASE","EASE", "EASE","EASE"],
  "Ter 25/08": ["", "POE","POE", "AM","AM",     "POE","POE",   "AM","AM",     "POE","POE"],
  "Qua 26/08": ["", "AP","AP",   "TPE","TPE",   "TCEM","TCEM", "AP","AP",     "AP","AP"],
  "Qui 27/08": ["", "TPE","TPE", "GC","GC",     "AM","AM",     "GC","GC",     "",""],
  "Sex 28/08": ["", "POE","POE", "TCEM","TCEM", "EASE","EASE", "TCEM","TCEM", "",""],
  "Sáb 29/08": ["","","","","","","","","","",""],
  "Dom 30/08": ["","","","","","","","","","",""],
}

// Contador OFICIAL do QTS: `antes` = primeiro X da semana menos 1, `depois` = último X.
//
// Duas divergências contra o portal, ambas resolvidas a favor do QTS:
//  • TCEM — o QTS da semana 32 escalou TCEM 33/34 para a noite de quinta 20/08, mas
//    o QTS da semana 33 reemite 33/34 na quarta 26/08: aqueles dois tempos não foram
//    dados. O portal estava em 34h; o correto antes desta semana era 32h.
//  • AM — não apareceu no QTS da semana 32, mas a semana 33 começa em 43/60, ou seja
//    41 e 42 foram dados em alguma semana que o portal registrou de outro jeito
//    (a semana 31 foi lançada como MAP1 em todos os tempos). Portal 40h → 42h.
const OFICIAL: Record<string, { antes: number; depois: number }> = {
  GC:   { antes: 20, depois: 28 },  // 21/30 … 28/30
  EASE: { antes: 14, depois: 22 },  // EASPE 15/30 … 22/30
  POE:  { antes: 14, depois: 22 },  // 15/60 … 22/60
  AM:   { antes: 42, depois: 48 },  // 43/60 … 48/60
  AP:   { antes: 34, depois: 40 },  // 35/50 … 40/50
  TPE:  { antes: 10, depois: 14 },  // 11/40 … 14/40
  TCEM: { antes: 32, depois: 38 },  // 33/40 … 38/40
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  const tempos: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const s of slots) if (s) tempos[s] = (tempos[s] || 0) + 1
  }

  console.log("\n── Conferência do portal contra o QTS oficial ──")
  for (const [sigla, { antes, depois }] of Object.entries(OFICIAL)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    // Sanidade: o contador do QTS tem que fechar com a contagem de tempos da grade.
    if (antes + (tempos[sigla] ?? 0) !== depois) {
      console.log(`  ⚠ ${sigla}: grade tem ${tempos[sigla] ?? 0}h mas o contador vai de ${antes} a ${depois}`)
    }

    const desvio = disc.cargaMinistrada - antes
    const marca = desvio === 0 ? "ok " : desvio > 0 ? "▲  " : "▼  "
    const nota = desvio === 0 ? "" : ` (portal estava ${desvio > 0 ? "+" : ""}${desvio}h)`

    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })

    console.log(`  ${marca}${sigla.padEnd(5)} antes ${String(disc.cargaMinistrada).padStart(2)}h → QTS ${String(antes).padStart(2)}h  +${tempos[sigla] ?? 0}h  ⇒  ${depois}/${disc.cargaTotal}h ${status}${nota}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada/total*100)}%)`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
