// Cadastra o e-mail real da 212 CAMILA BUONORA (substitui o placeholder),
// permitindo login-suporte e recuperação de senha via /forgot-password.
// Uso: npx tsx scripts/set-email-212.ts
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const u = await prisma.user.update({
    where: { matricula: 212 },
    data: { email: "camilarbuonora@hotmail.com" },
    select: { matricula: true, nomeGuerra: true, email: true },
  })
  console.log(`Mat ${u.matricula} (${u.nomeGuerra}) — e-mail atualizado para ${u.email}`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
