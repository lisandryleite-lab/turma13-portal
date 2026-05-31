import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Lista questões de uma matéria (para Resolver/Simulado).
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const materia = (req.nextUrl.searchParams.get("materia") || "").toUpperCase()
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 0
  const shuffle = req.nextUrl.searchParams.get("shuffle") === "1"
  if (!materia) return NextResponse.json({ error: "Informe a matéria" }, { status: 400 })

  let questoes = await prisma.questao.findMany({ where: { materia } })
  if (shuffle) questoes = questoes.sort(() => Math.random() - 0.5)
  if (limit > 0) questoes = questoes.slice(0, limit)

  return NextResponse.json(questoes)
}
