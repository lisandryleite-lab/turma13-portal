import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET ?id=  -> memento completo (conteúdo Markdown)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 })

  const m = await prisma.memento.findUnique({ where: { id } })
  if (!m) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(m)
}
