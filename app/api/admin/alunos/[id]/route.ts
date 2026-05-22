import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin()
  if (!s) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  const { id } = await params

  const body = await req.json()
  const { password, ...rest } = body

  const data: any = { ...rest }
  if (rest.matricula) data.matricula = Number(rest.matricula)
  data.cangaPar = rest.cangaPar ? Number(rest.cangaPar) : null
  if (password) data.password = await bcrypt.hash(password, 12)

  await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin()
  if (!s) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
