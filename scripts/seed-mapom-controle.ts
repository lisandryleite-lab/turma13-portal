import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// Controle de compras MAPOM — 1º Pel — CFO 2026 PMPE.
// Cada aluno paga um valor individual (equipamentos diferentes). Só entram
// os que efetivamente compraram (valor > 0). Responsável: 19 — Thais.
const TITULO = "Controle de compras MAPOM — 1º Pelotão"
const RESPONSAVEL = "Thais"
const SHEET = "https://docs.google.com/spreadsheets/d/1Z3-D7u4AjwSBe7zyroqkFen6LplnxfP40FX7si6YVfI/edit?gid=1821407108#gid=1821407108"
const INSTRUCOES = [
  "Pagamento via Pix (chave celular): 81985634355 — Thais.",
  "Após pagar, envie o comprovante na pasta do Google Drive (link será incluído em breve).",
  "Confira seu valor individual na lista abaixo (ou na planilha de controle):",
  SHEET,
  "Em breve também será incluído link para pagamento no cartão.",
].join("\n")

// matrícula -> valor gasto (somente quem comprou)
const VALORES: Record<number, number> = {
  7: 398.0,   // Aldo Silva
  13: 204.0,  // Jonas
  19: 161.0,  // Thais Figueiredo
  23: 142.0,  // Rodolfo Moura
  26: 92.0,   // André
  41: 433.0,  // Alan Silva
  55: 49.0,   // Shirlayne
  57: 67.0,   // Cleyton
  65: 187.0,  // Kauhanni
  71: 157.0,  // Leimig
  76: 302.0,  // Araújo Junior
  81: 25.0,   // Fernando Rocha
  94: 91.0,   // André Cardoso
  98: 32.0,   // José Menezes
  105: 425.5, // Lucas Eduardo
  106: 420.0, // Rafael Ribeiro
  108: 138.0, // Lisandry
  114: 123.0, // Josiane Farias
  131: 162.0, // José Inácio
  143: 388.0, // Vidal
  153: 152.0, // Hugo
  186: 329.0, // Samuel Silva
  191: 160.0, // Gomes Nascimento
}

async function main() {
  // Garante a coluna de valor individual (equivale ao `prisma db push` do campo
  // PagamentoCota.valor) — feito via driver serverless pois a porta 5432 direta
  // pode estar bloqueada no ambiente. Idempotente.
  await prisma.$executeRawUnsafe(`ALTER TABLE "PagamentoCota" ADD COLUMN IF NOT EXISTS "valor" DOUBLE PRECISION;`)
  console.log("✔ Coluna PagamentoCota.valor garantida")

  const matriculas = Object.keys(VALORES).map(Number)
  const alunos = await prisma.user.findMany({
    where: { matricula: { in: matriculas } },
    select: { id: true, matricula: true, nomeGuerra: true },
  })

  const achados = new Set(alunos.map(a => a.matricula))
  const faltando = matriculas.filter(m => !achados.has(m))
  if (faltando.length) console.warn(`⚠ Matrículas não encontradas no banco: ${faltando.join(", ")}`)

  const total = alunos.reduce((s, a) => s + VALORES[a.matricula], 0)

  const existente = await prisma.cotaFinanceira.findFirst({ where: { titulo: TITULO } })
  if (existente) {
    console.log(`Já existe a cota "${TITULO}" (id ${existente.id}). Nada a fazer.`)
    return
  }

  const cota = await prisma.cotaFinanceira.create({
    data: {
      titulo: TITULO,
      tipo: "extra",
      valor: 0, // base 0 — cada pagamento tem seu valor individual
      responsavel: RESPONSAVEL,
      instrucoes: INSTRUCOES,
      driveFolderUrl: null, // a incluir depois
      pagamentos: {
        create: alunos.map(a => ({ userId: a.id, valor: VALORES[a.matricula] })),
      },
    },
  })

  console.log(`✔ Cota criada: "${TITULO}" (id ${cota.id})`)
  console.log(`  ${alunos.length} alunos · total ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
