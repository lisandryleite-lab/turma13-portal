import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NotasClient } from "./notas-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function NotasPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const userId = session.user.id

  const [notas, disciplinas] = await Promise.all([
    prisma.nota.findMany({ where: { userId }, orderBy: { data: "desc" } }),
    prisma.disciplina.findMany({ orderBy: { sigla: "asc" }, select: { sigla: true, nome: true } }),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Minhas Notas</h1>
      <NotasClient notas={notas} disciplinas={disciplinas} />
    </div>
  )
}
