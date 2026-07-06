// ─────────────────────────────────────────────────────────────
//  Integra os novatos 211 DÁRIO, 212 CAMILA BUONORA e 213 R SILVA
//  nas escalas de faxina e de plantão (jul/2026):
//    · 211: plantão HOTEL (Mapa de Equipes JULHO-2) — já estava na faxina G7
//    · 213: faxina G7 (grupo original dele, ficou de fora na reorganização do BD)
//    · 212: faxina G8 (junto dos colegas de plantão KILO 26 e 37)
//  Depois sincroniza User.grupoFaxina de TODOS com a tabela FaxinaGrupoMembro
//  (fonte viva da composição, exibida no dashboard).
//
//  Uso: npx tsx scripts/integra-novatos-escalas.ts
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const NOVOS_FAXINA = [
  { grupo: "G7", mat: 213, nome: "R SILVA" },
  { grupo: "G8", mat: 212, nome: "CAMILA BUONORA" },
]

async function main() {
  await prisma.user.update({ where: { matricula: 211 }, data: { grupoPlantao: "HOTEL" } })
  console.log("211 DÁRIO: grupoPlantao = HOTEL")

  for (const m of NOVOS_FAXINA) {
    await prisma.faxinaGrupoMembro.upsert({
      where: { grupo_mat: { grupo: m.grupo, mat: m.mat } },
      update: { nome: m.nome },
      create: m,
    })
    console.log(`${m.mat} ${m.nome}: faxina ${m.grupo}`)
  }

  // User.grupoFaxina ← FaxinaGrupoMembro (para todos os alunos da tabela)
  const membros = await prisma.faxinaGrupoMembro.findMany()
  let sincronizados = 0
  for (const m of membros) {
    const r = await prisma.user.updateMany({
      // OR com null é necessário: NOT { campo: valor } não casa linhas com campo NULL
      where: { matricula: m.mat, OR: [{ grupoFaxina: null }, { NOT: { grupoFaxina: m.grupo } }] },
      data: { grupoFaxina: m.grupo },
    })
    if (r.count > 0) { console.log(`  sync: ${m.mat} → grupoFaxina ${m.grupo}`); sincronizados += r.count }
  }
  console.log(`User.grupoFaxina sincronizado: ${sincronizados} ajuste(s).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
