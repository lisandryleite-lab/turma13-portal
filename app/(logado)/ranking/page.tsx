import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples } from "@/lib/ranking"
import { RankingClient } from "./ranking-client"

export const dynamic = "force-dynamic"

export default async function RankingPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin ?? false
  const userId = session!.user.id
  const minhaMatricula = session!.user.matricula

  const [alunos, todasNotas, minhasNotas, disciplinas] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false, matricula: { gt: 0 } },
      orderBy: { matricula: "asc" },
      select: { id: true, matricula: true, nomeGuerra: true, canga: true },
    }),
    // admin vê tudo; aluno só vê as próprias
    isAdmin
      ? prisma.nota.findMany({ select: { userId: true, disciplina: true, avaliacao: true, nota: true, peso: true, ehAF: true, apto: true } })
      : prisma.nota.findMany({ where: { userId }, select: { userId: true, disciplina: true, avaliacao: true, nota: true, peso: true, ehAF: true, apto: true } }),
    prisma.nota.findMany({
      where: { userId },
      orderBy: { data: "desc" },
      select: { id: true, disciplina: true, avaliacao: true, nota: true, peso: true, ehAF: true, apto: true, data: true, observacao: true },
    }),
    prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] }),
  ])

  // Monta ranking
  const notasPorUser: Record<string, typeof todasNotas> = {}
  for (const n of todasNotas) {
    if (!notasPorUser[n.userId]) notasPorUser[n.userId] = []
    notasPorUser[n.userId].push(n)
  }

  const ranking = alunos
    .map(a => ({ ...a, mgc: calcularMGCSimples(notasPorUser[a.id] || []) }))
    .sort((a, b) => {
      if (a.mgc === null && b.mgc === null) return a.matricula - b.matricula
      if (a.mgc === null) return 1
      if (b.mgc === null) return -1
      return b.mgc - a.mgc
    })

  const minhaPos = ranking.findIndex(a => a.matricula === minhaMatricula)
  const minhaEntrada = ranking[minhaPos] ?? null

  // Serializa notas (datas -> string)
  const minhasNotasSer = minhasNotas.map(n => ({
    ...n,
    data: (n.data as Date).toISOString().slice(0, 10),
  }))

  return (
    <RankingClient
      ranking={ranking}
      minhaEntrada={minhaEntrada ? { ...minhaEntrada, posicao: minhaPos + 1 } : null}
      isAdmin={isAdmin}
      userId={userId}
      disciplinas={disciplinas}
      minhasNotas={minhasNotasSer}
      totalAlunos={alunos.length}
    />
  )
}
