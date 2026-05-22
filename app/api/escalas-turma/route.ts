import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [faxinas, servicos] = await Promise.all([
    prisma.escalaTurmaFaxina.findMany({ orderBy: { data: "asc" } }),
    prisma.escalaTurmaServico.findMany({ orderBy: { data: "asc" } }),
  ])
  return NextResponse.json({ faxinas, servicos })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const { tipo, data, posicao, userId, canga, observacao } = body

  if (tipo === "faxina") {
    const r = await prisma.escalaTurmaFaxina.create({ data: { data: new Date(data), posicao, userId, canga, observacao } })
    return NextResponse.json(r)
  } else if (tipo === "servico") {
    const r = await prisma.escalaTurmaServico.create({ data: { data: new Date(data), posicao, userId, canga, observacao } })
    return NextResponse.json(r)
  }
  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
}
