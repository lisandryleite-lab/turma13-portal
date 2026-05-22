import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash("1234", 12)
  const user = await prisma.user.upsert({
    where: { matricula: 999 },
    update: { password: hash, isAdmin: false },
    create: {
      matricula: 999,
      nomeGuerra: "LISANDRY TESTE",
      nomeCompleto: "Lisandry Leite (conta de teste)",
      email: "lisandry.teste@gmail.com",
      password: hash,
      isAdmin: false,
      grupoFaxina: "G4",
      grupoPlantao: "LIMA",
    },
  })
  console.log("✓ Usuário:", user.matricula, user.nomeGuerra, "isAdmin:", user.isAdmin)
}

main().catch(console.error).finally(() => prisma.$disconnect())
