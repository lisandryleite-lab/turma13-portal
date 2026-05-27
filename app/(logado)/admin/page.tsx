import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminClient } from "./admin-client"
import Link from "next/link"

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Administração</h1>
        <Link href="/admin/notas" style={{ background: "var(--azul-profundo)", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          📝 Gerenciar Notas
        </Link>
      </div>
      <AdminClient alunos={alunos} />
    </div>
  )
}
