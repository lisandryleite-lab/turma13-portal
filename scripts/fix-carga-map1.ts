import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// MAP1 (Manobras Acadêmicas Policiais Militares I) foi concluída na semana 31
// (10 a 16/08/2026) — informado pelo Lisandry em 17/08/2026.
// A semana 31 não tem QTS lançado no portal, então as 50h nunca entraram na
// contagem automática e a disciplina seguia como "Início" com 0h.
// Idempotente: usa a cargaTotal do banco como valor final.
const SIGLA = "MAP1"

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: SIGLA } })
  if (!disc) { console.log(`⚠ disciplina ${SIGLA} não encontrada — nada a fazer.`); return }

  if (disc.cargaMinistrada === disc.cargaTotal && disc.status === "Concluída") {
    console.log(`= ${SIGLA} já está ${disc.cargaMinistrada}/${disc.cargaTotal} (Concluída) — nada a fazer.`)
    return
  }

  await prisma.disciplina.update({
    where: { sigla: SIGLA },
    data: { cargaMinistrada: disc.cargaTotal, status: "Concluída" },
  })
  console.log(`✓ ${SIGLA}: ${disc.cargaMinistrada}/${disc.cargaTotal} (${disc.status}) → ${disc.cargaTotal}/${disc.cargaTotal} (Concluída)`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
