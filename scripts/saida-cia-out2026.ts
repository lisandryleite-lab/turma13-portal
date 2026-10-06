/**
 * Out/2026 — saídas da Turma 13 (1º Pelotão):
 *   • 211 DÁRIO, 213 R SILVA e 54 ELDER CARVALHO saíram da CIA → inativos, fora da
 *     Turma 13, sem pelotão e sem grupo de faxina/plantão.
 *   • 212 CAMILA BUONORA é do 7º Pelotão → fora da Turma 13 e da faxina do pelotão
 *     (segue ativa, na equipe KILO da CIA).
 * O rodízio de P1/P3/P4 (lib/escalas.ts) já não inclui nenhum deles.
 * Não apaga ninguém: os registros (notas etc.) ficam no banco.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const sairam = await prisma.user.updateMany({
    where: { matricula: { in: [54, 211, 213] } },
    data: { ativo: false, turma13: false, pelotao: null, grupoFaxina: null, grupoPlantao: null },
  })
  const camila = await prisma.user.update({
    where: { matricula: 212 },
    data: { turma13: false, pelotao: 7, grupoFaxina: null },
    select: { matricula: true, nomeGuerra: true, pelotao: true, grupoPlantao: true },
  })
  const fx = await prisma.faxinaGrupoMembro.deleteMany({ where: { mat: { in: [54, 211, 212, 213] } } })
  const t13 = await prisma.user.count({ where: { turma13: true } })
  console.log(`✓ ${sairam.count} marcados como fora da CIA (54, 211, 213)`)
  console.log(`✓ ${camila.matricula} ${camila.nomeGuerra} → ${camila.pelotao}º Pelotão, equipe ${camila.grupoPlantao}`)
  console.log(`✓ ${fx.count} vínculo(s) de faxina removidos · Turma 13 agora com ${t13} membros`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
