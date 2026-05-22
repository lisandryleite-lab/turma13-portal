import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const disciplinas = await prisma.disciplina.findMany({ orderBy: { sigla: "asc" } })
  return NextResponse.json(disciplinas)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { sigla, cargaMinistrada, status } = await req.json()
  await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada, status } })
  return NextResponse.json({ ok: true })
}
