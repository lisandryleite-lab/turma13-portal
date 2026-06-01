/**
 * Seed da ESCALA EXTERNA da 2ª CIA — JUNHO/2026 (apenas Turma 13).
 * Fonte: PDFs "ESCALA DE PLANTÃO, LIMPEZA E ADJUNTO" e "ESCALA DE FUNÇÕES DE DESTAQUE".
 *
 * - PlantaoDia.adjuntoMat: adjuntos da 2ª CIA que são da Turma 13, com a data.
 * - FuncaoDestaqueDia: membros da Turma 13 em funções de destaque, com data e função.
 *
 * Datas gravadas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Idempotente (upsert). Rodar: npx tsx scripts/seed-escala-junho2026.ts
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { grupoPlantaoPorData, MATRICULAS_ORDEM } from "../lib/escalas"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const T13 = new Set(MATRICULAS_ORDEM)
const d = (dia: number) => new Date(Date.UTC(2026, 5, dia, 12, 0, 0)) // junho = mês 5 (0-based), meio-dia UTC

// ── Adjuntos da 2ª CIA que são da Turma 13 (dia → matrícula) ──
const ADJUNTOS: { dia: number; mat: number }[] = [
  { dia: 1,  mat: 45  }, // GABRIELE COSTA
  { dia: 3,  mat: 55  }, // SHIRLAYNE
  { dia: 13, mat: 54  }, // ELDER CARVALHO
  { dia: 14, mat: 76  }, // ARAÚJO JÚNIOR
  { dia: 16, mat: 57  }, // CLEYTON
  { dia: 20, mat: 94  }, // ANDRÉ CARDOSO
  { dia: 23, mat: 131 }, // JOSÉ INÁCIO
]

// ── Funções de destaque da Turma 13 (dia, função, matrícula) ──
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  { dia: 3,  funcao: "Mestre",     mat: 1   }, // HELLTON FERNANDES
  { dia: 3,  funcao: "Discurso",   mat: 57  }, // CLEYTON
  { dia: 4,  funcao: "Leitor",     mat: 13  }, // JONAS
  { dia: 4,  funcao: "Comandante", mat: 23  }, // RODOLFO MOURA
  { dia: 5,  funcao: "Leitor",     mat: 41  }, // ALAN SILVA
  { dia: 8,  funcao: "Mestre",     mat: 108 }, // LISANDRY
  { dia: 9,  funcao: "Mestre",     mat: 55  }, // SHIRLAYNE
  { dia: 9,  funcao: "Discurso",   mat: 165 }, // KEVIN GOMES
  { dia: 11, funcao: "Discurso",   mat: 143 }, // VIDAL
  { dia: 15, funcao: "Leitor",     mat: 26  }, // ANDRÉ
  { dia: 15, funcao: "Discurso",   mat: 37  }, // PABLO TORRES
  { dia: 16, funcao: "Comandante", mat: 45  }, // GABRIELE COSTA
  { dia: 17, funcao: "Mestre",     mat: 76  }, // ARAÚJO JÚNIOR
  { dia: 19, funcao: "Leitor",     mat: 191 }, // GOMES NASCIMENTO
  { dia: 22, funcao: "Comandante", mat: 98  }, // JOSÉ MENEZES
  { dia: 23, funcao: "Leitor",     mat: 65  }, // KAUHANNI
  { dia: 23, funcao: "Discurso",   mat: 114 }, // JOSIANE FARIAS
  { dia: 23, funcao: "Comandante", mat: 131 }, // JOSÉ INÁCIO
  { dia: 25, funcao: "Leitor",     mat: 54  }, // ELDER CARVALHO
  { dia: 25, funcao: "Comandante", mat: 55  }, // SHIRLAYNE
  { dia: 26, funcao: "Discurso",   mat: 41  }, // ALAN SILVA
]

async function main() {
  // valida que todas as matrículas são da Turma 13
  for (const a of ADJUNTOS) if (!T13.has(a.mat)) throw new Error(`Adjunto mat ${a.mat} NÃO é da Turma 13`)
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} NÃO é da Turma 13`)

  let pa = 0
  for (const a of ADJUNTOS) {
    const data = d(a.dia)
    await prisma.plantaoDia.upsert({
      where: { data },
      update: { adjuntoMat: a.mat, grupoPlantao: grupoPlantaoPorData(data) },
      create: { data, adjuntoMat: a.mat, grupoPlantao: grupoPlantaoPorData(data) },
    })
    pa++
  }
  console.log(`✓ ${pa} adjuntos (Turma 13) gravados em PlantaoDia.`)

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
  console.log(`✓ ${fc} funções de destaque (Turma 13) gravadas em FuncaoDestaqueDia.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
