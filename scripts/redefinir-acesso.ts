// ─────────────────────────────────────────────────────────────
//  Cadastra o e-mail de um aluno e volta a senha para a ORIGINAL
//  (a própria matrícula), como no cadastro inicial.
//
//  Uso (PowerShell):
//    $env:ENV_FILE="C:\Users\lisan\turma13\.env"
//    npx tsx scripts/redefinir-acesso.ts 202 gabriel_fba@hotmail.com
//
//  O e-mail é opcional: sem ele, só redefine a senha.
// ─────────────────────────────────────────────────────────────
import { config } from "dotenv"
config({ path: process.env.ENV_FILE || ".env" })
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

async function main() {
  const matricula = Number(process.argv[2])
  const email = process.argv[3]?.trim().toLowerCase()
  if (isNaN(matricula) || matricula <= 0) throw new Error("Informe a matrícula. Ex.: npx tsx scripts/redefinir-acesso.ts 202 email@x.com")
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`E-mail inválido: ${email}`)
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL vazia — defina ENV_FILE apontando para o .env com o banco.")

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
  try {
    const antes = await prisma.user.findUnique({ where: { matricula }, select: { nomeGuerra: true, email: true } })
    if (!antes) throw new Error(`Matrícula ${matricula} não encontrada.`)

    if (email) {
      const dono = await prisma.user.findUnique({ where: { email }, select: { matricula: true } })
      if (dono && dono.matricula !== matricula) throw new Error(`O e-mail ${email} já é da matrícula ${dono.matricula}.`)
    }

    const password = await bcrypt.hash(String(matricula), 12)
    await prisma.user.update({ where: { matricula }, data: { password, ...(email ? { email } : {}) } })

    console.log(`✓ ${matricula} ${antes.nomeGuerra}`)
    if (email) console.log(`  e-mail: ${antes.email} → ${email}`)
    console.log(`  senha redefinida para a original (a matrícula)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => { console.error("✗", e.message); process.exit(1) })
