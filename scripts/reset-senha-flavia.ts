// Redefine a senha de Flávia Costa para o padrão do portal (senha = matrícula)
// e atualiza o e-mail dela. Localiza o cadastro pelo nome; aborta se não achar
// exatamente um.
// Uso: npx tsx scripts/reset-senha-flavia.ts
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const NOVO_EMAIL = "flaviacosta.pmpe@gmail.com"

async function main() {
  const candidatos = await prisma.user.findMany({
    where: {
      AND: [
        { OR: [
          { nomeCompleto: { contains: "Flávia", mode: "insensitive" } },
          { nomeCompleto: { contains: "Flavia", mode: "insensitive" } },
          { nomeGuerra: { contains: "Flávia", mode: "insensitive" } },
          { nomeGuerra: { contains: "Flavia", mode: "insensitive" } },
        ] },
        { OR: [
          { nomeCompleto: { contains: "Costa", mode: "insensitive" } },
          { nomeGuerra: { contains: "Costa", mode: "insensitive" } },
        ] },
      ],
    },
    select: { matricula: true, nomeGuerra: true, nomeCompleto: true, email: true },
  })

  if (candidatos.length !== 1) {
    console.error(`Esperava 1 cadastro de Flávia Costa, achei ${candidatos.length}:`)
    for (const c of candidatos) console.error(`  ${c.matricula} ${c.nomeGuerra} — ${c.nomeCompleto} <${c.email}>`)
    process.exit(1)
  }

  const alvo = candidatos[0]
  const senha = String(alvo.matricula)
  const hash = await bcrypt.hash(senha, 12)
  const u = await prisma.user.update({
    where: { matricula: alvo.matricula },
    data: { password: hash, email: NOVO_EMAIL },
    select: { matricula: true, nomeGuerra: true, email: true, password: true },
  })
  const ok = await bcrypt.compare(senha, u.password)
  console.log(`Mat ${u.matricula} (${u.nomeGuerra}) — e-mail: ${alvo.email} → ${u.email}`)
  console.log(`Senha resetada para "${senha}" | confere: ${ok}`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
