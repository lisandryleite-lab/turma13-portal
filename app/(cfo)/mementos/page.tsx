import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { MementosClient } from "./mementos-client"

export default async function MementosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [mementos, fcGroups, disciplinas] = await Promise.all([
    prisma.memento.findMany({
      select: { id: true, materia: true, modulo: true, titulo: true },
      orderBy: [{ materia: "asc" }, { modulo: "asc" }, { ordem: "asc" }],
    }),
    prisma.flashcard.groupBy({ by: ["materia"], _count: { materia: true } }),
    prisma.disciplina.findMany({ select: { sigla: true, nome: true }, orderBy: { sigla: "asc" } }),
  ])

  const nomeMap = new Map(disciplinas.map(d => [d.sigla, d.nome]))
  const flashMaterias = fcGroups
    .map(g => ({ sigla: g.materia, nome: nomeMap.get(g.materia) || g.materia, total: g._count.materia }))
    .sort((a, b) => a.sigla.localeCompare(b.sigla))

  return (
    <MementosClient
      mementos={mementos.map(m => ({ ...m, nome: nomeMap.get(m.materia) || m.materia }))}
      flashMaterias={flashMaterias}
      disciplinas={disciplinas}
      isAdmin={await adminAtivo(session.user.isAdmin)}
    />
  )
}
