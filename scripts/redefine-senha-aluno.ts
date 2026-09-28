/**
 * redefine-senha-aluno.ts — devolve o acesso de um aluno ao portal.
 *
 * A senha NÃO pode ser consultada: o portal guarda um hash bcrypt, que é de
 * mão única. O que se faz é redefinir para o padrão do portal — a própria
 * matrícula —, e o aluno troca depois em /trocar-senha.
 *
 * O aluno é procurado pelo que você passar na linha de comando: um número é
 * tratado como matrícula, qualquer outra coisa como parte do nome (de guerra
 * ou completo), sem diferenciar maiúsculas nem acentos. Se a busca não achar
 * exatamente uma pessoa, o script NÃO altera nada e mostra o que encontrou.
 *
 * Rodar:     npx tsx scripts/redefine-senha-aluno.ts "flavia costa"
 *            npx tsx scripts/redefine-senha-aluno.ts 45
 * Simulação: DRY=1 npx tsx scripts/redefine-senha-aluno.ts "flavia costa"
 */
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const ALVO = process.argv.slice(2).join(" ").trim()
if (!ALVO) {
  console.error('Uso: npx tsx scripts/redefine-senha-aluno.ts "<nome ou matrícula>"')
  process.exit(1)
}

const chave = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim()

async function main() {
  const todos = await prisma.user.findMany({
    select: { id: true, matricula: true, nomeGuerra: true, nomeCompleto: true, ativo: true },
    orderBy: { matricula: "asc" },
  })

  const busca = chave(ALVO)
  const porMatricula = /^\d+$/.test(ALVO)
  const achados = porMatricula
    ? todos.filter(u => u.matricula === Number(ALVO))
    : todos.filter(u => chave(u.nomeGuerra).includes(busca) || chave(u.nomeCompleto).includes(busca))

  if (achados.length === 0) {
    console.log(`Nenhum aluno encontrado para "${ALVO}". Nada foi alterado.`)
    console.log("Tente parte do nome de guerra, ou a matrícula.")
    return
  }
  if (achados.length > 1) {
    console.log(`"${ALVO}" corresponde a ${achados.length} alunos — nada foi alterado.`)
    console.log("Rode de novo com a matrícula de quem você quer:")
    for (const u of achados) console.log(`  ${String(u.matricula).padStart(4)}  ${u.nomeGuerra}${u.ativo ? "" : "  (inativo)"}`)
    return
  }

  const aluno = achados[0]
  const senha = String(aluno.matricula) // padrão do portal: senha = matrícula

  if (process.env.DRY) {
    console.log(`[DRY-RUN] Redefiniria a senha de ${aluno.matricula} ${aluno.nomeGuerra} para a matrícula. Nada foi alterado.`)
    return
  }

  await prisma.user.update({
    where: { id: aluno.id },
    data: { password: await bcrypt.hash(senha, 12) },
  })

  console.log(`✓ Senha redefinida: ${aluno.matricula} ${aluno.nomeGuerra}`)
  console.log(`  Entra com usuário ${aluno.matricula} e senha ${senha} — a própria matrícula.`)
  console.log(`  Peça que troque em /trocar-senha assim que entrar.`)
  if (!aluno.ativo) console.log(`  ⚠ Este aluno está marcado como INATIVO no portal — confira se é quem você espera.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
