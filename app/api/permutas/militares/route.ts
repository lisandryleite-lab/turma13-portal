import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GRUPOS_PLANTAO } from "@/lib/escalas"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { matricula, nome, grupoPlantao } = await req.json()
  const mat = Number(matricula)
  if (isNaN(mat) || !nome || !GRUPOS_PLANTAO.includes(grupoPlantao)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const militar = await prisma.militarPlantao.upsert({
    where: { matricula: mat },
    update: { nome, grupoPlantao },
    create: { matricula: mat, nome, grupoPlantao },
  })
  return NextResponse.json(militar)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { matricula } = await req.json()
  await prisma.militarPlantao.deleteMany({ where: { matricula: Number(matricula) } })
  return NextResponse.json({ ok: true })
}
