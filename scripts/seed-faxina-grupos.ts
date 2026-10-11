/**
 * Grava no banco as equipes de faxina da Turma 13 (FaxinaGrupoMembro) e o
 * grupoFaxina de cada aluno, a partir de COMPOSICAO_FAXINA (lib/escalas.ts).
 *
 * Out/2026: "ESCALA SEMANAL DE MANUTENÇÃO DA SALA DE INSTRUÇÃO - TURMA 13" —
 * cinco equipes fixas, SEGUNDA a SEXTA (substituiu os grupos G1–G8).
 * Idempotente: apaga e reinsere a composição inteira.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { COMPOSICAO_FAXINA } from "../lib/escalas"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  await prisma.faxinaGrupoMembro.deleteMany()
  const mats: number[] = []
  for (const [grupo, membros] of Object.entries(COMPOSICAO_FAXINA)) {
    for (const m of membros) {
      await prisma.faxinaGrupoMembro.create({ data: { grupo, mat: m.mat, nome: m.nome } })
      await prisma.user.updateMany({ where: { matricula: m.mat }, data: { grupoFaxina: grupo } })
      mats.push(m.mat)
    }
    console.log(`✓ ${grupo.padEnd(7)} ${membros.length} membros`)
  }
  // quem não está em nenhuma equipe perde o grupo antigo (G1–G8)
  const limpos = await prisma.user.updateMany({ where: { grupoFaxina: { not: null }, matricula: { notIn: mats } }, data: { grupoFaxina: null } })
  const semEquipe = await prisma.user.findMany({ where: { turma13: true, matricula: { notIn: mats } }, select: { matricula: true, nomeGuerra: true } })
  console.log(`\n✓ ${mats.length} alunos nas equipes · ${limpos.count} grupo(s) antigo(s) limpos`)
  if (semEquipe.length) console.log(`⚠ Turma 13 sem equipe de faxina: ${semEquipe.map(u => `${u.matricula} ${u.nomeGuerra}`).join(", ")}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
