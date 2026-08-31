import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, z, zId } from "@/lib/api"

const AtualizarNfdc = z.object({
  nfdc: z.coerce.number().min(0, "NFDC deve ser entre 0 e 10").max(10, "NFDC deve ser entre 0 e 10"),
  userId: zId.optional(),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const { nfdc, userId } = await lerCorpo(req, AtualizarNfdc)

  // Aluno só atualiza a própria; admin pode atualizar qualquer um
  const targetId = session.user.isAdmin && userId ? userId : session.user.id

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { nfdc },
    select: { id: true, nfdc: true },
  })
  return NextResponse.json(user)
})
