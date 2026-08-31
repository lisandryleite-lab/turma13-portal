import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, proibido } from "@/lib/api"

export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { searchParams } = new URL(req.url)
  const matricula = searchParams.get("matricula")
  const disciplina = searchParams.get("disciplina")
  const tipo = searchParams.get("tipo")
  const dataInicio = searchParams.get("dataInicio")
  const dataFim = searchParams.get("dataFim")

  // Datas inválidas viravam `Invalid Date` e o Prisma estourava com 500.
  const inicio = dataInicio && !Number.isNaN(Date.parse(dataInicio)) ? new Date(dataInicio) : null
  const fim = dataFim && !Number.isNaN(Date.parse(dataFim + "T23:59:59")) ? new Date(dataFim + "T23:59:59") : null

  const mat = matricula ? Number(matricula) : NaN
  const filtroUser = Number.isFinite(mat)
    ? await prisma.user.findUnique({ where: { matricula: mat }, select: { id: true } })
    : null

  const historico = await prisma.historicoNota.findMany({
    where: {
      ...(filtroUser ? { nota: { userId: filtroUser.id } } : {}),
      ...(disciplina ? { disciplina } : {}),
      ...(tipo ? { tipo } : {}),
      ...(inicio || fim
        ? { createdAt: { ...(inicio ? { gte: inicio } : {}), ...(fim ? { lte: fim } : {}) } }
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
})
