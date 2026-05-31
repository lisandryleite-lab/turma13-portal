/**
 * Seed das notas históricas T1/T2 (base da previsão por percentil — Fase 4).
 * Dado de REFERÊNCIA (não-PII): pode limpar e reinserir sem risco.
 * Fonte: .dados-fonte/historico-t1.json (PDF Ranking Final CFO 2024) e historico-t2.json (lista digitada).
 * Rodar: npx tsx prisma/seed-historico.ts
 */
import "dotenv/config"
import { readFileSync } from "fs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const t1: number[] = JSON.parse(readFileSync(".dados-fonte/historico-t1.json", "utf8"))
  const t2: number[] = JSON.parse(readFileSync(".dados-fonte/historico-t2.json", "utf8"))

  await prisma.notaHistorica.deleteMany()

  // Ordena desc para preencher posicaoFinal coerente dentro de cada turma
  const ins = (notas: number[], turma: number) =>
    [...notas]
      .sort((a, b) => b - a)
      .map((valorFinal, i) => ({ turma, valorFinal, posicaoFinal: i + 1 }))

  const data = [...ins(t1, 1), ...ins(t2, 2)]
  await prisma.notaHistorica.createMany({ data })

  const total = await prisma.notaHistorica.count()
  const c1 = await prisma.notaHistorica.count({ where: { turma: 1 } })
  const c2 = await prisma.notaHistorica.count({ where: { turma: 2 } })
  console.log(`NotaHistorica: T1=${c1} T2=${c2} total=${total}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => process.exit(0))
