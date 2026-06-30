import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"

// Pedido individual do aluno dentro de um lanche coletivo.

// POST: o aluno (logado) salva/atualiza o próprio pedido.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id

  const { pedidoId, itens } = await req.json()
  if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })

  const pedido = await prisma.pedidoLanche.findUnique({
    where: { id: pedidoId },
    include: { itens: { select: { id: true } } },
  })
  if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
  if (!pedido.aberto) return NextResponse.json({ error: "Pedido encerrado" }, { status: 400 })

  const validos = new Set(pedido.itens.map(i => i.id))
  const linhas = (Array.isArray(itens) ? itens : [])
    .filter((l: { itemId?: string; quantidade?: unknown }) => l?.itemId && validos.has(l.itemId) && Number(l.quantidade) > 0)
    .map((l: { itemId: string; quantidade: unknown }) => ({ itemId: l.itemId, quantidade: Math.floor(Number(l.quantidade)) }))

  const pa = await prisma.pedidoLancheAluno.upsert({
    where: { pedidoId_userId: { pedidoId, userId } },
    update: {},
    create: { pedidoId, userId },
  })

  // substitui as linhas pelo novo conjunto
  await prisma.linhaPedidoLanche.deleteMany({ where: { pedidoAlunoId: pa.id } })
  if (linhas.length > 0) {
    await prisma.linhaPedidoLanche.createMany({
      data: linhas.map(l => ({ pedidoAlunoId: pa.id, itemId: l.itemId, quantidade: l.quantidade })),
    })
  }

  // sem itens = removeu o pedido
  if (linhas.length === 0) {
    await prisma.pedidoLancheAluno.delete({ where: { id: pa.id } })
    return NextResponse.json({ ok: true, removido: true })
  }

  return NextResponse.json({ ok: true })
}

// PATCH: tesoureiro confirma pagamento.
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, pago } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const pa = await prisma.pedidoLancheAluno.update({
    where: { id },
    data: { pago: Boolean(pago), dataPagamento: pago ? new Date() : null },
  })
  return NextResponse.json(pa)
}

// DELETE: remover um pedido individual (admin, ou o próprio dono).
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const pa = await prisma.pedidoLancheAluno.findUnique({ where: { id }, select: { userId: true } })
  if (!pa) return NextResponse.json({ ok: true })
  if (!ehGestorFinanceiro(session) && pa.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }
  await prisma.pedidoLancheAluno.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
