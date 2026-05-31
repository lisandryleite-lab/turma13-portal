import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET ?materia= -> flashcards da matéria (para estudo)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const materia = (req.nextUrl.searchParams.get("materia") || "").toUpperCase()
  if (!materia) return NextResponse.json({ error: "Informe a matéria" }, { status: 400 })

  const cards = await prisma.flashcard.findMany({
    where: { materia },
    orderBy: [{ modulo: "asc" }, { ordem: "asc" }],
  })
  return NextResponse.json(cards)
}
