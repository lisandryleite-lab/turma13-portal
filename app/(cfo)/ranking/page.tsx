import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { calcularMGCSimples, type Verificacao } from "@/lib/ranking"
import { RankingClient } from "./ranking-client"

export default async function RankingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const userId = session.user.id!

  const [minhasNotas, disciplinas, todasNotas, eu, turmaSize, opms, minhaPref, agregado] = await Promise.all([
    prisma.notaCFO.findMany({ where: { userId }, orderBy: [{ disciplina: "asc" }, { avaliacao: "asc" }] }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true, status: true }, orderBy: { sigla: "asc" } }),
    prisma.notaCFO.findMany({ include: { user: { select: { id: true, nfdc: true, turma: true } } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { nfdc: true } }),
    prisma.user.count({ where: { turma: 3 } }),
    prisma.oPM.findMany({ orderBy: { ordem: "asc" } }),
    prisma.preferenciaOPM.findUnique({ where: { userId } }),
    prisma.preferenciaOPM.findMany({ select: { opcao1Id: true, opcao2Id: true, opcao3Id: true } }),
  ])

  // MGC dos OUTROS alunos T3 que já lançaram notas (para posicionar o ranking)
  const porUser = new Map<string, { nfdc: number; vs: Verificacao[] }>()
  for (const n of todasNotas) {
    if (n.user.turma !== 3 || n.userId === userId) continue
    const e = porUser.get(n.userId) || { nfdc: n.user.nfdc, vs: [] }
    e.vs.push({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto })
    porUser.set(n.userId, e)
  }
  const mgcsOutros: number[] = []
  for (const [, e] of porUser) { const m = calcularMGCSimples(e.vs, e.nfdc); if (m != null) mgcsOutros.push(m) }

  // Contagem de preferências: 1ª opção e total (1ª + 2ª + 3ª)
  const contagem1 = new Map<string, number>()
  const contagemTotal = new Map<string, number>()
  for (const p of agregado) {
    contagem1.set(p.opcao1Id, (contagem1.get(p.opcao1Id) ?? 0) + 1)
    for (const id of [p.opcao1Id, p.opcao2Id, p.opcao3Id]) {
      if (id) contagemTotal.set(id, (contagemTotal.get(id) ?? 0) + 1)
    }
  }
  // Exclui OPMs especiais (ex.: "—" Não decidiu) dos rankings — não são posições
  const opmsReais = opms.filter(o => !o.especial)

  return (
    <RankingClient
      notasIniciais={minhasNotas.map(n => ({ id: n.id, disciplina: n.disciplina, avaliacao: n.avaliacao, valor: n.valor, ehAF: n.ehAF, apto: n.apto }))}
      nfdc={eu?.nfdc ?? 10}
      disciplinas={disciplinas}
      totalDisciplinas={disciplinas.length}
      turmaSize={turmaSize}
      mgcsOutros={mgcsOutros}
      nomeGuerra={session.user.nomeGuerra}
      opms={opms.map(o => ({ id: o.id, sigla: o.sigla, nome: o.nome, especial: o.especial }))}
      minhaPref={minhaPref ? { opcao1Id: minhaPref.opcao1Id, opcao2Id: minhaPref.opcao2Id, opcao3Id: minhaPref.opcao3Id } : null}
      agregado1={opmsReais.map(o => ({ sigla: o.sigla, nome: o.nome, especial: o.especial, count: contagem1.get(o.id) ?? 0 }))}
      agregadoTotal={opmsReais.map(o => ({ sigla: o.sigla, nome: o.nome, especial: o.especial, count: contagemTotal.get(o.id) ?? 0 }))}
    />
  )
}
