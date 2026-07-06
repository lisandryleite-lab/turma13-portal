// ─────────────────────────────────────────────────────────────
//  Sincroniza User.grupoPlantao com o "MAPA DE EQUIPES - JULHO-2"
//  (Escala de Serviço nº 1, PMPE/APMP/CFO 2026 — Paudalho, 26/06/2026).
//  Fonte de verdade: MEMBROS_PLANTAO em lib/escalas.ts (já confere com o PDF).
//  Audita todos os alunos da Turma 13 e corrige divergências (ex.: 108 estava NOVEMBER → MIKE).
//
//  Uso: npx tsx scripts/sync-plantao-julho2.ts [--dry-run]
// ─────────────────────────────────────────────────────────────
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MEMBROS_PLANTAO } from "../lib/escalas"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const dryRun = process.argv.includes("--dry-run")

async function main() {
  const esperado = new Map<number, string>()
  for (const [grupo, membros] of Object.entries(MEMBROS_PLANTAO)) {
    for (const m of membros) esperado.set(m.mat, grupo)
  }

  const users = await prisma.user.findMany({
    select: { matricula: true, nomeGuerra: true, grupoPlantao: true },
    orderBy: { matricula: "asc" },
  })

  let corrigidos = 0
  for (const u of users) {
    const grupo = esperado.get(u.matricula)
    if (!grupo) {
      if (u.grupoPlantao) console.log(`⚠ ${u.matricula} ${u.nomeGuerra}: não está no mapa de julho (DB: ${u.grupoPlantao}) — não alterado`)
      continue
    }
    if (u.grupoPlantao === grupo) continue
    console.log(`✗ ${u.matricula} ${u.nomeGuerra}: DB=${u.grupoPlantao ?? "—"} → mapa=${grupo}${dryRun ? " (dry-run)" : ""}`)
    if (!dryRun) {
      await prisma.user.update({ where: { matricula: u.matricula }, data: { grupoPlantao: grupo } })
    }
    corrigidos++
  }
  console.log(corrigidos === 0 ? "Tudo em dia — nenhuma divergência." : `${corrigidos} divergência(s) ${dryRun ? "encontrada(s)" : "corrigida(s)"}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
