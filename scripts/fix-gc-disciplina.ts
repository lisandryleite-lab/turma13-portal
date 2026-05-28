import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Corrigir sigla CMSCM → GC e status para Em andamento
  await prisma.disciplina.update({
    where: { sigla: "CMSCM" },
    data: { sigla: "GC", status: "Em andamento", cargaMinistrada: 0 },
  })
  console.log("✓ Disciplina: CMSCM → GC, status: Em andamento, cargaMinistrada: 0")

  // Atualizar notas que referenciam a sigla antiga
  const notasAtualizadas = await prisma.nota.updateMany({
    where: { disciplina: "CMSCM" },
    data: { disciplina: "GC" },
  })
  console.log(`✓ ${notasAtualizadas.count} nota(s) migradas de CMSCM → GC`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
