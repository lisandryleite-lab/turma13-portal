import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { grupoPlantaoPorData, parseDataLocal } from "@/lib/escalas"
import { tipoDia } from "@/lib/feriados"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const [enviadas, recebidas] = await Promise.all([
    prisma.permutaSolicitacao.findMany({
      where: { criadoPorId: session.user.id },
      include: { participantes: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.permutaSolicitacao.findMany({
      where: {
        criadoPorId: { not: session.user.id },
        participantes: { some: { userId: session.user.id } },
      },
      include: { participantes: true },
      orderBy: { createdAt: "desc" },
    }),
  ])
  return NextResponse.json({ enviadas, recebidas })
}

type ParteInput = { matricula: number; cedeData: string }

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json() as { meuCedeData: string; parceiro: ParteInput; terceiro?: ParteInput }
  const { meuCedeData, parceiro, terceiro } = body
  if (!meuCedeData || !parceiro?.matricula || !parceiro?.cedeData) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, matricula: true, nomeGuerra: true, grupoPlantao: true },
  })
  if (!me?.grupoPlantao) {
    return NextResponse.json({ error: "Seu cadastro não tem um grupo de plantão definido" }, { status: 400 })
  }

  async function resolverPessoa(p: ParteInput) {
    const militar = await prisma.militarPlantao.findUnique({ where: { matricula: p.matricula } })
    if (!militar) return null
    const usuario = await prisma.user.findUnique({ where: { matricula: p.matricula }, select: { id: true } })
    return { matricula: militar.matricula, nome: militar.nome, grupoPlantao: militar.grupoPlantao, userId: usuario?.id ?? null }
  }

  const [pParceiro, pTerceiro] = await Promise.all([
    resolverPessoa(parceiro),
    terceiro ? resolverPessoa(terceiro) : Promise.resolve(null),
  ])
  if (!pParceiro) return NextResponse.json({ error: "Parceiro não encontrado no cadastro de militares" }, { status: 404 })
  if (terceiro && !pTerceiro) return NextResponse.json({ error: "Terceiro não encontrado no cadastro de militares" }, { status: 404 })

  const dataMinha = parseDataLocal(meuCedeData)
  const dataParceiro = parseDataLocal(parceiro.cedeData)
  const dataTerceiro = terceiro ? parseDataLocal(terceiro.cedeData) : null

  // Cada um precisa realmente estar de plantão no dia que está cedendo
  if (grupoPlantaoPorData(dataMinha) !== me.grupoPlantao) {
    return NextResponse.json({ error: "A data escolhida não é o seu dia de plantão" }, { status: 400 })
  }
  if (grupoPlantaoPorData(dataParceiro) !== pParceiro.grupoPlantao) {
    return NextResponse.json({ error: `A data escolhida não é dia de plantão do grupo ${pParceiro.grupoPlantao}` }, { status: 400 })
  }
  if (dataTerceiro && pTerceiro && grupoPlantaoPorData(dataTerceiro) !== pTerceiro.grupoPlantao) {
    return NextResponse.json({ error: `A data escolhida não é dia de plantão do grupo ${pTerceiro.grupoPlantao}` }, { status: 400 })
  }

  // Equipes distintas
  const grupos = [me.grupoPlantao, pParceiro.grupoPlantao, pTerceiro?.grupoPlantao].filter(Boolean)
  if (new Set(grupos).size !== grupos.length) {
    return NextResponse.json({ error: "As pessoas da permuta precisam ser de equipes diferentes" }, { status: 400 })
  }

  // Mesmo tipo de dia (útil/fim de semana ou feriado) pra todo mundo na cadeia
  const tipos = [tipoDia(dataMinha), tipoDia(dataParceiro), dataTerceiro ? tipoDia(dataTerceiro) : null].filter(Boolean)
  if (new Set(tipos).size !== 1) {
    return NextResponse.json({ error: "Só é possível trocar dia útil por dia útil, ou fim de semana/feriado por fim de semana/feriado" }, { status: 400 })
  }

  // Ninguém pode já estar comprometido com essas datas
  const conflito = await prisma.permutaParticipante.findFirst({
    where: {
      status: { in: ["pendente", "aceito"] },
      OR: [
        { matricula: me.matricula, cedeData: dataMinha },
        { matricula: pParceiro.matricula, cedeData: dataParceiro },
        ...(pTerceiro && dataTerceiro ? [{ matricula: pTerceiro.matricula, cedeData: dataTerceiro }] : []),
      ],
    },
  })
  if (conflito) {
    return NextResponse.json({ error: "Uma das datas já está amarrada a outra permuta pendente ou aceita" }, { status: 409 })
  }

  const agora = new Date()
  const participantesData = [
    { ordem: 1, userId: me.id, matricula: me.matricula, nome: me.nomeGuerra, grupoPlantao: me.grupoPlantao, cedeData: dataMinha, status: "aceito", respondidoEm: agora },
    { ordem: 2, userId: pParceiro.userId, matricula: pParceiro.matricula, nome: pParceiro.nome, grupoPlantao: pParceiro.grupoPlantao, cedeData: dataParceiro, status: pParceiro.userId ? "pendente" : "aceito", respondidoEm: pParceiro.userId ? null : agora },
    ...(pTerceiro && dataTerceiro ? [{ ordem: 3, userId: pTerceiro.userId, matricula: pTerceiro.matricula, nome: pTerceiro.nome, grupoPlantao: pTerceiro.grupoPlantao, cedeData: dataTerceiro, status: pTerceiro.userId ? "pendente" : "aceito", respondidoEm: pTerceiro.userId ? null : agora }] : []),
  ]
  const statusGeral = participantesData.every(p => p.status === "aceito") ? "aceita" : "pendente"

  const solicitacao = await prisma.permutaSolicitacao.create({
    data: {
      criadoPorId: me.id,
      status: statusGeral,
      participantes: { create: participantesData },
    },
    include: { participantes: true },
  })

  // Fecha ofertas abertas envolvidas nessas datas, pra sumir do "Buscar Permuta" enquanto se decide
  await prisma.permutaOferta.updateMany({
    where: {
      status: "aberta",
      OR: [
        { userId: me.id, cedeData: dataMinha },
        ...(pParceiro.userId ? [{ userId: pParceiro.userId, cedeData: dataParceiro }] : []),
        ...(pTerceiro?.userId && dataTerceiro ? [{ userId: pTerceiro.userId, cedeData: dataTerceiro }] : []),
      ],
    },
    data: { status: "fechada" },
  })

  return NextResponse.json(solicitacao)
}
