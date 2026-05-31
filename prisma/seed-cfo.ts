/**
 * Seed CFO 2026 — importa os alunos da Turma 3 (T3) de forma IDEMPOTENTE.
 *
 * - NÃO deleta nada. Faz upsert por matrícula.
 * - Em alunos já existentes: atualiza só nomeCompleto/nomeGuerra/email/turma/ativo.
 *   NÃO mexe em senha, isAdmin, canga, grupoPlantao, etc.
 * - Em alunos novos: cria com senha = matrícula (bcrypt), turma 3, ativo true.
 * - Exclui matrícula 0 (admin fictício) e linhas sem email.
 *
 * Fonte: .dados-fonte/alunos.json (gerado da aba "T3 CFO GERAL" — NÃO commitada).
 * Rodar: npx tsx prisma/seed-cfo.ts
 */
import "dotenv/config"
import { readFileSync } from "fs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

type Aluno = { mat: number; nomeCompleto: string; nomeGuerra: string; sexo: string; pelotao: number | null; email: string }

async function main() {
  const alunos: Aluno[] = JSON.parse(readFileSync(".dados-fonte/alunos.json", "utf8"))
    .filter((a: Aluno) => a.mat > 0 && a.email.includes("@"))

  console.log(`Importando ${alunos.length} alunos T3 (upsert, não-destrutivo)...\n`)

  const existentes = new Set((await prisma.user.findMany({ select: { matricula: true } })).map(u => u.matricula))
  let criados = 0, atualizados = 0
  const falhas: string[] = []

  for (const a of alunos) {
    const novo = !existentes.has(a.mat)
    const dadosUpdate = {
      nomeCompleto: a.nomeCompleto,
      nomeGuerra: a.nomeGuerra,
      email: a.email,
      turma: 3,
      ativo: true,
    }
    try {
      const senhaHash = await bcrypt.hash(String(a.mat), 12)
      await prisma.user.upsert({
        where: { matricula: a.mat },
        update: dadosUpdate,
        create: { matricula: a.mat, password: senhaHash, isAdmin: false, ...dadosUpdate },
      })
      novo ? criados++ : atualizados++
    } catch (e: any) {
      // Conflito de email único (email já pertence a outra matrícula): grava sem o email
      if (e?.code === "P2002") {
        try {
          const { email, ...semEmail } = dadosUpdate
          const senhaHash = await bcrypt.hash(String(a.mat), 12)
          await prisma.user.upsert({
            where: { matricula: a.mat },
            update: semEmail,
            create: { matricula: a.mat, password: senhaHash, isAdmin: false, email: `mat${a.mat}@cfo2026.local`, ...semEmail },
          })
          novo ? criados++ : atualizados++
          falhas.push(`${a.mat} ${a.nomeGuerra}: email "${a.email}" em conflito — gravado sem email oficial`)
        } catch (e2: any) {
          falhas.push(`${a.mat} ${a.nomeGuerra}: ${e2?.message || e2}`)
        }
      } else {
        falhas.push(`${a.mat} ${a.nomeGuerra}: ${e?.message || e}`)
      }
    }
  }

  const total = await prisma.user.count()
  console.log(`\n=== RESUMO ===`)
  console.log(`Criados:     ${criados}`)
  console.log(`Atualizados: ${atualizados}`)
  console.log(`Total de usuários no banco agora: ${total}`)
  if (falhas.length) {
    console.log(`\n⚠️  ${falhas.length} avisos:`)
    falhas.forEach(f => console.log("  - " + f))
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => process.exit(0))
