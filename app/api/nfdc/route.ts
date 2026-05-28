import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { nfdc, userId } = await req.json()
  const val = Number(nfdc)
  if (isNaN(val) || val < 0 || val > 10) {
    return NextResponse.json({ error: "NFDC deve ser entre 0 e 10" }, { status: 400 })
  }

  // Aluno só atualiza a própria; admin pode atualizar qualquer um
  const targetId = session.user.isAdmin && userId ? userId : session.user.id

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { nfdc: val },
    select: { id: true, nfdc: true },
  })
  return NextResponse.json(user)
}
