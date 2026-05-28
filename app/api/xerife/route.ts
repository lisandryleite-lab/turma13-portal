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
  if (!body.dataFim) {
    await prisma.xerife.updateMany({ where: { atual: true }, data: { atual: false } })
  }
  const xerife = await prisma.xerife.create({
    data: {
      matricula: Number(body.matricula),
      nomeGuerra: body.nomeGuerra,
      dataInicio: new Date(body.dataInicio),
      dataFim: body.dataFim ? new Date(body.dataFim) : null,
      atual: !body.dataFim,
    },
  })
  return NextResponse.json(xerife)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const { id, matricula, nomeGuerra, dataInicio, dataFim, atual } = body

  if (atual) {
    await prisma.xerife.updateMany({ where: { atual: true, id: { not: id } }, data: { atual: false } })
  }

  const xerife = await prisma.xerife.update({
    where: { id },
    data: {
      matricula: Number(matricula),
      nomeGuerra,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
      atual: !!atual,
    },
  })
  return NextResponse.json(xerife)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.xerife.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
