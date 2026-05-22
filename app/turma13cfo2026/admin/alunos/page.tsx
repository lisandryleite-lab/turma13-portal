import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminClient } from "./admin-client"

export const dynamic = "force-dynamic"

export default async function AdminAlunosPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/turma13cfo2026/ranking")

  const alunos = await prisma.user.findMany({
    orderBy: { matricula: "asc" },
    select: { id: true, matricula: true, nomeGuerra: true, nomeCompleto: true, email: true, isAdmin: true, aniversario: true, canga: true, grupoPlantao: true, grupoFaxina: true },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Gerenciar Alunos</h1>
      <AdminClient alunos={alunos} />
    </div>
  )
}
