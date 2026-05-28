import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminClient } from "./admin-client"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const semana = semanaAtual()

  const [alunos, disciplinas, qtsList, missoes, avisos, xerifes] = await Promise.all([
    prisma.user.findMany({
      orderBy: { matricula: "asc" },
      select: {
        id: true, matricula: true, nomeGuerra: true, nomeCompleto: true,
        email: true, isAdmin: true, aniversario: true, canga: true,
        grupoPlantao: true, grupoFaxina: true,
      },
    }),
    prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] }),
    prisma.qTS.findMany({ orderBy: { semana: "asc" }, select: { semana: true, dados: true, createdAt: true } }),
    prisma.missao.findMany({ orderBy: { semana: "desc" }, select: { id: true, semana: true, titulo: true, createdAt: true } }),
    prisma.aviso.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, titulo: true, fixado: true, createdAt: true } }),
    prisma.xerife.findMany({ orderBy: { dataInicio: "desc" }, take: 5,
      select: { id: true, nomeGuerra: true, matricula: true, dataInicio: true, dataFim: true, atual: true } }),
  ])

  // Stats
  const totalNotas = await prisma.nota.count()
  const totalMissoesConcluidas = await prisma.missaoConcluida.count()
  const alunosAtivos = alunos.filter(a => !a.isAdmin && a.matricula > 0).length

  return (
    <AdminClient
      semanaAtual={semana}
      alunos={alunos}
      disciplinas={disciplinas}
      qtsList={qtsList.map(q => ({ ...q, createdAt: q.createdAt.toISOString() }))}
      missoes={missoes.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      avisos={avisos.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      xerifes={xerifes.map(x => ({
        ...x,
        dataInicio: x.dataInicio.toISOString(),
        dataFim: x.dataFim ? x.dataFim.toISOString() : null,
      }))}
      stats={{ totalNotas, totalMissoesConcluidas, alunosAtivos }}
    />
  )
}
