import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AvisosClient } from "./avisos-client"

export const dynamic = "force-dynamic"

export default async function AvisosPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const avisos = await prisma.aviso.findMany({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] })
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mural de Avisos</h1>
      </div>
      <AvisosClient avisos={avisos} isAdmin={isAdmin} />
    </div>
  )
}
