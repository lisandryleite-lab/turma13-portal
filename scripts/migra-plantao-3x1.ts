/**
 * Migração da escala de plantão 7X1 (8 grupos GOLF…NOVEMBER) para 3X1
 * (4 grupos ALPHA/BRAVO/CHARLIE/DELTA), agosto/2026.
 *
 * Fontes:
 *  • "MAPA DE EQUIPES DE PLANTÃO - ESCALA 3X1 · AGOSTO/2026" (SEI, 1ª CIA, 21/08/2026)
 *    → composição das 4 equipes
 *  • "ESCALA DE PLANTÃO E DE ADJUNTO · AGOSTO/2026" (3X1, atualizada até 19/08)
 *    → Auxiliar/Adjunto do Oficial de Dia dia a dia, de 20 a 31/08
 *  • "DESCRIÇÃO DA ESCALA: FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · AGOSTO/2026"
 *    → Mestre de Cerimônia, Leitor de BI, Discurso ao CFO, Comandante da 1ª CIA
 *
 * Idempotente: pode rodar de novo sem duplicar nada.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MEMBROS_PLANTAO, SEM_EQUIPE_PLANTAO, GRUPOS_PLANTAO } from "../lib/escalas"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const dia = (d: number) => new Date(Date.UTC(2026, 7, d)) // agosto/2026, meia-noite UTC

// Auxiliar/Adjunto do Oficial de Dia — só os dias em que o escalado é da Turma 13.
// A escala 3X1 vale a partir de 20/08; antes disso valia a 7X1 e fica como está.
const INICIO_3X1 = 20
const PLANTAO_T13: { d: number; funcao: "AuxiliarOD" | "AdjuntoOD"; mat: number }[] = [
  { d: 21, funcao: "AdjuntoOD",  mat: 65  }, // Sex · BRAVO   · KAUHANNI
  { d: 23, funcao: "AuxiliarOD", mat: 19  }, // Dom · DELTA   · THAIS FIGUEIREDO
  { d: 24, funcao: "AdjuntoOD",  mat: 153 }, // Seg · ALPHA   · HUGO
  { d: 27, funcao: "AuxiliarOD", mat: 13  }, // Qui · DELTA   · JONAS
  { d: 28, funcao: "AdjuntoOD",  mat: 60  }, // Sex · ALPHA   · JOÃO NUNES
  { d: 29, funcao: "AdjuntoOD",  mat: 26  }, // Sáb · BRAVO   · ANDRÉ
]

// Funções nas formaturas — mês inteiro, só os dias com aluno da Turma 13.
const FORMATURA_T13: { d: number; funcao: string; mat: number }[] = [
  { d: 4,  funcao: "Mestre",     mat: 106 },
  { d: 4,  funcao: "Leitor",     mat: 108 },
  { d: 4,  funcao: "Comandante", mat: 153 },
  { d: 6,  funcao: "Leitor",     mat: 57  },
  { d: 11, funcao: "Mestre",     mat: 114 },
  { d: 11, funcao: "Leitor",     mat: 131 },
  { d: 14, funcao: "Leitor",     mat: 143 },
  { d: 18, funcao: "Mestre",     mat: 26  },
  { d: 19, funcao: "Comandante", mat: 167 },
  { d: 20, funcao: "Mestre",     mat: 165 },
  { d: 25, funcao: "Mestre",     mat: 94  },
  { d: 27, funcao: "Mestre",     mat: 174 },
  { d: 27, funcao: "Discurso",   mat: 186 },
  { d: 28, funcao: "Mestre",     mat: 45  },
  { d: 31, funcao: "Mestre",     mat: 105 },
]

async function sincronizaFuncao(d: number, funcao: string, mat: number) {
  const data = dia(d)
  const inicioDia = new Date(Date.UTC(2026, 7, d, 0, 0, 0))
  const fimDia = new Date(Date.UTC(2026, 7, d, 23, 59, 59))
  const existente = await prisma.funcaoDestaqueDia.findFirst({
    where: { funcao, data: { gte: inicioDia, lte: fimDia } },
  })
  if (!existente) {
    await prisma.funcaoDestaqueDia.create({ data: { data, funcao, matricula: mat } })
    return "criado"
  }
  if (existente.matricula !== mat) {
    await prisma.funcaoDestaqueDia.update({ where: { id: existente.id }, data: { matricula: mat } })
    return `trocado (era ${existente.matricula})`
  }
  return "ok"
}

async function main() {
  // ── 1. Grupo de plantão de cada aluno ──────────────────────────────
  console.log("── Equipes 3X1 (User.grupoPlantao) ──")
  let mudou = 0
  for (const grupo of GRUPOS_PLANTAO) {
    for (const { mat, nome } of MEMBROS_PLANTAO[grupo]) {
      const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
      if (!u) { console.log(`  ⚠ matrícula ${mat} (${nome}) não está no portal`); continue }
      if (u.grupoPlantao !== grupo) {
        await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: grupo } })
        console.log(`  • ${String(mat).padStart(3)} ${nome.padEnd(18)} ${String(u.grupoPlantao ?? "—").padEnd(9)} → ${grupo}`)
        mudou++
      }
    }
  }
  // Quem a 1ª CIA não colocou em nenhuma equipe fica SEM grupo — não inventar.
  for (const mat of SEM_EQUIPE_PLANTAO) {
    const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { nomeGuerra: true, grupoPlantao: true } })
    if (!u) continue
    if (u.grupoPlantao !== null) {
      await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: null } })
      console.log(`  • ${String(mat).padStart(3)} ${u.nomeGuerra.padEnd(18)} ${String(u.grupoPlantao).padEnd(9)} → (sem equipe no mapa da 1ª CIA)`)
      mudou++
    } else {
      console.log(`  · ${String(mat).padStart(3)} ${u.nomeGuerra.padEnd(18)} segue sem equipe no mapa da 1ª CIA`)
    }
  }
  const total = GRUPOS_PLANTAO.reduce((s, g) => s + MEMBROS_PLANTAO[g].length, 0)
  console.log(`  ${mudou} alteração(ões) · ${total} alunos com equipe · ${SEM_EQUIPE_PLANTAO.length} sem equipe`)

  // ── 2. Auxiliar/Adjunto do Oficial de Dia (a partir de 20/08) ──────
  console.log("\n── Plantão 3X1 · Auxiliar/Adjunto do Of. de Dia (20 a 31/08) ──")
  const manter = new Set(PLANTAO_T13.map(p => `${p.d}|${p.funcao}`))
  const antigos = await prisma.funcaoDestaqueDia.findMany({
    where: {
      funcao: { in: ["AuxiliarOD", "AdjuntoOD", "Adjunto1", "Adjunto2"] },
      data: { gte: dia(INICIO_3X1), lte: new Date(Date.UTC(2026, 7, 31, 23, 59, 59)) },
    },
  })
  for (const a of antigos) {
    if (!manter.has(`${a.data.getUTCDate()}|${a.funcao}`)) {
      await prisma.funcaoDestaqueDia.delete({ where: { id: a.id } })
      console.log(`  − ${String(a.data.getUTCDate()).padStart(2)}/08 ${a.funcao.padEnd(11)} mat ${a.matricula} (não consta na escala 3X1)`)
    }
  }
  for (const p of PLANTAO_T13) {
    const r = await sincronizaFuncao(p.d, p.funcao, p.mat)
    console.log(`  ${r === "ok" ? "·" : "+"} ${String(p.d).padStart(2)}/08 ${p.funcao.padEnd(11)} mat ${String(p.mat).padStart(3)} — ${r}`)
  }

  // ── 3. Funções nas formaturas ──────────────────────────────────────
  console.log("\n── Formaturas · Mestre / Leitor / Discurso / Comandante (agosto) ──")
  for (const f of FORMATURA_T13) {
    const r = await sincronizaFuncao(f.d, f.funcao, f.mat)
    console.log(`  ${r === "ok" ? "·" : "+"} ${String(f.d).padStart(2)}/08 ${f.funcao.padEnd(11)} mat ${String(f.mat).padStart(3)} — ${r}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
