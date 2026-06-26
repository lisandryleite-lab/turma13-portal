import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const COTAS = [
  { titulo: "Cota mensal do pelotão — Junho", valor: 30, responsavel: "Kauhanni" },
  { titulo: "Cota do São João", valor: 15, responsavel: "Kauhanni" },
  { titulo: "DAG (Julho)", valor: 50, responsavel: "Aldo" },
  { titulo: "Numéricas e palas do MAPOM", valor: 75, responsavel: "Shirlayne" },
  { titulo: "Formatura", valor: 400, responsavel: "João Nunes", instrucoes: "Pagamento via app Super A. Após pagar, enviar o comprovante para João Nunes." },
  { titulo: "Fardamento", valor: 480, responsavel: "Margareth", instrucoes: "Pix para Margareth. Após pagar, anexar o comprovante no formulário do Google." },
  { titulo: "Mochila do MAPOM", valor: 115, responsavel: "Vidal" },
]

async function main() {
  const alunos = await prisma.user.findMany({ where: { ativo: true, turma13: true }, select: { id: true } })
  if (alunos.length === 0) throw new Error("Nenhum aluno ativo encontrado.")

  for (const c of COTAS) {
    const existente = await prisma.cotaFinanceira.findFirst({ where: { titulo: c.titulo } })
    if (existente) { console.log(`Já existe: ${c.titulo}`); continue }
    await prisma.cotaFinanceira.create({
      data: {
        titulo: c.titulo,
        valor: c.valor,
        responsavel: c.responsavel,
        instrucoes: c.instrucoes ?? null,
        pagamentos: { create: alunos.map(a => ({ userId: a.id })) },
      },
    })
    console.log(`Criada: ${c.titulo} (${alunos.length} alunos)`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
