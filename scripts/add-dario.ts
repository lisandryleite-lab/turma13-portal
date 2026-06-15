import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MAT = 211
const SENHA = String(MAT) // padrão do portal: senha = matrícula; aluno troca depois

async function main() {
  const existe = await prisma.user.findUnique({ where: { matricula: MAT } })
  if (existe) { console.log(`Matrícula ${MAT} já existe (${existe.nomeGuerra}). Nada feito.`); return }

  const hash = await bcrypt.hash(SENHA, 12)
  const u = await prisma.user.create({
    data: {
      matricula: MAT,
      nomeGuerra: "Dário",
      nomeCompleto: "Dário",      // completar depois no painel admin
      email: `dario.${MAT}@turma13.app`,
      password: hash,
      turma: 3,
      turma13: true,
      ativo: true,
    },
  })
  console.log(`✓ Aluno criado: ${u.nomeGuerra} (mat. ${u.matricula}) · email ${u.email} · senha provisória "${SENHA}"`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
