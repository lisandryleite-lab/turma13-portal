import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HistoricoClient } from "./historico-client"

export const dynamic = "force-dynamic"

export default async function HistoricoPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/turma13cfo2026/ranking")

  const [historico, alunos, disciplinas] = await Promise.all([
    prisma.historicoNota.findMany({
      include: {
        nota: { include: { user: { select: { nomeGuerra: true, matricula: true } } } },
        alteradoPor: { select: { nomeGuerra: true, matricula: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({ where: { isAdmin: false }, orderBy: { matricula: "asc" }, select: { matricula: true, nomeGuerra: true } }),
    prisma.disciplina.findMany({ orderBy: { sigla: "asc" }, select: { sigla: true } }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Histórico de Alterações de Notas</h1>
      <HistoricoClient historico={historico} alunos={alunos} disciplinas={disciplinas} />
    </div>
  )
}
