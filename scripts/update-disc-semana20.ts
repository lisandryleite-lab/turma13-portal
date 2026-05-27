import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Valores extraídos do QTS semana 20 (25-31/05/2026)
// Cada "aula X/Y" representa hora X de Y total ao final da semana
const UPDATES = [
  { sigla: "DADM",  cargaMinistrada: 42, status: "Em andamento" },
  { sigla: "GPGA",  cargaMinistrada: 24, status: "Em andamento" },
  { sigla: "TFM2",  cargaMinistrada: 14, status: "Em andamento" },
  { sigla: "LPMO",  cargaMinistrada: 22, status: "Em andamento" },
  { sigla: "GRAPP", cargaMinistrada: 18, status: "Em andamento" },
  { sigla: "PO",    cargaMinistrada: 18, status: "Em andamento" },
  { sigla: "OU2",   cargaMinistrada:  4, status: "Em andamento" },
]

async function main() {
  console.log("Atualizando disciplinas para semana 20...")
  for (const u of UPDATES) {
    await prisma.disciplina.update({
      where: { sigla: u.sigla },
      data: { cargaMinistrada: u.cargaMinistrada, status: u.status },
    })
    console.log(`✓ ${u.sigla}: ${u.cargaMinistrada}h — ${u.status}`)
  }
  console.log("\nDisciplinas atualizadas. Notas e alunos não foram tocados.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
