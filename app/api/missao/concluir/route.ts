import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { missaoId } = await req.json()
  if (!missaoId) return NextResponse.json({ error: "missaoId obrigatório" }, { status: 400 })

  const userId = session.user.id
  const existing = await prisma.missaoConcluida.findUnique({
    where: { missaoId_userId: { missaoId, userId } },
  })

  if (existing) {
    await prisma.missaoConcluida.delete({ where: { id: existing.id } })
    return NextResponse.json({ concluida: false })
  } else {
    await prisma.missaoConcluida.create({ data: { missaoId, userId } })
    return NextResponse.json({ concluida: true })
  }
}
