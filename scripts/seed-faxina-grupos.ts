import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const GRUPOS: Record<string, { mat: number; nome: string }[]> = {
  G1: [
    { mat: 191, nome: "GOMES NASCIMENTO" },
    { mat: 143, nome: "VIDAL" },
    { mat: 153, nome: "HUGO" },
    { mat: 174, nome: "ALEXANDRE" },
  ],
  G2: [
    { mat: 167, nome: "GUSTAVO NETO" },
    { mat: 186, nome: "SAMUEL SILVA" },
    { mat: 116, nome: "BERTIPALHA" },
    { mat: 13,  nome: "JONAS" },
    { mat: 1,   nome: "HELLTON FERNANDES" }, // único grupo com 5
  ],
  G3: [
    { mat: 131, nome: "JOSÉ INÁCIO" },
    { mat: 165, nome: "KEVIN GOMES" },
  ],
  G4: [
    { mat: 81,  nome: "FERNANDO ROCHA" },
    { mat: 106, nome: "RAFAEL RIBEIRO" },
    { mat: 144, nome: "SAMUEL SANTOS" },
    { mat: 94,  nome: "ANDRÉ CARDOSO" },
  ],
  G5: [
    { mat: 98,  nome: "JOSÉ MENEZES" },
    { mat: 105, nome: "LUCAS EDUARDO" },
    { mat: 71,  nome: "LEIMIG" },
    { mat: 76,  nome: "ARAÚJO JR" },
  ],
  G6: [
    { mat: 55,  nome: "SHIRLAYNE" },
    { mat: 65,  nome: "KAUHANNI" },
    { mat: 41,  nome: "ALAN SILVA" },
    { mat: 60,  nome: "JOÃO NUNES" },
  ],
  G7: [
    { mat: 54,  nome: "ELDER CARVALHO" },
    { mat: 57,  nome: "CLEYTON" },
    { mat: 19,  nome: "THAIS FIGUEIREDO" },
    { mat: 45,  nome: "GABRIELE COSTA" },
  ],
  G8: [
    { mat: 7,   nome: "ALDO SILVA" },
    { mat: 37,  nome: "PABLO TORRES" },
    { mat: 23,  nome: "RODOLFO MOURA" },
    { mat: 26,  nome: "ANDRÉ" },
  ],
}

async function main() {
  // Limpa e reinsere tudo
  await prisma.faxinaGrupoMembro.deleteMany()
  let total = 0
  for (const [grupo, membros] of Object.entries(GRUPOS)) {
    for (const m of membros) {
      await prisma.faxinaGrupoMembro.create({ data: { grupo, mat: m.mat, nome: m.nome } })
      total++
    }
    console.log(`✓ ${grupo}: ${membros.length} membros`)
  }
  console.log(`\n✓ Total: ${total} membros inseridos`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
