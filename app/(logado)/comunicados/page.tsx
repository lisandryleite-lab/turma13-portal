import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { semanaAtual } from "@/lib/utils"
import { ComunicadosClient } from "./comunicados-client"

export const dynamic = "force-dynamic"

export default async function ComunicadosPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin ?? false
  const userId = session?.user?.id ?? ""
  const SEMANA = semanaAtual()

  const [avisos, missoes, alunos] = await Promise.all([
    prisma.aviso.findMany({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] }),
    prisma.missao.findMany({
      orderBy: { semana: "desc" },
      include: {
        conclusoes: {
          include: { user: { select: { id: true, nomeGuerra: true, matricula: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { isAdmin: false, matricula: { gt: 0 } },
      select: { id: true, nomeGuerra: true, matricula: true },
      orderBy: { matricula: "asc" },
    }),
  ])

  return (
    <ComunicadosClient
      avisos={avisos}
      missoes={missoes}
      alunos={alunos}
      isAdmin={isAdmin}
      userId={userId}
      semanaAtual={SEMANA}
    />
  )
}
