import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  // mat 54 (Elder Carvalho) saiu do pelotão Turma 13 (não aparece no Mapa de Equipes de julho/2026)
  const mat54 = await prisma.user.findUnique({ where: { matricula: 54 } })
  if (mat54) {
    await prisma.user.update({
      where: { matricula: 54 },
      data: { turma13: false, grupoPlantao: null, grupoFaxina: null, canga: null, cangaPar: null },
    })
    if (mat54.cangaPar) {
      await prisma.user.updateMany({
        where: { matricula: mat54.cangaPar, cangaPar: 54 },
        data: { canga: null, cangaPar: null },
      })
    }
    console.log("Mat 54 (Elder Carvalho): removido da Turma 13, escala/canga limpas.")
  } else {
    console.log("Mat 54 não encontrada — nada a fazer.")
  }

  // mat 213 (R Silva) — grupo de plantão confirmado no Mapa de Equipes JULHO/2026: JULIETT
  const r = await prisma.user.update({ where: { matricula: 213 }, data: { grupoPlantao: "JULIETT" } })
  console.log(`Mat 213 (${r.nomeGuerra}): grupoPlantao = JULIETT`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
