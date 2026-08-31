import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, naoAutorizado, ErroHttp } from "@/lib/api"

/** Fisher-Yates. `sort(() => Math.random() - 0.5)` não embaralha uniforme. */
function embaralhar<T>(itens: T[]): T[] {
  const a = [...itens]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Lista questões de uma matéria (para Resolver/Simulado).
export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  const limit = Number(sp.get("limit")) || 0
  const shuffle = sp.get("shuffle") === "1"
  if (!materia) throw new ErroHttp(400, "Informe a matéria")

  const where: { materia: string; modulo?: string; tipo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""        // "" = sem módulo
  if (sp.get("tipo")) where.tipo = sp.get("tipo")!                   // certo_errado | multipla | dissertativa

  let questoes = await prisma.questao.findMany({ where })
  if (shuffle) questoes = embaralhar(questoes)
  if (limit > 0) questoes = questoes.slice(0, limit)

  return NextResponse.json(questoes)
})
