import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RankingClient } from "./ranking-client"

export default async function RankingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [notas, historicoRows, turmaSize] = await Promise.all([
    prisma.notaCFO.findMany({
      where: { userId: session.user.id! },
      orderBy: [{ materia: "asc" }, { modulo: "asc" }],
    }),
    prisma.notaHistorica.findMany({ select: { valorFinal: true } }),
    prisma.user.count({ where: { turma: 3 } }),
  ])

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
    />
  )
}
