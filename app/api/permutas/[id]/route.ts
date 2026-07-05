import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const { id } = await params

  const body = await req.json() as { acao?: "aceitar" | "recusar"; seiNumero?: string; seiObservacao?: string }

  const solicitacao = await prisma.permutaSolicitacao.findUnique({ where: { id }, include: { participantes: true } })
  if (!solicitacao) return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })

  // Preencher número do SEI — qualquer participante logado envolvido pode registrar
  if (body.seiNumero !== undefined || body.seiObservacao !== undefined) {
    const souParticipante = solicitacao.participantes.some(p => p.userId === session.user.id)
    if (!souParticipante) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    const atualizado = await prisma.permutaSolicitacao.update({
      where: { id },
      data: {
        ...(body.seiNumero !== undefined ? { seiNumero: body.seiNumero } : {}),
        ...(body.seiObservacao !== undefined ? { seiObservacao: body.seiObservacao } : {}),
      },
    })
    return NextResponse.json(atualizado)
  }

  if (body.acao !== "aceitar" && body.acao !== "recusar") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  }

  const meuParticipante = solicitacao.participantes.find(p => p.userId === session.user.id)
  if (!meuParticipante) return NextResponse.json({ error: "Você não faz parte dessa permuta" }, { status: 403 })
  if (meuParticipante.status !== "pendente") {
    return NextResponse.json({ error: "Essa permuta já foi respondida" }, { status: 409 })
  }

  const novoStatus = body.acao === "aceitar" ? "aceito" : "recusado"
  await prisma.permutaParticipante.update({
    where: { id: meuParticipante.id },
    data: { status: novoStatus, respondidoEm: new Date() },
  })

  const participantesAtualizados = solicitacao.participantes.map(p =>
    p.id === meuParticipante.id ? { ...p, status: novoStatus } : p
  )

  let statusGeral = solicitacao.status
  if (participantesAtualizados.some(p => p.status === "recusado")) {
    statusGeral = "recusada"
  } else if (participantesAtualizados.every(p => p.status === "aceito")) {
    statusGeral = "aceita"
  }

  await prisma.permutaSolicitacao.update({ where: { id }, data: { status: statusGeral } })

  // Se recusada, reabre as ofertas dos participantes com login pras datas envolvidas
  if (statusGeral === "recusada") {
    await Promise.all(
      participantesAtualizados
        .filter(p => p.userId)
        .map(p =>
          prisma.permutaOferta.updateMany({
            where: { userId: p.userId!, cedeData: p.cedeData, status: "fechada" },
            data: { status: "aberta" },
          })
        )
    )
  }

  const final = await prisma.permutaSolicitacao.findUnique({ where: { id }, include: { participantes: true } })
  return NextResponse.json(final)
}
