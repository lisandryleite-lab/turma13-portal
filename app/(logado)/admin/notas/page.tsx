import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotasAdminClient } from "./notas-client"

export const dynamic = "force-dynamic"

export default async function NotasAdminPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/dashboard")

  const [alunos, disciplinas] = await Promise.all([
    prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { matricula: "asc" },
      select: { id: true, matricula: true, nomeGuerra: true },
    }),
    prisma.disciplina.findMany({
      orderBy: [{ modulo: "asc" }, { sigla: "asc" }],
      select: { sigla: true, nome: true },
    }),
  ])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 24, color: "var(--azul-profundo)", marginBottom: 4 }}>
        Gerenciar Notas
      </h1>
      <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 28 }}>
        Selecione um aluno para ver e lançar notas. Toda alteração é registrada no histórico de auditoria.
      </p>
      <NotasAdminClient alunos={alunos} disciplinas={disciplinas} />
    </div>
  )
}
