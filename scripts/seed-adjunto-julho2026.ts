/**
 * Seed da ESCALA DE PLANTÃO E DE ADJUNTO — JULHO/2026 (apenas Turma 13).
 * Fonte: PDF "ESCALA DE PLANTÃO E ADJUNTO - JULHO-1" (Escala de Serviço nº 2, 1ªCIA).
 * Complementa scripts/seed-escala-julho2026.ts (que cobre as Funções de Destaque).
 *
 * Nomenclatura nova da 1ª CIA (jul/2026), gravada em FuncaoDestaqueDia:
 *   AuxiliarOD = Auxiliar do Oficial de Dia
 *   AdjuntoOD  = Adjunto ao Auxiliar do Oficial de Dia
 *
 * Datas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Limpa SÓ AuxiliarOD/AdjuntoOD de julho antes de inserir (idempotente,
 * preserva Mestre/Leitor/Discurso/Comandante do outro seed).
 * Rodar: npx tsx scripts/seed-adjunto-julho2026.ts
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

// (dia, função, matrícula) — somente integrantes da Turma 13.
// Obs.: 29/07 Auxiliar = mat 01 (Hellton Fernandes) ficou FORA — saiu da Turma 13 em jun/2026.
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  // ── Auxiliar do Oficial de Dia ──
  { dia: 6,  funcao: "AuxiliarOD", mat: 105 }, // LUCAS EDUARDO (SEG)
  { dia: 7,  funcao: "AuxiliarOD", mat: 116 }, // BERTIPALHA (TER)
  { dia: 13, funcao: "AuxiliarOD", mat: 191 }, // GOMES NASCIMENTO (SEG)
  { dia: 18, funcao: "AuxiliarOD", mat: 167 }, // GUSTAVO NETO (SAB)
  { dia: 22, funcao: "AuxiliarOD", mat: 144 }, // SAMUEL SANTOS (QUA)
  { dia: 27, funcao: "AuxiliarOD", mat: 108 }, // LISANDRY (SEG)
  // ── Adjunto ao Auxiliar do Oficial de Dia ──
  { dia: 18, funcao: "AdjuntoOD",  mat: 174 }, // ALEXANDRE (SAB)
  { dia: 19, funcao: "AdjuntoOD",  mat: 106 }, // RAFAEL RIBEIRO (DOM)
  { dia: 26, funcao: "AdjuntoOD",  mat: 186 }, // SAMUEL SILVA (DOM)
]

async function main() {
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} (dia ${f.dia}) NÃO é da Turma 13`)

  const inicio = new Date(Date.UTC(2026, 6, 1, 0, 0, 0))
  const fim    = new Date(Date.UTC(2026, 6, 31, 23, 59, 59))

  const del = await prisma.funcaoDestaqueDia.deleteMany({
    where: { data: { gte: inicio, lte: fim }, funcao: { in: ["AuxiliarOD", "AdjuntoOD"] } },
  })
  console.log(`✓ limpeza: ${del.count} lançamentos AuxiliarOD/AdjuntoOD antigos de julho removidos.`)

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
  console.log(`✓ ${fc} lançamentos de adjunto/auxiliar (Turma 13, julho) gravados em FuncaoDestaqueDia.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
