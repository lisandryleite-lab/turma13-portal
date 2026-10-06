import { prisma } from "@/lib/prisma"
import { FaltasClient } from "./faltas-client"
import { AcompanhamentoTabs } from "@/components/acompanhamento-tabs"

export const dynamic = "force-dynamic"

export default async function FaltasPage() {
  const disciplinas = await prisma.disciplina.findMany({
    orderBy: [{ modulo: "asc" }, { sigla: "asc" }],
    select: { sigla: true, nome: true, modulo: true, cargaTotal: true, cargaMinistrada: true },
  })

  return (
    <>
      <AcompanhamentoTabs ativo="faltas" />
      <FaltasClient disciplinas={disciplinas} />
    </>
  )
}
