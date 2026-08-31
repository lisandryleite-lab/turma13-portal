import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, naoAutorizado, ErroHttp } from "@/lib/api"

// GET ?materia= -> flashcards da matéria (para estudo)
export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) throw new ErroHttp(400, "Informe a matéria")

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const cards = await prisma.flashcard.findMany({
    where,
    orderBy: [{ modulo: "asc" }, { ordem: "asc" }],
  })
  return NextResponse.json(cards)
})
