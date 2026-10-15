/**
 * Grava em cada batalhão (OpmInfo.aspirantado) os aspirantes das turmas anteriores
 * com função publicada no Boletim Geral da SDS:
 *   T1 — 148 formados em 28/11/2025, nomeados no BGSDS nº 221 (29/11/2025),
 *        promovidos a 2º Ten com efeito a 29/05/2026 (BGSDS nº 099, 03/06/2026);
 *   T2 — 182 formados em 08/06/2026, nomeados no BGSDS nº 103 (09/06/2026).
 * Dados em scripts/fichas/aspirantado.json — gerado varrendo os BGSDS de dez/2025 a out/2026
 * (atos "Designar" de Aspirante a Oficial / 2º Ten das duas turmas, por OME).
 *   npx tsx scripts/gravar-aspirantado.ts
 */
import "dotenv/config"
import { readFileSync } from "fs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const dados = JSON.parse(readFileSync(new URL("./fichas/aspirantado.json", import.meta.url), "utf8")) as Record<string, object>
  for (const [sigla, asp] of Object.entries(dados)) {
    const opm = await prisma.oPM.findUnique({ where: { sigla } })
    if (!opm) { console.log(`OPM ${sigla} não encontrada`); continue }
    await prisma.opmInfo.upsert({ where: { opmId: opm.id }, update: { aspirantado: asp }, create: { opmId: opm.id, aspirantado: asp } })
    console.log(`${sigla}: gravado`)
  }
}
main().finally(() => prisma.$disconnect())
