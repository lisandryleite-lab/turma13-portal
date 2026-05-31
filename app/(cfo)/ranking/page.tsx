import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RankingClient } from "./ranking-client"

export default async function RankingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [notas, historicoRows, turmaSize, opms, minhaPref, agregado] = await Promise.all([
    prisma.notaCFO.findMany({
      where: { userId: session.user.id! },
      orderBy: [{ materia: "asc" }, { modulo: "asc" }],
    }),
    prisma.notaHistorica.findMany({ select: { valorFinal: true } }),
    prisma.user.count({ where: { turma: 3 } }),
    prisma.oPM.findMany({ orderBy: { ordem: "asc" } }),
    prisma.preferenciaOPM.findUnique({ where: { userId: session.user.id! } }),
    prisma.preferenciaOPM.groupBy({ by: ["opcao1Id"], _count: { opcao1Id: true } }),
  ])

  // Ranking agregado ANÔNIMO: quantos escolheram cada OPM como 1ª opção (só contagem)
  const contagem1 = new Map(agregado.map(a => [a.opcao1Id, a._count.opcao1Id]))

  return (
    <RankingClient
      notasIniciais={notas.map(n => ({
        id: n.id,
        materia: n.materia,
        modulo: n.modulo,
        valor: n.valor,
      }))}
      nomeGuerra={session.user.nomeGuerra}
      historico={historicoRows.map(r => r.valorFinal)}
      turmaSize={turmaSize}
      opms={opms.map(o => ({ id: o.id, sigla: o.sigla, nome: o.nome, especial: o.especial }))}
      minhaPref={minhaPref ? { opcao1Id: minhaPref.opcao1Id, opcao2Id: minhaPref.opcao2Id, opcao3Id: minhaPref.opcao3Id } : null}
      agregado1={opms.map(o => ({ sigla: o.sigla, nome: o.nome, especial: o.especial, count: contagem1.get(o.id) ?? 0 }))}
    />
  )
}
