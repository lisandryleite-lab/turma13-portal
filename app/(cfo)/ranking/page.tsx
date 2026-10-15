import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples, type Verificacao } from "@/lib/ranking"
import { fasesDisciplinas } from "@/lib/disciplinas-fase"
import { RankingClient } from "./ranking-client"

export default async function RankingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const userId = session.user.id!

  const [minhasNotas, disciplinasBrutas, todasNotas, eu, turmaSize, qtss] = await Promise.all([
    prisma.notaCFO.findMany({ where: { userId }, orderBy: [{ disciplina: "asc" }, { avaliacao: "asc" }] }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true, status: true, cargaMinistrada: true, cargaTotal: true }, orderBy: { sigla: "asc" } }),
    // Filtra no SQL: antes puxava a tabela INTEIRA (todas as turmas, todos os
    // campos) e descartava em JS — atravessando a rede à toa a cada abertura.
    prisma.notaCFO.findMany({
      where: { user: { turma: 3 }, NOT: { userId } },
      select: {
        userId: true, disciplina: true, avaliacao: true,
        valor: true, ehAF: true, apto: true,
        user: { select: { nfdc: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { nfdc: true } }),
    prisma.user.count({ where: { turma: 3 } }),
    prisma.qTS.findMany({ select: { semana: true, dados: true } }),
  ])

  const fases = fasesDisciplinas(disciplinasBrutas, qtss)
  const disciplinas = disciplinasBrutas.map(d => ({ sigla: d.sigla, nome: d.nome, status: d.status, ...fases.get(d.sigla)! }))

  // MGC dos OUTROS alunos T3 que já lançaram notas (para posicionar o ranking)
  const porUser = new Map<string, { nfdc: number; vs: Verificacao[] }>()
  for (const n of todasNotas) {
    const e = porUser.get(n.userId) || { nfdc: n.user.nfdc, vs: [] }
    e.vs.push({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto })
    porUser.set(n.userId, e)
  }
  const mgcsOutros: number[] = []
  for (const [, e] of porUser) { const m = calcularMGCSimples(e.vs, e.nfdc); if (m != null) mgcsOutros.push(m) }

  return (
    <RankingClient
      notasIniciais={minhasNotas.map(n => ({ id: n.id, disciplina: n.disciplina, avaliacao: n.avaliacao, valor: n.valor, ehAF: n.ehAF, apto: n.apto }))}
      nfdc={eu?.nfdc ?? 10}
      disciplinas={disciplinas}
      totalDisciplinas={disciplinas.length}
      turmaSize={turmaSize}
      mgcsOutros={mgcsOutros}
      nomeGuerra={session.user.nomeGuerra}
    />
  )
}
