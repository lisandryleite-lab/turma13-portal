import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const membros = await prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] })
  return NextResponse.json(membros)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { grupo, mat, nome } = await req.json()
  const membro = await prisma.faxinaGrupoMembro.upsert({
    where: { grupo_mat: { grupo, mat: Number(mat) } },
    update: { nome, grupo },
    create: { grupo, mat: Number(mat), nome },
  })
  return NextResponse.json(membro)
}

export async function PATCH(req: NextRequest) {
  // Mover membro para outro grupo
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, grupo } = await req.json()
  const membro = await prisma.faxinaGrupoMembro.update({ where: { id }, data: { grupo } })
  return NextResponse.json(membro)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.faxinaGrupoMembro.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
