/**
 * Seed das OPMs (batalhões) — Fase 5. Lista fechada da área da DIM (RMR).
 * Idempotente (upsert por sigla). Rodar: npx tsx prisma/seed-opm.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const OPMS: { sigla: string; nome: string; ordem: number; especial?: boolean }[] = [
  { sigla: "1º BPM", nome: "Batalhão Duarte Coelho (Olinda)", ordem: 1 },
  { sigla: "6º BPM", nome: "Batalhão Henrique Dias (Jaboatão)", ordem: 2 },
  { sigla: "11º BPM", nome: "Batalhão 17 de Agosto (Recife)", ordem: 3 },
  { sigla: "12º BPM", nome: "Batalhão Arraial Novo do Bom Jesus (Recife)", ordem: 4 },
  { sigla: "13º BPM", nome: "Batalhão Cel. PM João Nunes (Recife)", ordem: 5 },
  { sigla: "16º BPM", nome: "Batalhão Frei Caneca (Recife)", ordem: 6 },
  { sigla: "17º BPM", nome: "Batalhão Gen. Abreu e Lima (Paulista)", ordem: 7 },
  { sigla: "18º BPM", nome: "Batalhão Cel. Agenor Cavalcanti (Cabo de Santo Agostinho)", ordem: 8 },
  { sigla: "19º BPM", nome: "Batalhão André Vidal de Negreiros (Recife)", ordem: 9 },
  { sigla: "20º BPM", nome: "Batalhão Cel. PM Olinto de Melo Viana (São Lourenço da Mata)", ordem: 10 },
  { sigla: "25º BPM", nome: "Batalhão Cel. PM Claudio Galdino da Silva (Jaboatão)", ordem: 11 },
  { sigla: "26º BPM", nome: "Batalhão 1º Sgt PM José Mariano Pimentel Neto (Itapissuma)", ordem: 12 },
  { sigla: "—", nome: "Não decidiu / não faz diferença", ordem: 99, especial: true },
]

async function main() {
  for (const o of OPMS) {
    await prisma.oPM.upsert({
      where: { sigla: o.sigla },
      update: { nome: o.nome, ordem: o.ordem, especial: !!o.especial },
      create: { sigla: o.sigla, nome: o.nome, ordem: o.ordem, especial: !!o.especial },
    })
  }
  const total = await prisma.oPM.count()
  console.log(`OPMs no banco: ${total}`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => process.exit(0))
