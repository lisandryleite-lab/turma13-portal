import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { grupoPlantaoPorData, parseDataLocal } from "@/lib/escalas"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const ofertas = await prisma.permutaOferta.findMany({
    where: { status: "aberta", userId: { not: session.user.id } },
    include: { user: { select: { id: true, matricula: true, nomeGuerra: true, grupoPlantao: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(ofertas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { cedeData } = await req.json()
  if (!cedeData) {
    return NextResponse.json({ error: "cedeData é obrigatório" }, { status: 400 })
  }

  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { grupoPlantao: true } })
  if (!me?.grupoPlantao) {
    return NextResponse.json({ error: "Seu cadastro não tem um grupo de plantão definido" }, { status: 400 })
  }

  const dataCede = parseDataLocal(cedeData)
  if (grupoPlantaoPorData(dataCede) !== me.grupoPlantao) {
    return NextResponse.json({ error: "Essa data não é um dia de plantão do seu grupo" }, { status: 400 })
  }

  // Já existe compromisso NUMA SOLICITAÇÃO (pendente/aceita) pra essa data? Reabrir/atualizar
  // a própria oferta em aberto é sempre permitido (upsert abaixo é idempotente).
  const participanteExistente = await prisma.permutaParticipante.findFirst({
    where: { userId: session.user.id, cedeData: dataCede, status: { in: ["pendente", "aceito"] } },
  })
  if (participanteExistente) {
    return NextResponse.json({ error: "Esse dia já está em uma permuta pendente ou aceita" }, { status: 409 })
  }

  const oferta = await prisma.permutaOferta.upsert({
    where: { userId_cedeData: { userId: session.user.id, cedeData: dataCede } },
    update: { status: "aberta" },
    create: { userId: session.user.id, cedeData: dataCede },
  })
  return NextResponse.json(oferta)
}

// Despublica uma oferta. Aceita { id } ou { cedeData } (a data que o aluno tinha marcado).
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id, cedeData } = await req.json()
  const oferta = id
    ? await prisma.permutaOferta.findUnique({ where: { id } })
    : cedeData
      ? await prisma.permutaOferta.findUnique({ where: { userId_cedeData: { userId: session.user.id, cedeData: parseDataLocal(cedeData) } } })
      : null
  if (!oferta || oferta.userId !== session.user.id) {
    return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 })
  }
  await prisma.permutaOferta.update({ where: { id: oferta.id }, data: { status: "cancelada" } })
  return NextResponse.json({ ok: true })
}
