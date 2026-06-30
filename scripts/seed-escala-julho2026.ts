/**
 * Seed da ESCALA DE SERVIÇO (Funções de Destaque) — JULHO/2026 (apenas Turma 13).
 * Fonte: "FUNÇÕES DE DESTAQUE - JULHO ATUALIZADA.pdf" (Escala de Serviço Nº 3, 1ªCIA).
 * Tabela é da 1ªCIA inteira (vários pelotões) — filtramos só quem é da Turma 13.
 *
 * Datas gravadas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Rodar: npx tsx scripts/seed-escala-julho2026.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MATRICULAS_ORDEM } from "../lib/escalas"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const T13 = new Set(MATRICULAS_ORDEM)
const d = (dia: number) => new Date(Date.UTC(2026, 6, dia, 12, 0, 0)) // julho = mês 6 (0-based), meio-dia UTC

// (dia, função, matrícula) — somente linhas da tabela em que o matriculado é da Turma 13
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  { dia: 3,  funcao: "Discurso",   mat: 81  },  // FERNANDO ROCHA
  { dia: 7,  funcao: "Discurso",   mat: 60  },  // JOÃO NUNES
  { dia: 9,  funcao: "Mestre",     mat: 26  },  // ANDRÉ
  { dia: 9,  funcao: "Leitor",     mat: 37  },  // PABLO TORRES
  { dia: 13, funcao: "Discurso",   mat: 7   },  // ALDO SILVA
  { dia: 14, funcao: "Comandante", mat: 13  },  // JONAS
  { dia: 17, funcao: "Mestre",     mat: 65  },  // KAUHANNI
  { dia: 17, funcao: "Discurso",   mat: 98  },  // JOSÉ MENEZES
  { dia: 20, funcao: "Leitor",     mat: 71  },  // LEIMIG
  { dia: 20, funcao: "Discurso",   mat: 76  },  // ARAÚJO JÚNIOR
  { dia: 21, funcao: "Discurso",   mat: 19  },  // THAIS FIGUEIREDO
  { dia: 22, funcao: "Leitor",     mat: 23  },  // RODOLFO MOURA
  { dia: 23, funcao: "Comandante", mat: 116 },  // BERTIPALHA
  { dia: 24, funcao: "Mestre",     mat: 213 },  // R SILVA
]

async function main() {
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} (dia ${f.dia}) NÃO é da Turma 13`)

  const inicio = new Date(Date.UTC(2026, 6, 1, 0, 0, 0))
  const fim    = new Date(Date.UTC(2026, 6, 31, 23, 59, 59))

  const delF = await prisma.funcaoDestaqueDia.deleteMany({ where: { data: { gte: inicio, lte: fim } } })
  console.log(`✓ limpeza: ${delF.count} funções antigas de julho removidas.`)

  let fc = 0
  for (const f of FUNCOES) {
    const data = d(f.dia)
    await prisma.funcaoDestaqueDia.upsert({
      where: { data_funcao: { data, funcao: f.funcao } },
      update: { matricula: f.mat },
      create: { data, funcao: f.funcao, matricula: f.mat },
    })
    fc++
  }
  console.log(`✓ ${fc} lançamentos da escala de serviço (Turma 13) gravados em FuncaoDestaqueDia.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
