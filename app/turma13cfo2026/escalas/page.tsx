import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EscalasClient } from "./escalas-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EscalasPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const isAdmin = session.user.isAdmin
  const userId = session.user.id

  const [faxinas, servicos, minhasEscalas, alunos] = await Promise.all([
    prisma.escalaTurmaFaxina.findMany({ orderBy: { data: "asc" } }),
    prisma.escalaTurmaServico.findMany({ orderBy: { data: "asc" } }),
    prisma.escalaAluno.findMany({ where: { userId }, orderBy: { data: "asc" } }),
    isAdmin ? prisma.user.findMany({ where: { isAdmin: false }, orderBy: { matricula: "asc" }, select: { id: true, matricula: true, nomeGuerra: true, canga: true } }) : [],
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <EscalasClient
        faxinas={faxinas}
        servicos={servicos}
        minhasEscalas={minhasEscalas}
        isAdmin={isAdmin}
        alunos={alunos}
      />
    </div>
  )
}
