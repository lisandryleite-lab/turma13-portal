import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, proibido, ErroHttp, z, zId } from "@/lib/api"

// Pedido individual do aluno dentro de um lanche coletivo.

const SalvarPedido = z.object({
  pedidoId: zId,
  itens: z.array(z.object({
    itemId: zId,
    quantidade: z.coerce.number(),
  })).optional(),
})

// POST: o aluno (logado) salva/atualiza o próprio pedido.
export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw naoAutorizado()
  const userId = session.user.id

  const { pedidoId, itens } = await lerCorpo(req, SalvarPedido)

  const pedido = await prisma.pedidoLanche.findUnique({
    where: { id: pedidoId },
    include: { itens: { select: { id: true } } },
  })
  if (!pedido) throw naoEncontrado("Pedido")
  if (!pedido.aberto) throw new ErroHttp(400, "Pedido encerrado")

  const validos = new Set(pedido.itens.map(i => i.id))
  const linhas = (itens ?? [])
    .filter(l => validos.has(l.itemId) && l.quantidade > 0)
    .map(l => ({ itemId: l.itemId, quantidade: Math.floor(l.quantidade) }))

  const pa = await prisma.pedidoLancheAluno.upsert({
    where: { pedidoId_userId: { pedidoId, userId } },
    update: {},
    create: { pedidoId, userId },
  })

  // sem itens = removeu o pedido
  if (linhas.length === 0) {
    await prisma.pedidoLancheAluno.delete({ where: { id: pa.id } })
    return NextResponse.json({ ok: true, removido: true })
  }

  // Substitui as linhas pelo novo conjunto — numa transação só, para não
  // deixar o pedido sem itens se a segunda consulta falhar no meio.
  await prisma.$transaction([
    prisma.linhaPedidoLanche.deleteMany({ where: { pedidoAlunoId: pa.id } }),
    prisma.linhaPedidoLanche.createMany({
      data: linhas.map(l => ({ pedidoAlunoId: pa.id, itemId: l.itemId, quantidade: l.quantidade })),
    }),
  ])

  return NextResponse.json({ ok: true })
})

// PATCH: tesoureiro confirma pagamento.
export const PATCH = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) throw proibido()

  const { id, pago } = await lerCorpo(req, z.object({ id: zId, pago: z.boolean().optional() }))
  const pa = await prisma.pedidoLancheAluno.update({
    where: { id },
    data: { pago: Boolean(pago), dataPagamento: pago ? new Date() : null },
  })
  return NextResponse.json(pa)
})

// DELETE: remover um pedido individual (gestor, ou o próprio dono).
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw naoAutorizado()

  const { id } = await lerCorpo(req, z.object({ id: zId }))

  const pa = await prisma.pedidoLancheAluno.findUnique({ where: { id }, select: { userId: true } })
  if (!pa) return NextResponse.json({ ok: true })
  if (!ehGestorFinanceiro(session) && pa.userId !== session.user.id) throw proibido()

  await prisma.pedidoLancheAluno.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
