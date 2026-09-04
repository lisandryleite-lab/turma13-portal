// ─────────────────────────────────────────────────────────────
//  Inclui os alunos da TURMA 19 no portal (set/2026).
//
//  NÃO são do pelotão Turma 13: entram com `turma13: false`, ou seja,
//  acessam apenas a área CFO — /inicio, /mementos, /questoes, /ranking,
//  /permutas, /documentos, /trocar-senha. O grupo (logado) — dashboard,
//  escalas, avisos, QTS, financeiro — continua bloqueado para eles pelo
//  próprio layout (app/(logado)/layout.tsx).
//
//  `turma: 3` = turma do CFO 2026, portanto contam no ranking e no
//  turmaSize de /ranking e /painel junto com a Turma 13.
//
//  Senha inicial = a própria matrícula (padrão do portal); o aluno troca
//  em /trocar-senha.
//
//  Idempotente: rodar de novo não duplica nem sobrescreve senha já trocada.
//  Para forçar a redefinição da senha para a matrícula:  RESET_SENHA=1 npx tsx scripts/add-turma19.ts
//
//  Uso: npx tsx scripts/add-turma19.ts
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// nc (nomeCompleto) inferido do e-mail — conferir e ajustar em /admin quando
// houver a relação nominal oficial da Turma 19.
const TURMA19 = [
  { mat: 199, ng: "BARROS",     nc: "Sergio Barros",           email: "sergiobarros109@gmail.com" },
  { mat: 203, ng: "J LUIZ",     nc: "Jonhny Luiz da Silva",    email: "jonhnyluizdasilva@gmail.com" },
  { mat: 217, ng: "SALUSTIANO", nc: "Joel Salustiano",         email: "pmjoelsalustiano@gmail.com" },
  { mat: 218, ng: "COELHO",     nc: "Ricardo Ferreira Coelho", email: "ricardoferreiracoelho85@gmail.com" },
  { mat: 219, ng: "BRENER",     nc: "Guilherme Brenner Neves", email: "guilhermebrennerneves@gmail.com" },
  { mat: 220, ng: "RATIS",      nc: "Matheus Ratis",           email: "matheusratis16@gmail.com" },
]

const RESET_SENHA = process.env.RESET_SENHA === "1"

async function main() {
  for (const a of TURMA19) {
    const senha = String(a.mat) // padrão do portal: senha = matrícula
    const hash = await bcrypt.hash(senha, 12)

    const existente = await prisma.user.findUnique({ where: { matricula: a.mat } })

    if (existente) {
      await prisma.user.update({
        where: { matricula: a.mat },
        data: {
          nomeGuerra: a.ng,
          nomeCompleto: a.nc,
          email: a.email,
          turma: 3,
          turma13: false,
          ativo: true,
          ...(RESET_SENHA ? { password: hash } : {}),
        },
      })
      console.log(`↻ ${a.mat} ${a.ng} já existia — dados atualizados${RESET_SENHA ? ` · senha redefinida para "${senha}"` : " · senha preservada"}.`)
      continue
    }

    // e-mail é @unique: avisa em vez de estourar erro de constraint
    const emailEmUso = await prisma.user.findUnique({ where: { email: a.email } })
    if (emailEmUso) {
      console.warn(`⚠ ${a.mat} ${a.ng} NÃO criado: o e-mail ${a.email} já pertence à matrícula ${emailEmUso.matricula} (${emailEmUso.nomeGuerra}).`)
      continue
    }

    await prisma.user.create({
      data: {
        matricula: a.mat,
        nomeGuerra: a.ng,
        nomeCompleto: a.nc,
        email: a.email,
        password: hash,
        turma: 3,
        turma13: false, // não é do 1º Pelotão — só a área CFO
        ativo: true,
      },
    })
    console.log(`✓ ${a.mat} ${a.ng} criado · ${a.email} · senha inicial "${senha}"`)
  }

  const total = await prisma.user.count({ where: { turma: 3, turma13: false } })
  console.log(`\nUsuários do CFO fora da Turma 13 no banco: ${total}`)
  console.log("Peça aos alunos que entrem com a matrícula como usuário e senha e troquem em /trocar-senha.")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
