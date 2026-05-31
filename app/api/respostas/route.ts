import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Registra a resposta do aluno. O ACERTO é decidido no servidor (não confia no client).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const questaoId = String(body.questaoId || "")
  const resposta = String(body.resposta || "")
  const modo = body.modo === "simulado" ? "simulado" : "resolver"
  if (!questaoId || !resposta) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })

  const questao = await prisma.questao.findUnique({ where: { id: questaoId } })
  if (!questao) return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 })

  const acertou = resposta.trim().toLowerCase() === questao.gabarito.trim().toLowerCase()

  await prisma.resposta.create({ data: { userId, questaoId, resposta, acertou, modo } })

  return NextResponse.json({ acertou, gabarito: questao.gabarito, explicacao: questao.explicacao })
}
