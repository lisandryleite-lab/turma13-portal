import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { FORMULARIO_CAMISA } from "../lib/formulario-cota"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const TITULO = "Camisa do Pelotão — 1º Pelotão · Aspirantes 2027"
const VALOR = 130
const RESPONSAVEL = "LISANDRY (108)"

async function main() {
  const existente = await prisma.cotaFinanceira.findFirst({ where: { titulo: TITULO } })

  // Participantes: toda a Turma 13 ativa.
  const alunos = await prisma.user.findMany({
    where: { ativo: true, turma13: true },
    select: { id: true },
  })

  if (existente) {
    await prisma.cotaFinanceira.update({
      where: { id: existente.id },
      data: { valor: VALOR, responsavel: RESPONSAVEL, formulario: FORMULARIO_CAMISA, ativa: true },
    })
    console.log(`✓ Cota já existia — formulário e valor atualizados (${existente.id}).`)
  } else {
    const cota = await prisma.cotaFinanceira.create({
      data: {
        titulo: TITULO,
        tipo: "extra",
        valor: VALOR,
        responsavel: RESPONSAVEL,
        // instrucoes fica VAZIO de propósito: é o que mantém a cota na fase de
        // levantamento (ver emLevantamento em lib/formulario-cota.ts). Quando o
        // responsável preencher o Pix aqui, ela vira cobrança sozinha.
        instrucoes: null,
        formulario: FORMULARIO_CAMISA,
        pagamentos: { create: alunos.map(a => ({ userId: a.id })) },
      },
    })
    console.log(`✓ Cota criada (${cota.id}) — ${alunos.length} participantes, ${VALOR.toFixed(2)} por peça.`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
