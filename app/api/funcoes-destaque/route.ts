import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/funcoes-destaque?ano=2026&mes=5
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ano = Number(searchParams.get("ano") || new Date().getFullYear())
  const mes = Number(searchParams.get("mes") || new Date().getMonth() + 1)

  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  const funcoes = await prisma.funcaoDestaqueDia.findMany({
    where: { data: { gte: inicio, lte: fim } },
    orderBy: [{ data: "asc" }, { funcao: "asc" }],
  })
  return NextResponse.json(funcoes)
}

// POST /api/funcoes-destaque  { funcoes: [{data, funcao, matricula}] }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { funcoes } = await req.json()
  if (!Array.isArray(funcoes)) return NextResponse.json({ error: "funcoes[] obrigatório" }, { status: 400 })

  for (const f of funcoes) {
    const data = new Date(f.data)
    data.setUTCHours(12, 0, 0, 0)
    await prisma.funcaoDestaqueDia.upsert({
      where: { data_funcao: { data, funcao: f.funcao } },
      update: { matricula: Number(f.matricula) },
      create: { data, funcao: f.funcao, matricula: Number(f.matricula) },
    })
  }
  return NextResponse.json({ ok: true })
}

// DELETE /api/funcoes-destaque  { id }
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.funcaoDestaqueDia.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
