/**
 * Seed da ESCALA DE FUNÇÕES DE DESTAQUE — AGOSTO/2026 (apenas Turma 13).
 * Fonte: PDF "ESCALA DE FUNÇÕES DE DESTAQUE - AGOSTO" (1ª CIA) —
 * funções nas formaturas matinais/gerais.
 * Tabela é da 1ª CIA inteira (vários pelotões) — filtramos só quem é da Turma 13.
 *
 * Datas gravadas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Limpa SÓ Mestre/Leitor/Discurso/Comandante de agosto antes de inserir
 * (idempotente, preserva AuxiliarOD/AdjuntoOD do seed-adjunto-agosto2026.ts).
 * Rodar: npx tsx scripts/seed-escala-agosto2026.ts
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
const d = (dia: number) => new Date(Date.UTC(2026, 7, dia, 12, 0, 0)) // agosto = mês 7 (0-based), meio-dia UTC

// (dia, função, matrícula) — somente linhas da tabela em que o matriculado é da Turma 13
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  { dia: 4,  funcao: "Mestre",     mat: 106 }, // RAFAEL RIBEIRO
  { dia: 4,  funcao: "Leitor",     mat: 108 }, // LISANDRY
  { dia: 4,  funcao: "Comandante", mat: 153 }, // HUGO
  { dia: 6,  funcao: "Leitor",     mat: 57  }, // CLEYTON
  { dia: 11, funcao: "Mestre",     mat: 114 }, // JOSIANE FARIAS
  { dia: 11, funcao: "Leitor",     mat: 131 }, // JOSÉ INÁCIO
  { dia: 14, funcao: "Leitor",     mat: 143 }, // VIDAL
  { dia: 18, funcao: "Mestre",     mat: 26  }, // ANDRÉ
  { dia: 19, funcao: "Comandante", mat: 167 }, // GUSTAVO NETO
  { dia: 20, funcao: "Mestre",     mat: 165 }, // KEVIN GOMES
  { dia: 25, funcao: "Mestre",     mat: 94  }, // ANDRÉ CARDOSO
  { dia: 27, funcao: "Mestre",     mat: 174 }, // ALEXANDRE
  { dia: 27, funcao: "Discurso",   mat: 186 }, // SAMUEL SILVA
  { dia: 28, funcao: "Mestre",     mat: 45  }, // GABRIELE COSTA
  { dia: 31, funcao: "Mestre",     mat: 105 }, // LUCAS EDUARDO
]

async function main() {
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} (dia ${f.dia}) NÃO é da Turma 13`)

  const inicio = new Date(Date.UTC(2026, 7, 1, 0, 0, 0))
  const fim    = new Date(Date.UTC(2026, 7, 31, 23, 59, 59))

  const delF = await prisma.funcaoDestaqueDia.deleteMany({
    where: { data: { gte: inicio, lte: fim }, funcao: { in: ["Mestre", "Leitor", "Discurso", "Comandante"] } },
  })
  console.log(`✓ limpeza: ${delF.count} funções de destaque antigas de agosto removidas.`)

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
  console.log(`✓ ${fc} lançamentos da escala de funções de destaque (Turma 13, agosto) gravados em FuncaoDestaqueDia.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
