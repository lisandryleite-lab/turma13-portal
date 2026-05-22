import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth()
  return session?.user?.isAdmin ? session : null
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  const { id } = await params
  const tipo = new URL(req.url).searchParams.get("tipo")

  if (tipo === "faxina") await prisma.escalaTurmaFaxina.delete({ where: { id } })
  else if (tipo === "servico") await prisma.escalaTurmaServico.delete({ where: { id } })
  else return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })

  return NextResponse.json({ ok: true })
}
