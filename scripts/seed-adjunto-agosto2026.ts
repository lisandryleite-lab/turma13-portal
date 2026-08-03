/**
 * Seed da ESCALA DE PLANTÃO E DE ADJUNTO — AGOSTO/2026 (apenas Turma 13).
 * Fonte: PDF "ESCALA DE PLANTÃO, AUXILIAR E ADJUNTO - AGOSTO" (1ª CIA, 07h às 07h).
 * Complementa scripts/seed-escala-agosto2026.ts (que cobre as Funções de Destaque).
 *
 * Nomenclatura da 1ª CIA (desde jul/2026), gravada em FuncaoDestaqueDia:
 *   AuxiliarOD = Auxiliar do Oficial de Dia   (coluna "EFETIVO")
 *   AdjuntoOD  = Adjunto ao Auxiliar do Oficial de Dia
 * O grupo de plantão (GOLF…NOVEMBER) NÃO é gravado: sai do ciclo determinístico
 * em lib/escalas.ts (grupoPlantaoPorData) — conferido contra o PDF (01/08 = JULIET).
 *
 * Datas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Limpa SÓ AuxiliarOD/AdjuntoOD de agosto antes de inserir (idempotente,
 * preserva Mestre/Leitor/Discurso/Comandante do outro seed).
 * Rodar: npx tsx scripts/seed-adjunto-agosto2026.ts
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

// (dia, função, matrícula) — somente integrantes da Turma 13.
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  // ── Auxiliar do Oficial de Dia ──
  { dia: 6,  funcao: "AuxiliarOD", mat: 7   }, // ALDO SILVA (QUI)
  { dia: 12, funcao: "AuxiliarOD", mat: 45  }, // GABRIELE COSTA (QUA)
  { dia: 18, funcao: "AuxiliarOD", mat: 37  }, // PABLO TORRES (TER)
  { dia: 22, funcao: "AuxiliarOD", mat: 19  }, // THAIS FIGUEIREDO (SAB)
  { dia: 23, funcao: "AuxiliarOD", mat: 13  }, // JONAS (DOM)
  { dia: 31, funcao: "AuxiliarOD", mat: 23  }, // RODOLFO MOURA (SEG)
  // ── Adjunto ao Auxiliar do Oficial de Dia ──
  { dia: 2,  funcao: "AdjuntoOD",  mat: 212 }, // CAMILA BUONORA (DOM)
  { dia: 10, funcao: "AdjuntoOD",  mat: 26  }, // ANDRÉ (SEG)
  { dia: 12, funcao: "AdjuntoOD",  mat: 165 }, // KEVIN GOMES (QUA)
  { dia: 16, funcao: "AdjuntoOD",  mat: 41  }, // ALAN SILVA (DOM)
  { dia: 25, funcao: "AdjuntoOD",  mat: 153 }, // HUGO (TER)
  { dia: 26, funcao: "AdjuntoOD",  mat: 65  }, // KAUHANNI (QUA)
]

async function main() {
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} (dia ${f.dia}) NÃO é da Turma 13`)

  const inicio = new Date(Date.UTC(2026, 7, 1, 0, 0, 0))
  const fim    = new Date(Date.UTC(2026, 7, 31, 23, 59, 59))

  const del = await prisma.funcaoDestaqueDia.deleteMany({
    where: { data: { gte: inicio, lte: fim }, funcao: { in: ["AuxiliarOD", "AdjuntoOD"] } },
  })
  console.log(`✓ limpeza: ${del.count} lançamentos AuxiliarOD/AdjuntoOD antigos de agosto removidos.`)

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
  console.log(`✓ ${fc} lançamentos de adjunto/auxiliar (Turma 13, agosto) gravados em FuncaoDestaqueDia.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
