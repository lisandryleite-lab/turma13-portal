import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"

// Admin gerencia o pedido coletivo (header + cardápio).

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { titulo, restaurante, responsavel, instrucoes, prazo, itens } = await req.json()
  if (!titulo) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 })

  const cardapio = (Array.isArray(itens) ? itens : [])
    .filter((i: { nome?: string; preco?: unknown }) => i?.nome && !isNaN(Number(i.preco)))
    .map((i: { nome: string; preco: unknown }, idx: number) => ({ nome: String(i.nome), preco: Number(i.preco), ordem: idx }))

  if (cardapio.length === 0) return NextResponse.json({ error: "Adicione ao menos um item ao cardápio" }, { status: 400 })

  const pedido = await prisma.pedidoLanche.create({
    data: {
      titulo,
      restaurante: restaurante || null,
      responsavel: responsavel || "",
      instrucoes: instrucoes || null,
      prazo: prazo ? new Date(prazo) : null,
      itens: { create: cardapio },
    },
  })
  return NextResponse.json(pedido)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, aberto, titulo, restaurante, responsavel, instrucoes, prazo } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const pedido = await prisma.pedidoLanche.update({
    where: { id },
    data: {
      ...(aberto !== undefined && { aberto: Boolean(aberto) }),
      ...(titulo !== undefined && { titulo }),
      ...(restaurante !== undefined && { restaurante }),
      ...(responsavel !== undefined && { responsavel }),
      ...(instrucoes !== undefined && { instrucoes }),
      ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
    },
  })
  return NextResponse.json(pedido)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.pedidoLanche.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
