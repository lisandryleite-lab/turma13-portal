import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, z, zId } from "@/lib/api"

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const { missaoId } = await lerCorpo(req, z.object({ missaoId: zId }))

  const userId = session.user.id
  const existing = await prisma.missaoConcluida.findUnique({
    where: { missaoId_userId: { missaoId, userId } },
  })

  if (existing) {
    await prisma.missaoConcluida.delete({ where: { id: existing.id } })
    return NextResponse.json({ concluida: false })
  }

  // missaoId inexistente vira P2003 → 409 pelo rotaApi (antes: 500 genérico).
  await prisma.missaoConcluida.create({ data: { missaoId, userId } })
  return NextResponse.json({ concluida: true })
})
