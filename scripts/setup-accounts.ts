import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Atualizar mat:108 LISANDRY → senha 052812, isAdmin: false
  const hashAluna = await bcrypt.hash("052812", 12)
  await prisma.user.update({
    where: { matricula: 108 },
    data: { password: hashAluna, isAdmin: false },
  })
  console.log("✓ Mat:108 LISANDRY — senha atualizada, isAdmin: false")

  // 2. Criar admin fictício
  const hashAdmin = await bcrypt.hash("108ADM", 12)
  await prisma.user.upsert({
    where: { email: "lisandryferraz@icloud.com" },
    update: { password: hashAdmin, isAdmin: true },
    create: {
      matricula: 0,
      nomeGuerra: "ADMINISTRAÇÃO",
      nomeCompleto: "Administração do Portal CFO 2026",
      email: "lisandryferraz@icloud.com",
      password: hashAdmin,
      isAdmin: true,
    },
  })
  console.log("✓ Admin fictício (mat:0) criado — lisandryferraz@icloud.com")
}

main().catch(console.error).finally(() => prisma.$disconnect())
