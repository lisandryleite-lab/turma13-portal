/**
 * Grava a ficha padrão de um batalhão a partir de scripts/fichas/<slug>.ts.
 *   npx tsx scripts/gravar-ficha.ts bptur
 *   npx tsx scripts/gravar-ficha.ts 1bpm
 * Sobrescreve a ficha, mas preserva o que o admin colou pelo portal
 * (link do Street View e do grupo de WhatsApp).
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import type { Ficha } from "./fichas/tipos"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const slug = process.argv[2]
  if (!slug) throw new Error("uso: npx tsx scripts/gravar-ficha.ts <slug>")
  const { SIGLA, FICHA } = (await import(`./fichas/${slug}`)) as { SIGLA: string; FICHA: Ficha }
  const opm = await prisma.oPM.findUnique({ where: { sigla: SIGLA } })
  if (!opm) throw new Error(`OPM ${SIGLA} não encontrada`)
  const atual = await prisma.opmInfo.findUnique({ where: { opmId: opm.id }, select: { streetView: true, linkGrupo: true } })
  const dados = { ...FICHA, streetView: atual?.streetView ?? null, linkGrupo: atual?.linkGrupo ?? null, atualizadoPor: "Portal — pesquisa com fontes" }
  await prisma.opmInfo.upsert({ where: { opmId: opm.id }, update: dados, create: { opmId: opm.id, ...dados } })
  console.log(`Ficha do ${SIGLA} gravada.`)
}
main().finally(() => prisma.$disconnect())
