import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AvisosClient } from "./avisos-client"

export const dynamic = "force-dynamic"

export default async function AvisosPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin as boolean
  const avisos = await prisma.aviso.findMany({ orderBy: [{ destaque: "desc" }, { fixado: "desc" }, { createdAt: "desc" }] })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Avisos</h1>
      <AvisosClient avisos={avisos} isAdmin={isAdmin} />
    </div>
  )
}
