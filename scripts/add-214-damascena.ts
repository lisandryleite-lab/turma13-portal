// ─────────────────────────────────────────────────────────────
//  Login de 214 DAMASCENA — aluno do CFO de OUTRA turma.
//
//  Ele usa a plataforma (hub /inicio: questões, mementos, ranking, documentos),
//  mas NÃO é da Turma 13: `turma13: false` faz o layout de `app/(logado)` barrar
//  /dashboard, /escalas, /faltas e o resto do portal do 1º Pelotão.
//
//  Por isso ele NÃO entra em:
//   • MEMBROS_PLANTAO (lib/escalas.ts) — aquela lista é só da Turma 13. Ele aparece
//     em CHARLIE no mapa da 1ª CIA, que é da companhia inteira, não da turma.
//   • MATRICULAS_ORDEM (antiguidade / rodízio P1-P3-P4 da Turma 13).
//   • Grupos de faxina G1–G8 e cotas financeiras da Turma 13.
//
//  Idempotente — também serve para CORRIGIR o cadastro caso ele tenha sido criado
//  como membro da Turma 13 por engano.
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

async function main() {
  const existente = await prisma.user.findUnique({ where: { matricula: MAT } })

  if (!existente) {
    // Senha temporária — trocar em /trocar-senha no primeiro acesso.
    const senhaTemp = "cfo2026!"
    const hash = await bcrypt.hash(senhaTemp, 12)
    await prisma.user.create({
      data: {
        matricula: MAT,
        nomeGuerra: NOME,
        nomeCompleto: NOME,                          // completar depois em /admin
        email: `aluno${MAT}@cfopm2026.placeholder`,  // trocar pelo e-mail real em /admin
        password: hash,
        turma13: false,                              // NÃO é da Turma 13
        ativo: true,
      },
    })
    console.log(`✓ Mat ${MAT} (${NOME}) criada — acesso à plataforma, FORA da Turma 13.`)
    console.log(`  Senha temporária: ${senhaTemp} — pedir troca em /trocar-senha no 1º acesso.`)
    return
  }

  // Já existe: garante que está marcado como NÃO-Turma 13 e limpa o que só faz
  // sentido para membro do 1º Pelotão.
  const antes = { turma13: existente.turma13, grupoPlantao: existente.grupoPlantao, grupoFaxina: existente.grupoFaxina }
  await prisma.user.update({
    where: { matricula: MAT },
    data: { turma13: false, ativo: true, grupoPlantao: null, grupoFaxina: null },
  })
  console.log(`✓ Mat ${MAT} (${existente.nomeGuerra}) ajustada — acesso à plataforma, FORA da Turma 13.`)
  if (antes.turma13) console.log(`  • turma13: true → false (perde o portal do 1º Pelotão)`)
  if (antes.grupoPlantao) console.log(`  • grupoPlantao: ${antes.grupoPlantao} → null (escala de plantão da Turma 13)`)
  if (antes.grupoFaxina) console.log(`  • grupoFaxina: ${antes.grupoFaxina} → null`)

  // Cotas financeiras são da Turma 13 — remove qualquer vínculo, desde que nada
  // tenha sido pago/declarado (aí é caso para o tesoureiro resolver na mão).
  const pagamentos = await prisma.pagamentoCota.findMany({ where: { userId: existente.id } })
  for (const p of pagamentos) {
    const mexido = p.pago || p.declaradoPago || p.respostas !== null
    if (mexido) {
      console.log(`  ⚠ cota ${p.cotaId}: já tem pagamento declarado/confirmado — NÃO removido, ver com o tesoureiro`)
      continue
    }
    await prisma.pagamentoCota.delete({ where: { id: p.id } })
    console.log(`  • removido de 1 cota financeira da Turma 13`)
  }
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
