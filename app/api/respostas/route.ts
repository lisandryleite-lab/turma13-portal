import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, z, zId } from "@/lib/api"

const Responder = z.object({
  questaoId: zId,
  resposta: z.string().min(1, "obrigatório"),
  modo: z.string().optional(),
})

// Registra a resposta do aluno. O ACERTO é decidido no servidor (não confia no client).
export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!

  const body = await lerCorpo(req, Responder)
  const modo = body.modo === "simulado" ? "simulado" : "resolver"

  const questao = await prisma.questao.findUnique({ where: { id: body.questaoId } })
  if (!questao) throw naoEncontrado("Questão")

  const acertou = body.resposta.trim().toLowerCase() === questao.gabarito.trim().toLowerCase()

  await prisma.resposta.create({ data: { userId, questaoId: body.questaoId, resposta: body.resposta, acertou, modo } })

  return NextResponse.json({ acertou, gabarito: questao.gabarito, explicacao: questao.explicacao })
})
