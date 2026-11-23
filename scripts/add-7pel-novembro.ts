// ─────────────────────────────────────────────────────────────
//  Inclui no portal três alunos do 7º PELOTÃO (nov/2026):
//    217 SALUSTIANO · 221 AMANDA ÂNGELO · 224 LÍGIA
//
//  Mesmo padrão das demais contas do 7º Pel: `turma: 3` (CFO 2026),
//  `turma13: false` (só a área CFO) e `pelotao: 7` (fica fora do
//  levantamento de batalhões e do total do ranking — ver
//  lib/batalhoes-base.ts e efetivoRanking em lib/escalas-cia.ts).
//
//  Senha inicial = a própria matrícula; o aluno troca em /trocar-senha.
//  Idempotente: rodar de novo atualiza os dados e preserva a senha
//  (RESET_SENHA=1 volta a senha para a matrícula).
//
//  Uso (PowerShell):
//    $env:ENV_FILE="C:\Users\lisan\turma13\.env"
//    npx tsx scripts/add-7pel-novembro.ts 217=<email> 221=<email> 224=<email>
// ─────────────────────────────────────────────────────────────
import { config } from "dotenv"
config({ path: process.env.ENV_FILE || ".env" })
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws

// nc (nomeCompleto) provisório — ajustar no Controle de Tropa quando houver o nome oficial.
// Os e-mails NÃO ficam no repositório: passe "matricula=email" na linha de comando, ex.:
//   npx tsx scripts/add-7pel-novembro.ts 217=fulano@gmail.com 221=... 224=...
const BASE = [
  { mat: 217, ng: "SALUSTIANO",    nc: "Joel Salustiano" },
  { mat: 221, ng: "AMANDA ÂNGELO", nc: "Amanda Ângelo" },
  { mat: 224, ng: "LÍGIA",         nc: "Lígia" },
]
const emailDe = new Map(
  process.argv.slice(2).map(arg => arg.split("=")).map(([m, e]) => [Number(m), e?.trim().toLowerCase()] as const),
)
const ALUNOS = BASE.map(a => {
  const email = emailDe.get(a.mat)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Informe o e-mail da matrícula ${a.mat}: ${a.mat}=email@exemplo.com`)
  return { ...a, email }
})

const RESET_SENHA = process.env.RESET_SENHA === "1"

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL vazia — defina ENV_FILE apontando para o .env com o banco.")
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
  try {
    for (const a of ALUNOS) {
      const senha = String(a.mat)
      const hash = await bcrypt.hash(senha, 12)

      const donoEmail = await prisma.user.findUnique({ where: { email: a.email }, select: { matricula: true, nomeGuerra: true } })
      if (donoEmail && donoEmail.matricula !== a.mat) {
        console.warn(`⚠ ${a.mat} ${a.ng} ignorado: o e-mail ${a.email} já é da matrícula ${donoEmail.matricula} (${donoEmail.nomeGuerra}).`)
        continue
      }

      const dados = { nomeGuerra: a.ng, nomeCompleto: a.nc, email: a.email, turma: 3, turma13: false, pelotao: 7, ativo: true }
      const existente = await prisma.user.findUnique({ where: { matricula: a.mat } })

      if (existente) {
        await prisma.user.update({ where: { matricula: a.mat }, data: { ...dados, ...(RESET_SENHA ? { password: hash } : {}) } })
        console.log(`↻ ${a.mat} ${a.ng} já existia — dados atualizados${RESET_SENHA ? ` · senha "${senha}"` : " · senha preservada"}.`)
      } else {
        await prisma.user.create({ data: { matricula: a.mat, password: hash, ...dados } })
        console.log(`✓ ${a.mat} ${a.ng} criado · ${a.email} · senha inicial = matrícula`)
      }
    }
    console.log(`\nContas do 7º Pel no banco: ${await prisma.user.count({ where: { pelotao: 7 } })}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => { console.error("✗", e.message); process.exit(1) })
