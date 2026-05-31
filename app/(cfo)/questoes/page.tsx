import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { QuestoesClient } from "./questoes-client"

export default async function QuestoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const userId = session.user.id!

  const [porMateria, disciplinas, respostas] = await Promise.all([
    prisma.questao.groupBy({ by: ["materia"], _count: { materia: true } }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true }, orderBy: { sigla: "asc" } }),
    prisma.resposta.findMany({
      where: { userId },
      select: { acertou: true, questao: { select: { materia: true } } },
    }),
  ])

  const nomeMap = new Map(disciplinas.map(d => [d.sigla, d.nome]))
  const materias = porMateria
    .map(m => ({ sigla: m.materia, nome: nomeMap.get(m.materia) || m.materia, total: m._count.materia }))
    .sort((a, b) => a.sigla.localeCompare(b.sigla))

  const statMap = new Map<string, { acertos: number; total: number }>()
  for (const r of respostas) {
    const mt = r.questao.materia
    const s = statMap.get(mt) || { acertos: 0, total: 0 }
    s.total++
    if (r.acertou) s.acertos++
    statMap.set(mt, s)
  }
  const stats = [...statMap.entries()]
    .map(([sigla, s]) => ({ sigla, nome: nomeMap.get(sigla) || sigla, ...s }))
    .sort((a, b) => b.total - a.total)

  return (
    <QuestoesClient
      materias={materias}
      disciplinas={disciplinas}
      isAdmin={session.user.isAdmin}
      stats={stats}
      totalResp={respostas.length}
      totalAcertos={respostas.filter(r => r.acertou).length}
    />
  )
}
