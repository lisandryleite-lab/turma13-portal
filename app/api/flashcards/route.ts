import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET ?materia= -> flashcards da matéria (para estudo)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) return NextResponse.json({ error: "Informe a matéria" }, { status: 400 })

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const cards = await prisma.flashcard.findMany({
    where,
    orderBy: [{ modulo: "asc" }, { ordem: "asc" }],
  })
  return NextResponse.json(cards)
}
