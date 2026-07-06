// ─────────────────────────────────────────────────────────────
//  Inclui 212 CAMILA BUONORA na Turma 13 (entrou em jul/2026).
//  Grupo de plantão confirmado no Mapa de Equipes JULHO-2/2026: KILO.
//  (O mapa grafa "BOUONORA"; grafia correta confirmada: BUONORA.)
//
//  Uso: npx tsx scripts/add-212-camila.ts
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const existente = await prisma.user.findUnique({ where: { matricula: 212 } })
  if (existente) {
    console.log("Mat 212 já existe — garantindo turma13/grupoPlantao.")
    await prisma.user.update({
      where: { matricula: 212 },
      data: { turma13: true, ativo: true, grupoPlantao: "KILO" },
    })
  } else {
    const senhaTemp = "cfo2026!"
    const hash = await bcrypt.hash(senhaTemp, 12)
    const user = await prisma.user.create({
      data: {
        matricula: 212,
        nomeGuerra: "CAMILA BUONORA",
        nomeCompleto: "CAMILA BUONORA", // ajustar nome completo depois em /admin
        email: "aluno212@cfopm2026.placeholder", // ajustar e-mail real depois em /admin
        password: hash,
        turma13: true,
        ativo: true,
        grupoPlantao: "KILO", // grupoFaxina/canga: definir em /admin quando houver
      },
    })
    console.log(`Mat 212 (CAMILA BUONORA) criada — plantão KILO. Senha temporária: ${senhaTemp} — peça para alterar em /alterar-senha.`)

    // adiciona a novata em todas as cotas financeiras ATIVAS já existentes
    const cotasAtivas = await prisma.cotaFinanceira.findMany({ where: { ativa: true } })
    for (const c of cotasAtivas) {
      await prisma.pagamentoCota.upsert({
        where: { cotaId_userId: { cotaId: c.id, userId: user.id } },
        update: {},
        create: { cotaId: c.id, userId: user.id },
      })
    }
    console.log(`Mat 212 adicionada a ${cotasAtivas.length} cota(s) financeira(s) ativa(s).`)
  }

  // corrige a grafia herdada do PDF na tabela de plantão da CIA (usada em /permutas)
  await prisma.militarPlantao.upsert({
    where: { matricula: 212 },
    update: { nome: "CAMILA BUONORA", grupoPlantao: "KILO" },
    create: { matricula: 212, nome: "CAMILA BUONORA", grupoPlantao: "KILO" },
  })
  console.log("MilitarPlantao 212: nome CAMILA BUONORA, grupo KILO.")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
