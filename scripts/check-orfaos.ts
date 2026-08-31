// SOMENTE LEITURA — verifica linhas apontando para usuarios inexistentes nas
// tabelas cujo `userId` hoje e String solta (sem FK no banco), e mede o volume
// das tabelas que vao ganhar indice.
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const ids = new Set((await prisma.user.findMany({ select: { id: true } })).map(u => u.id))
  console.log(`Usuarios: ${ids.size}`)

  const faxina = await prisma.escalaTurmaFaxina.findMany({ select: { id: true, userId: true, data: true, posicao: true } })
  const servico = await prisma.escalaTurmaServico.findMany({ select: { id: true, userId: true, data: true, posicao: true } })

  for (const [nome, linhas] of [["EscalaTurmaFaxina", faxina], ["EscalaTurmaServico", servico]] as const) {
    const orfaos = linhas.filter(l => !ids.has(l.userId))
    console.log(`\n${nome}: ${linhas.length} linhas, ${orfaos.length} orfas`)
    for (const o of orfaos.slice(0, 20)) {
      console.log(`  ORFA id=${o.id} userId="${o.userId}" data=${o.data.toISOString().slice(0,10)} posicao=${o.posicao}`)
    }
    if (orfaos.length > 20) console.log(`  ... e mais ${orfaos.length - 20}`)
  }

  const contagens = {
    Nota: await prisma.nota.count(),
    HistoricoNota: await prisma.historicoNota.count(),
    EscalaAluno: await prisma.escalaAluno.count(),
    NotaCFO: await prisma.notaCFO.count(),
    Questao: await prisma.questao.count(),
    Resposta: await prisma.resposta.count(),
    Flashcard: await prisma.flashcard.count(),
    LogAcesso: await prisma.logAcesso.count(),
    PagamentoCota: await prisma.pagamentoCota.count(),
  }
  console.log("\nVolume:")
  for (const [k, v] of Object.entries(contagens)) console.log(`  ${k}: ${v}`)
}

main().finally(() => prisma.$disconnect())
