import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AulasClient } from "./aulas-client"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AulasPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const userId = session?.user?.id

  const [disciplinas, minhasNotas] = await Promise.all([
    prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] }),
    userId
      ? prisma.nota.findMany({
          where: { userId },
          orderBy: { data: "desc" },
          select: { id: true, disciplina: true, avaliacao: true, nota: true, peso: true, ehAF: true, apto: true, data: true, observacao: true },
        })
      : [],
  ])

  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalMinistradas = disciplinas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const semana = semanaAtual()
  const hoje = Date.now()

  // Agrupa notas por sigla da disciplina e serializa datas
  const notasPorDisciplina: Record<string, { id: string; disciplina: string; avaliacao: string; nota: number; peso: number; ehAF: boolean; apto: boolean; data: string; observacao: string | null }[]> = {}
  for (const n of minhasNotas) {
    if (!notasPorDisciplina[n.disciplina]) notasPorDisciplina[n.disciplina] = []
    notasPorDisciplina[n.disciplina].push({ ...n, data: n.data.toISOString().slice(0, 10) })
  }

  return (
    <AulasClient
      disciplinas={disciplinas}
      isAdmin={isAdmin ?? false}
      semana={semana}
      totalCarga={totalCarga}
      totalMinistradas={totalMinistradas}
      hoje={hoje}
      notasPorDisciplina={notasPorDisciplina}
    />
  )
}
