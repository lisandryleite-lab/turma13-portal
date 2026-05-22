import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AulasClient } from "./aulas-client"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AulasPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const disciplinas = await prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] })

  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalMinistradas = disciplinas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const semana = semanaAtual()

  return (
    <AulasClient
      disciplinas={disciplinas}
      isAdmin={isAdmin}
      semana={semana}
      totalCarga={totalCarga}
      totalMinistradas={totalMinistradas}
    />
  )
}
