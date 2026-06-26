import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FinanceiroClient } from "./financeiro-client"

export const dynamic = "force-dynamic"

export default async function FinanceiroPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const isAdmin = session.user.isAdmin ?? false

  const cotas = await prisma.cotaFinanceira.findMany({
    orderBy: [{ ativa: "desc" }, { createdAt: "desc" }],
    include: {
      pagamentos: {
        include: { user: { select: { matricula: true, nomeGuerra: true } } },
        orderBy: { user: { matricula: "asc" } },
      },
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
      </div>
      <FinanceiroClient cotas={cotas} isAdmin={isAdmin} minhaMatricula={session.user.matricula} />
    </div>
  )
}
