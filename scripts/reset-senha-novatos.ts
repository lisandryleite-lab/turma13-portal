// Reseta a senha de 212 e 213 para o padrão do portal: senha inicial = matrícula.
// (211 já segue o padrão e já logou — não é alterado.)
// Uso: npx tsx scripts/reset-senha-novatos.ts
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  for (const mat of [212, 213]) {
    const hash = await bcrypt.hash(String(mat), 12)
    const u = await prisma.user.update({
      where: { matricula: mat },
      data: { password: hash },
      select: { matricula: true, nomeGuerra: true, password: true },
    })
    const ok = await bcrypt.compare(String(mat), u.password)
    console.log(`Mat ${u.matricula} (${u.nomeGuerra}) — senha resetada para "${mat}" | confere: ${ok}`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
