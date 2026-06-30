import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { titulo, tipo, valor, responsavel, instrucoes, prazo, participantes } = await req.json()
  if (!titulo || isNaN(Number(valor))) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  // participantes: lista opcional de ids de User — se omitida, vale para todos os ativos da Turma 13
  const alunos = Array.isArray(participantes) && participantes.length > 0
    ? await prisma.user.findMany({ where: { id: { in: participantes } }, select: { id: true } })
    : await prisma.user.findMany({ where: { ativo: true, turma13: true }, select: { id: true } })

  const cota = await prisma.cotaFinanceira.create({
    data: {
      titulo,
      tipo: tipo === "extra" ? "extra" : "mensal",
      valor: Number(valor),
      responsavel: responsavel || "",
      instrucoes: instrucoes || null,
      prazo: prazo ? new Date(prazo) : null,
      pagamentos: { create: alunos.map(a => ({ userId: a.id })) },
    },
  })
  return NextResponse.json(cota)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id, titulo, tipo, valor, responsavel, instrucoes, prazo, ativa } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

  const cota = await prisma.cotaFinanceira.update({
    where: { id },
    data: {
      ...(titulo !== undefined && { titulo }),
      ...(tipo !== undefined && { tipo: tipo === "extra" ? "extra" : "mensal" }),
      ...(valor !== undefined && !isNaN(Number(valor)) && { valor: Number(valor) }),
      ...(responsavel !== undefined && { responsavel }),
      ...(instrucoes !== undefined && { instrucoes }),
      ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
      ...(ativa !== undefined && { ativa: Boolean(ativa) }),
    },
  })
  return NextResponse.json(cota)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await req.json()
  await prisma.cotaFinanceira.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
