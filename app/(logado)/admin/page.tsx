import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminClient } from "./admin-client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const alunos = await prisma.user.findMany({
    orderBy: { matricula: "asc" },
    select: {
      id: true, matricula: true, nomeGuerra: true, nomeCompleto: true,
      email: true, isAdmin: true, aniversario: true, canga: true,
      grupoPlantao: true, grupoFaxina: true,
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Administração</h1>
      <AdminClient alunos={alunos} />
    </div>
  )
}
