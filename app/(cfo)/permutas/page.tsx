import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { grupoPlantaoPorData } from "@/lib/escalas"
import { tipoDia } from "@/lib/feriados"
import { PermutasClient } from "./permutas-client"

export const dynamic = "force-dynamic"

function dOnlyServer(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default async function PermutasPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, matricula: true, nomeGuerra: true, grupoPlantao: true },
  })

  const hoje = new Date()
  const anoIni = hoje.getFullYear()
  const mesIni = hoje.getMonth() + 1

  // Janela rolante de 6 meses (mês atual → +5)
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anoIni, mesIni - 1 + i, 1)
    return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
  })
  const ultimoMes = meses[meses.length - 1]
  const dataInicio = new Date(anoIni, mesIni - 1, 1)
  const dataFim = new Date(ultimoMes.ano, ultimoMes.mes, 0)

  const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const dias: { data: string; diaSemana: string; tipo: "util" | "fds"; grupoPlantao: string }[] = []
  for (let cursor = new Date(dataInicio); cursor <= dataFim; cursor.setDate(cursor.getDate() + 1)) {
    const d = new Date(cursor)
    dias.push({
      data: dOnlyServer(d),
      diaSemana: DIAS_SEMANA[d.getDay()],
      tipo: tipoDia(d),
      grupoPlantao: grupoPlantaoPorData(d),
    })
  }

  const [militares, ofertas, minhasOfertas, enviadas, recebidas] = await Promise.all([
    prisma.militarPlantao.findMany({ orderBy: { matricula: "asc" } }),
    me
      ? prisma.permutaOferta.findMany({
          where: { status: "aberta", userId: { not: me.id } },
          include: { user: { select: { matricula: true, nomeGuerra: true, grupoPlantao: true } } },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    me
      ? prisma.permutaOferta.findMany({ where: { status: "aberta", userId: me.id } })
      : Promise.resolve([]),
    me
      ? prisma.permutaSolicitacao.findMany({
          where: { criadoPorId: me.id },
          include: { participantes: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    me
      ? prisma.permutaSolicitacao.findMany({
          where: { criadoPorId: { not: me.id }, participantes: { some: { userId: me.id } } },
          include: { participantes: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ])

  const serializar = (s: (typeof enviadas)[number]) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    participantes: s.participantes.map(p => ({ ...p, cedeData: p.cedeData.toISOString(), respondidoEm: p.respondidoEm?.toISOString() ?? null })),
  })

  return (
    <PermutasClient
      me={me}
      isAdmin={!!session.user.isAdmin}
      dias={dias}
      meses={meses}
      militares={militares.map(m => ({ matricula: m.matricula, nome: m.nome, grupoPlantao: m.grupoPlantao }))}
      minhasOfertasIniciais={minhasOfertas.map(o => dOnlyServer(o.cedeData))}
      ofertasIniciais={ofertas.map(o => ({
        ...o,
        cedeData: o.cedeData.toISOString(),
        querData: o.querData.toISOString(),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }))}
      solicitacoesIniciais={{
        enviadas: enviadas.map(serializar),
        recebidas: recebidas.map(serializar),
      }}
    />
  )
}
