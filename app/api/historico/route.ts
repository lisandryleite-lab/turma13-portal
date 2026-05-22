import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const matricula = searchParams.get("matricula")
  const disciplina = searchParams.get("disciplina")
  const tipo = searchParams.get("tipo")
  const dataInicio = searchParams.get("dataInicio")
  const dataFim = searchParams.get("dataFim")

  const filtroUser = matricula
    ? await prisma.user.findUnique({ where: { matricula: Number(matricula) }, select: { id: true } })
    : null

  const historico = await prisma.historicoNota.findMany({
    where: {
      ...(filtroUser ? { nota: { userId: filtroUser.id } } : {}),
      ...(disciplina ? { disciplina } : {}),
      ...(tipo ? { tipo } : {}),
      ...(dataInicio || dataFim
        ? {
            createdAt: {
              ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
              ...(dataFim ? { lte: new Date(dataFim + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    include: {
      nota: { include: { user: { select: { nomeGuerra: true, matricula: true } } } },
      alteradoPor: { select: { nomeGuerra: true, matricula: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(historico)
}
