import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, naoAutorizado, naoEncontrado, ErroHttp } from "@/lib/api"

// GET ?id=  -> memento completo (conteúdo Markdown)
export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) throw new ErroHttp(400, "id ausente")

  const m = await prisma.memento.findUnique({ where: { id } })
  if (!m) throw naoEncontrado("Memento")
  return NextResponse.json(m)
})
