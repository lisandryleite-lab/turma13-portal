import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { QuestoesClient } from "./questoes-client"

export default async function QuestoesPage({ searchParams }: { searchParams: Promise<{ materia?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const userId = session.user.id!
  const initialMateria = ((await searchParams).materia || "").toUpperCase()

  const [combos, disciplinas, respostas] = await Promise.all([
    prisma.questao.groupBy({ by: ["materia", "modulo"], _count: { _all: true } }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true }, orderBy: { sigla: "asc" } }),
    prisma.resposta.findMany({
      where: { userId },
      select: { acertou: true, questao: { select: { materia: true } } },
    }),
  ])

  const nomeMap = new Map(disciplinas.map(d => [d.sigla, d.nome]))
  // agrega total + módulos por matéria
  const matMap = new Map<string, { total: number; modulos: Set<string> }>()
  for (const c of combos) {
    const e = matMap.get(c.materia) || { total: 0, modulos: new Set<string>() }
    e.total += c._count._all
    e.modulos.add(c.modulo)
    matMap.set(c.materia, e)
  }
  const materias = [...matMap.entries()]
    .map(([sigla, e]) => ({ sigla, nome: nomeMap.get(sigla) || sigla, total: e.total, modulos: [...e.modulos].sort() }))
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
      isAdmin={await adminAtivo(session.user.isAdmin)}
      stats={stats}
      totalResp={respostas.length}
      totalAcertos={respostas.filter(r => r.acertou).length}
      initialMateria={initialMateria}
    />
  )
}
