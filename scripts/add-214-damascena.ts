// ─────────────────────────────────────────────────────────────
//  Cria o login de 214 DAMASCENA na Turma 13 (ago/2026).
//
//  Matrícula e equipe confirmadas no "MAPA DE EQUIPES DE PLANTÃO - ESCALA 3X1 ·
//  AGOSTO/2026" (SEI, 1ª CIA, 21/08/2026): a célula "214 - DAMASCENA" fica na
//  linha 23, na faixa de x da coluna CHARLIE (x≈318, entre as fronteiras 301 e 369).
//
//  Não mexe em MATRICULAS_ORDEM (antiguidade), grupo de faxina nem canga — ver o
//  aviso no fim do script.
//
//  Uso: npx tsx scripts/add-214-damascena.ts
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MAT = 214
const NOME = "DAMASCENA"
const GRUPO = "CHARLIE"

async function main() {
  const existente = await prisma.user.findUnique({ where: { matricula: MAT } })

  if (existente) {
    await prisma.user.update({
      where: { matricula: MAT },
      data: { turma13: true, ativo: true, grupoPlantao: GRUPO },
    })
    console.log(`Mat ${MAT} já existia — turma13/ativo garantidos, plantão ${GRUPO}.`)
    return
  }

  // Senha temporária no mesmo padrão dos outros novatos (211, 212, 213).
  // O aluno TEM que trocar em /alterar-senha no primeiro acesso.
  const senhaTemp = "cfo2026!"
  const hash = await bcrypt.hash(senhaTemp, 12)

  const user = await prisma.user.create({
    data: {
      matricula: MAT,
      nomeGuerra: NOME,
      nomeCompleto: NOME,                                  // completar depois em /admin
      email: `aluno${MAT}@cfopm2026.placeholder`,          // trocar pelo e-mail real em /admin
      password: hash,
      turma13: true,
      ativo: true,
      grupoPlantao: GRUPO,
    },
  })
  console.log(`✓ Mat ${MAT} (${NOME}) criada — plantão ${GRUPO}.`)
  console.log(`  Senha temporária: ${senhaTemp} — pedir troca em /alterar-senha no 1º acesso.`)

  // Novato entra nas cotas financeiras ATIVAS, como foi feito com a 212.
  const cotasAtivas = await prisma.cotaFinanceira.findMany({ where: { ativa: true } })
  for (const c of cotasAtivas) {
    await prisma.pagamentoCota.upsert({
      where: { cotaId_userId: { cotaId: c.id, userId: user.id } },
      update: {},
      create: { cotaId: c.id, userId: user.id },
    })
  }
  console.log(`  Adicionada a ${cotasAtivas.length} cota(s) financeira(s) ativa(s).`)

  console.log(`
  PENDENTE (decisão da turma, não dá para deduzir do mapa da 1ª CIA):
   • Antiguidade — incluir 214 em MATRICULAS_ORDEM (lib/escalas.ts) DESLOCA toda a
     rotação de P1/P3/P4 das semanas seguintes. Só mexer se a turma confirmar.
   • Grupo de faxina (G1–G8) e canga — definir em /admin.
   • Nome completo e e-mail reais — hoje estão como placeholder.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
