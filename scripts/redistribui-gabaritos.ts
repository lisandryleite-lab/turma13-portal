import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// Conjuntos antigos foram gerados com o gabarito das múltiplas SEMPRE na letra A
// (12 matérias com 100% em A). Como o portal não embaralha as alternativas, o
// aluno acerta por posição. Este script redistribui os gabaritos entre A–E
// trocando de lugar o texto da alternativa correta com o da letra-alvo.
//
// SEGURANÇA:
// - só mexe em questão cujo enunciado/explicação NÃO cite letra de alternativa
//   ("a alternativa C", "(D)"), senão o comentário passaria a apontar para a
//   alternativa errada;
// - Resposta.resposta (letra marcada) nunca é lida de volta pela aplicação —
//   só Resposta.acertou, que é imutável aqui. O histórico e o ranking não mudam.

const LETRAS = ["A", "B", "C", "D", "E"] as const
const REF_LETRA = /\b(?:alternativa|letra|assertiva|item|op[çc][ãa]o)s?\s+["“(]?([A-E])\b|\(([A-E])\)/i
const VIES_MIN = 0.4 // só matérias em que a letra dominante concentra ≥ 40%

type Alt = { id: string; texto: string }

async function main() {
  const aplicar = !process.argv.includes("--dry-run")
  const qs = await prisma.questao.findMany({
    where: { tipo: "multipla" },
    select: { id: true, materia: true, modulo: true, hash: true, gabarito: true, enunciado: true, explicacao: true, alternativas: true },
    orderBy: { hash: "asc" },
  })

  // distribuição atual por matéria
  const dist = new Map<string, Record<string, number>>()
  for (const q of qs) {
    const d = dist.get(q.materia) ?? {}
    d[q.gabarito] = (d[q.gabarito] ?? 0) + 1
    dist.set(q.materia, d)
  }
  const viciadas = new Set(
    [...dist.entries()]
      .filter(([, d]) => {
        const total = Object.values(d).reduce((s, n) => s + n, 0)
        return Math.max(...Object.values(d)) / total >= VIES_MIN
      })
      .map(([m]) => m)
  )

  let alteradas = 0, puladasRef = 0, puladasForma = 0
  const porMateria = new Map<string, number>()
  // round-robin por matéria garante ~20% em cada letra
  const cursor = new Map<string, number>()

  for (const q of qs) {
    if (!viciadas.has(q.materia)) continue
    const alts = q.alternativas as unknown as Alt[]
    if (!Array.isArray(alts) || alts.length !== 5 || !LETRAS.includes(q.gabarito as typeof LETRAS[number])) { puladasForma++; continue }
    if (REF_LETRA.test(q.explicacao ?? "") || REF_LETRA.test(q.enunciado)) { puladasRef++; continue }

    const i = cursor.get(q.materia) ?? 0
    cursor.set(q.materia, i + 1)
    const alvo = LETRAS[i % 5]
    if (alvo === q.gabarito) continue

    const iCerta = alts.findIndex(a => a.id === q.gabarito)
    const iAlvo = alts.findIndex(a => a.id === alvo)
    if (iCerta < 0 || iAlvo < 0) { puladasForma++; continue }

    // troca os TEXTOS mantendo os ids A–E na ordem
    const novas = alts.map(a => ({ ...a }))
    const tmp = novas[iCerta].texto
    novas[iCerta].texto = novas[iAlvo].texto
    novas[iAlvo].texto = tmp

    if (aplicar) {
      await prisma.questao.update({
        where: { id: q.id },
        data: { alternativas: novas as unknown as object, gabarito: alvo },
      })
    }
    alteradas++
    porMateria.set(q.materia, (porMateria.get(q.materia) ?? 0) + 1)
  }

  console.log(`${aplicar ? "APLICADO" : "DRY-RUN"} · matérias viciadas: ${viciadas.size} · questões alteradas: ${alteradas}`)
  console.log(`puladas por citar letra na explicação: ${puladasRef} · por forma inesperada: ${puladasForma}`)
  console.log([...porMateria.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m}:${n}`).join(" "))

  // confere o resultado
  const depois = await prisma.questao.findMany({ where: { tipo: "multipla", materia: { in: [...viciadas] } }, select: { materia: true, gabarito: true } })
  const d2 = new Map<string, Record<string, number>>()
  for (const q of depois) {
    const d = d2.get(q.materia) ?? {}
    d[q.gabarito] = (d[q.gabarito] ?? 0) + 1
    d2.set(q.materia, d)
  }
  console.log("\nmateria | A B C D E | maior%")
  for (const [m, d] of [...d2.entries()].sort()) {
    const total = Object.values(d).reduce((s, n) => s + n, 0)
    const pct = Math.round((Math.max(...Object.values(d)) / total) * 100)
    console.log(`${m} | ${LETRAS.map(l => d[l] ?? 0).join(" ")} | ${pct}%`)
  }
}

main().finally(() => prisma.$disconnect())
