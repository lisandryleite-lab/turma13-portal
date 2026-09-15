// ─────────────────────────────────────────────────────────────
//  Backfill do campo `senhaTrocada` (set/2026).
//
//  O campo nasce `false` para todo mundo, o que marcaria como "senha inicial"
//  até quem já trocou — e obrigaria o portal inteiro a trocar de novo. Este
//  script decide caso a caso: compara a senha gravada com a própria matrícula
//  (o padrão do portal) e marca `senhaTrocada: true` para quem NÃO bate.
//
//  Rodar UMA vez, depois de `npm run db:push` (cria a coluna) E de
//  `npm run db:generate`. O db:push não regenera o Prisma Client aqui, e sem o
//  generate o script morre com "Unknown field `senhaTrocada`".
//  É idempotente: rodar de novo apenas reconfirma o mesmo resultado.
//
//  Uso: npx tsx scripts/marcar-senha-trocada.ts
//  (atrás de proxy HTTPS, prefixe com NODE_USE_ENV_PROXY=1)
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
if (process.env.HTTPS_PROXY || process.env.https_proxy) {
  neonConfig.poolQueryViaFetch = true
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const alunos = await prisma.user.findMany({
    select: { id: true, matricula: true, nomeGuerra: true, password: true, senhaTrocada: true },
    orderBy: { matricula: "asc" },
  })

  const pendentes: string[] = []
  let marcados = 0

  for (const a of alunos) {
    // bcrypt.compare é lento de propósito (~0,3 s por conta); são poucos alunos.
    const aindaEhAMatricula = await bcrypt.compare(String(a.matricula), a.password)

    if (aindaEhAMatricula) {
      pendentes.push(`${a.matricula} ${a.nomeGuerra}`)
      if (a.senhaTrocada) {
        await prisma.user.update({ where: { id: a.id }, data: { senhaTrocada: false } })
      }
      continue
    }

    if (!a.senhaTrocada) {
      await prisma.user.update({ where: { id: a.id }, data: { senhaTrocada: true } })
      marcados++
    }
  }

  console.log(`✓ ${alunos.length} contas verificadas · ${marcados} marcadas como "senha já trocada".`)
  console.log(`  ${pendentes.length} ainda estão com a matrícula como senha e vão trocar no próximo acesso:`)
  for (const p of pendentes) console.log(`    · ${p}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
