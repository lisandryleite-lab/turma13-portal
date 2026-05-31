import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Lista questões de uma matéria (para Resolver/Simulado).
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  const limit = Number(sp.get("limit")) || 0
  const shuffle = sp.get("shuffle") === "1"
  if (!materia) return NextResponse.json({ error: "Informe a matéria" }, { status: 400 })

  const where: { materia: string; modulo?: string; tipo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""        // "" = sem módulo
  if (sp.get("tipo")) where.tipo = sp.get("tipo")!                   // certo_errado | multipla | dissertativa

  let questoes = await prisma.questao.findMany({ where })
  if (shuffle) questoes = questoes.sort(() => Math.random() - 0.5)
  if (limit > 0) questoes = questoes.slice(0, limit)

  return NextResponse.json(questoes)
}
