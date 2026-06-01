/**
 * Renomeia siglas de disciplinas (idempotente, transacional):
 *   - Inteligência e Sist. de Informação de Seg. Pública: IG    → INTSISP
 *   - Instrução Geral:                                    INSTG → IG
 *
 * Migra TODOS os registros que referenciam a sigla por string:
 * Nota, HistoricoNota, NotaCFO, HistoricoNotaCFO (campo `disciplina`)
 * e Questao, Memento, Flashcard (campo `materia`).
 *
 * Ordem segura: primeiro libera "IG" (Inteligência → INTSISP), depois INSTG → IG.
 * Rodar: npx tsx scripts/rename-ig-disciplinas.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function contar(sigla: string) {
  const [disc, nota, hist, notaCfo, histCfo, quest, mem, flash] = await Promise.all([
    prisma.disciplina.findUnique({ where: { sigla }, select: { sigla: true, nome: true } }),
    prisma.nota.count({ where: { disciplina: sigla } }),
    prisma.historicoNota.count({ where: { disciplina: sigla } }),
    prisma.notaCFO.count({ where: { disciplina: sigla } }),
    prisma.historicoNotaCFO.count({ where: { disciplina: sigla } }),
    prisma.questao.count({ where: { materia: sigla } }),
    prisma.memento.count({ where: { materia: sigla } }),
    prisma.flashcard.count({ where: { materia: sigla } }),
  ])
  return { disc, nota, hist, notaCfo, histCfo, quest, mem, flash }
}

async function migrarReferencias(de: string, para: string) {
  // Atualiza sequencialmente os registros dependentes que apontam para a sigla antiga
  const nota = await prisma.nota.updateMany({ where: { disciplina: de }, data: { disciplina: para } })
  const hist = await prisma.historicoNota.updateMany({ where: { disciplina: de }, data: { disciplina: para } })
  const notaCfo = await prisma.notaCFO.updateMany({ where: { disciplina: de }, data: { disciplina: para } })
  const histCfo = await prisma.historicoNotaCFO.updateMany({ where: { disciplina: de }, data: { disciplina: para } })
  const quest = await prisma.questao.updateMany({ where: { materia: de }, data: { materia: para } })
  const mem = await prisma.memento.updateMany({ where: { materia: de }, data: { materia: para } })
  const flash = await prisma.flashcard.updateMany({ where: { materia: de }, data: { materia: para } })
  console.log(`   refs ${de}→${para}: nota=${nota.count} hist=${hist.count} notaCfo=${notaCfo.count} histCfo=${histCfo.count} questao=${quest.count} memento=${mem.count} flashcard=${flash.count}`)
}

async function renomearDisciplina(de: string, para: string, nomeEsperado?: string) {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: de } })
  if (!disc) { console.log(`   • "${de}" não existe (provavelmente já renomeada) — pulando.`); return false }
  if (nomeEsperado && !disc.nome.toLowerCase().includes(nomeEsperado.toLowerCase())) {
    throw new Error(`Segurança: disciplina "${de}" tem nome "${disc.nome}", esperado conter "${nomeEsperado}". Abortando.`)
  }
  const alvo = await prisma.disciplina.findUnique({ where: { sigla: para } })
  if (alvo) throw new Error(`Segurança: sigla destino "${para}" já existe ("${alvo.nome}"). Abortando.`)

  await migrarReferencias(de, para)
  await prisma.disciplina.update({ where: { sigla: de }, data: { sigla: para } })
  console.log(`   ✓ Disciplina "${disc.nome}": ${de} → ${para}`)
  return true
}

async function main() {
  console.log("Estado ANTES:")
  for (const s of ["IG", "INSTG", "INTSISP"]) console.log(`  ${s}:`, JSON.stringify(await contar(s)))

  // 1) Libera "IG": Inteligência → INTSISP
  console.log("\n[1] Inteligência: IG → INTSISP")
  await renomearDisciplina("IG", "INTSISP", "Inteligência")

  // 2) Instrução Geral: INSTG → IG
  console.log("\n[2] Instrução Geral: INSTG → IG")
  await renomearDisciplina("INSTG", "IG", "Instrução Geral")

  console.log("\nEstado DEPOIS:")
  for (const s of ["IG", "INSTG", "INTSISP"]) console.log(`  ${s}:`, JSON.stringify(await contar(s)))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
