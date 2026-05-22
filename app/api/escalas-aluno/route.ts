import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const escalas = isAdmin
    ? await prisma.escalaAluno.findMany({ include: { user: { select: { nomeGuerra: true, matricula: true } } }, orderBy: { data: "desc" } })
    : await prisma.escalaAluno.findMany({ where: { userId }, orderBy: { data: "desc" } })

  return NextResponse.json(escalas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const { tipo, nome, data, horaInicio, horaFim, funcao, local, descricao, observacao } = body

  const r = await prisma.escalaAluno.create({
    data: { userId, tipo, nome, data: new Date(data), horaInicio, horaFim, funcao, local, descricao, observacao },
  })
  return NextResponse.json(r)
}
