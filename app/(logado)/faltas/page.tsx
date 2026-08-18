import { prisma } from "@/lib/prisma"
import { FaltasClient } from "./faltas-client"

export const dynamic = "force-dynamic"

export default async function FaltasPage() {
  const disciplinas = await prisma.disciplina.findMany({
    orderBy: [{ modulo: "asc" }, { sigla: "asc" }],
    select: { sigla: true, nome: true, modulo: true, cargaTotal: true, cargaMinistrada: true },
  })

  return <FaltasClient disciplinas={disciplinas} />
}
