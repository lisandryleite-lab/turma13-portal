/**
 * Seed da ESCALA DE SERVIÇO da 2ª CIA — JUNHO/2026 (apenas Turma 13).
 * Fonte: imagens "ESCALA DE FUNÇÕES DE DESTAQUE" e "ESCALA DE PLANTÃO, LIMPEZA E ADJUNTO".
 *
 * Tudo é gravado em FuncaoDestaqueDia (fonte única da Escala de Serviço unificada):
 *   funcao ∈ Adjunto1 | Adjunto2 | Mestre | Leitor | Discurso | Comandante
 *
 * Datas gravadas ao MEIO-DIA UTC para evitar deslize de fuso na exibição.
 * Limpa os registros de junho/2026 antes de inserir (idempotente + corrige dados antigos).
 * Rodar: npx tsx scripts/seed-escala-junho2026.ts
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
const d = (dia: number) => new Date(Date.UTC(2026, 5, dia, 12, 0, 0)) // junho = mês 5 (0-based), meio-dia UTC

// Nomes só para conferência nos comentários (validação real é a matrícula ∈ Turma 13)
// ── Escala de Serviço de JUNHO/2026 — somente integrantes da Turma 13 ──
// (dia, função, matrícula). Funções: Adjunto1, Adjunto2, Mestre, Leitor, Discurso, Comandante.
const FUNCOES: { dia: number; funcao: string; mat: number }[] = [
  // 01/06 SEG
  { dia: 1,  funcao: "Adjunto2",   mat: 45  }, // GABRIELE COSTA
  // 02/06 TER
  { dia: 2,  funcao: "Adjunto2",   mat: 55  }, // SHIRLAYNE
  // 03/06 QUA
  { dia: 3,  funcao: "Mestre",     mat: 1   }, // HELLTON FERNANDES
  { dia: 3,  funcao: "Discurso",   mat: 57  }, // CLEYTON
  // 04/06 QUI
  { dia: 4,  funcao: "Leitor",     mat: 13  }, // JONAS
  { dia: 4,  funcao: "Comandante", mat: 23  }, // RODOLFO MOURA
  // 05/06 SEX
  { dia: 5,  funcao: "Adjunto1",   mat: 60  }, // JOÃO NUNES
  { dia: 5,  funcao: "Leitor",     mat: 41  }, // ALAN SILVA
  // 09/06 TER
  { dia: 9,  funcao: "Adjunto2",   mat: 54  }, // ELDER CARVALHO
  { dia: 9,  funcao: "Mestre",     mat: 108 }, // LISANDRY
  { dia: 9,  funcao: "Discurso",   mat: 165 }, // KEVIN GOMES
  // 10/06 QUA
  { dia: 10, funcao: "Adjunto1",   mat: 71  }, // LEIMIG
  { dia: 10, funcao: "Adjunto2",   mat: 76  }, // ARAÚJO JÚNIOR
  { dia: 10, funcao: "Mestre",     mat: 55  }, // SHIRLAYNE
  // 11/06 QUI
  { dia: 11, funcao: "Adjunto2",   mat: 57  }, // CLEYTON
  { dia: 11, funcao: "Discurso",   mat: 143 }, // VIDAL
  // 14/06 DOM
  { dia: 14, funcao: "Adjunto2",   mat: 94  }, // ANDRÉ CARDOSO
  // 15/06 SEG
  { dia: 15, funcao: "Leitor",     mat: 26  }, // ANDRÉ
  { dia: 15, funcao: "Discurso",   mat: 37  }, // PABLO TORRES
  // 16/06 TER
  { dia: 16, funcao: "Adjunto1",   mat: 114 }, // JOSIANE FARIAS
  { dia: 16, funcao: "Adjunto2",   mat: 131 }, // JOSÉ INÁCIO
  // 17/06 QUA
  { dia: 17, funcao: "Comandante", mat: 45  }, // GABRIELE COSTA
  // 18/06 QUI
  { dia: 18, funcao: "Mestre",     mat: 76  }, // ARAÚJO JÚNIOR
  // 19/06 SEX
  { dia: 19, funcao: "Leitor",     mat: 191 }, // GOMES NASCIMENTO
  // 23/06 TER
  { dia: 23, funcao: "Leitor",     mat: 65  }, // KAUHANNI
  { dia: 23, funcao: "Discurso",   mat: 114 }, // JOSIANE FARIAS
  { dia: 23, funcao: "Comandante", mat: 131 }, // JOSÉ INÁCIO
  // 25/06 QUI
  { dia: 25, funcao: "Adjunto2",   mat: 81  }, // FERNANDO ROCHA
  { dia: 25, funcao: "Leitor",     mat: 54  }, // ELDER CARVALHO
  // 26/06 SEX
  { dia: 26, funcao: "Adjunto1",   mat: 108 }, // LISANDRY
  { dia: 26, funcao: "Comandante", mat: 55  }, // SHIRLAYNE
  // 27/06 SAB
  { dia: 27, funcao: "Adjunto2",   mat: 143 }, // VIDAL
  // 29/06 SEG
  { dia: 29, funcao: "Discurso",   mat: 41  }, // ALAN SILVA
]

async function main() {
  // valida que todas as matrículas são da Turma 13
  for (const f of FUNCOES) if (!T13.has(f.mat)) throw new Error(`Função mat ${f.mat} (dia ${f.dia}) NÃO é da Turma 13`)

  const inicio = new Date(Date.UTC(2026, 5, 1, 0, 0, 0))
  const fim    = new Date(Date.UTC(2026, 5, 30, 23, 59, 59))

  // Limpa dados antigos de junho/2026 (corrige seed anterior com datas/matrículas erradas)
  const delF = await prisma.funcaoDestaqueDia.deleteMany({ where: { data: { gte: inicio, lte: fim } } })
  const delP = await prisma.plantaoDia.deleteMany({ where: { data: { gte: inicio, lte: fim }, adjuntoMat: { not: null } } })
  console.log(`✓ limpeza: ${delF.count} funções e ${delP.count} adjuntos antigos removidos.`)

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
