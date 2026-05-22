import { PrismaClient } from "../lib/generated/prisma/index.js"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("1234", 12)
  const user = await prisma.user.upsert({
    where: { matricula: 999 },
    update: { password: hash, email: "lisandryleite@gmail.com", isAdmin: false },
    create: {
      matricula: 999,
      nomeGuerra: "LISANDRY TESTE",
      nomeCompleto: "Lisandry Leite (conta de teste)",
      email: "lisandryleite@gmail.com",
      password: hash,
      isAdmin: false,
      grupoFaxina: "G4",
      grupoPlantao: "LIMA",
    },
  })
  console.log("Usuário criado/atualizado:", user.matricula, user.nomeGuerra)
}

main().catch(console.error).finally(() => prisma.$disconnect())
