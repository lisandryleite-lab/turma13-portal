import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { cotaId, userId } = await req.json()
  if (!cotaId || !userId) return NextResponse.json({ error: "cotaId e userId obrigatórios" }, { status: 400 })

  const pagamento = await prisma.pagamentoCota.upsert({
    where: { cotaId_userId: { cotaId, userId } },
    update: {},
    create: { cotaId, userId },
  })
  return NextResponse.json(pagamento)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await prisma.pagamentoCota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, pago, observacao } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const pagamento = await prisma.pagamentoCota.update({
    where: { id },
    data: {
      pago: Boolean(pago),
      dataPagamento: pago ? new Date() : null,
      ...(observacao !== undefined && { observacao }),
    },
  })
  return NextResponse.json(pagamento)
}
