import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const r = await prisma.escalaAluno.findUnique({ where: { id } })
  if (!r) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  if (!isAdmin && r.userId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  await prisma.escalaAluno.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const r = await prisma.escalaAluno.findUnique({ where: { id } })
  if (!r) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  if (!isAdmin && r.userId !== userId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const atualizado = await prisma.escalaAluno.update({ where: { id }, data: { ...body, data: new Date(body.data) } })
  return NextResponse.json(atualizado)
}
