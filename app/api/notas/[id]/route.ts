import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const existente = await prisma.nota.findUnique({ where: { id } })
  if (!existente) return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 })
  if (!isAdmin && existente.userId !== userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const { disciplina, avaliacao, nota, peso, data, observacao } = body

  const notaNum = Number(nota)
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10)
    return NextResponse.json({ error: "Nota deve ser entre 0 e 10" }, { status: 400 })

  const atualizado = await prisma.nota.update({
    where: { id },
    data: { disciplina, avaliacao, nota: notaNum, peso: Number(peso) || 1, data: new Date(data), observacao: observacao || null },
  })

  const campos: Array<[string, string, string]> = []
  if (existente.nota !== notaNum) campos.push(["nota", String(existente.nota), String(notaNum)])
  if (existente.disciplina !== disciplina) campos.push(["disciplina", existente.disciplina, disciplina])
  if (existente.avaliacao !== avaliacao) campos.push(["avaliacao", existente.avaliacao, avaliacao])
  if (existente.peso !== Number(peso)) campos.push(["peso", String(existente.peso), String(Number(peso))])

  for (const [campo, anterior, novo] of campos) {
    await prisma.historicoNota.create({
      data: {
        notaId: id,
        alteradoPorId: userId,
        tipo: "edicao",
        campoAlterado: campo,
        valorAnterior: anterior,
        valorNovo: novo,
        disciplina: atualizado.disciplina,
        avaliacao: atualizado.avaliacao,
        observacao: observacao || null,
      },
    })
  }

  return NextResponse.json(atualizado)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const existente = await prisma.nota.findUnique({ where: { id } })
  if (!existente) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  if (!isAdmin && existente.userId !== userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  await prisma.historicoNota.create({
    data: {
      notaId: id,
      alteradoPorId: userId,
      tipo: "exclusao",
      valorAnterior: String(existente.nota),
      disciplina: existente.disciplina,
      avaliacao: existente.avaliacao,
    },
  })

  await prisma.nota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
