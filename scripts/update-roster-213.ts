import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  // mat 1 (Hellton Fernandes) saiu do pelotão Turma 13
  const mat1 = await prisma.user.findUnique({ where: { matricula: 1 } })
  if (mat1) {
    await prisma.user.update({
      where: { matricula: 1 },
      data: { turma13: false, grupoPlantao: null, grupoFaxina: null, canga: null, cangaPar: null },
    })
    // desfaz o par de canga reciprocamente, se houver
    if (mat1.cangaPar) {
      await prisma.user.updateMany({
        where: { matricula: mat1.cangaPar, cangaPar: 1 },
        data: { canga: null, cangaPar: null },
      })
    }
    console.log("Mat 1 (Hellton Fernandes): removido da Turma 13, escala/canga limpas.")
  } else {
    console.log("Mat 1 não encontrada — nada a fazer.")
  }

  // mat 213 (R Silva) é novato — cria se não existir
  const existente = await prisma.user.findUnique({ where: { matricula: 213 } })
  if (existente) {
    console.log("Mat 213 já existe — nada a fazer.")
  } else {
    const senhaTemp = "cfo2026!"
    const hash = await bcrypt.hash(senhaTemp, 12)
    const user = await prisma.user.create({
      data: {
        matricula: 213,
        nomeGuerra: "R SILVA",
        nomeCompleto: "R SILVA", // ajustar nome completo depois em /admin
        email: "aluno213@cfopm2026.placeholder", // ajustar e-mail real depois em /admin
        password: hash,
        turma13: true,
        ativo: true,
      },
    })
    console.log(`Mat 213 (R SILVA) criada. Senha temporária: ${senhaTemp} — peça para alterar em /alterar-senha.`)

    // adiciona o novato em todas as cotas financeiras ATIVAS já existentes
    const cotasAtivas = await prisma.cotaFinanceira.findMany({ where: { ativa: true } })
    for (const c of cotasAtivas) {
      await prisma.pagamentoCota.upsert({
        where: { cotaId_userId: { cotaId: c.id, userId: user.id } },
        update: {},
        create: { cotaId: c.id, userId: user.id },
      })
    }
    console.log(`Mat 213 adicionada a ${cotasAtivas.length} cota(s) financeira(s) ativa(s).`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
