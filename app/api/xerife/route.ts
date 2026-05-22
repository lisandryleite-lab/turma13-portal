import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const xerifes = await prisma.xerife.findMany({ orderBy: { dataInicio: "desc" } })
  return NextResponse.json(xerifes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  await prisma.xerife.updateMany({ where: { atual: true }, data: { atual: false } })
  const xerife = await prisma.xerife.create({
    data: {
      matricula: Number(body.matricula),
      nomeGuerra: body.nomeGuerra,
      dataInicio: new Date(body.dataInicio),
      dataFim: body.dataFim ? new Date(body.dataFim) : null,
      atual: !!body.atual,
    },
  })
  return NextResponse.json(xerife)
}
