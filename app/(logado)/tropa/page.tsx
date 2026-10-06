import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { grupoDaMatricula, mesVigente, ROTULO_GRUPO } from "@/lib/escalas-cia"
import { hojeRecifeISO } from "@/lib/calendario-provas"
import { TropaClient } from "./tropa-client"

export const dynamic = "force-dynamic"

// Controle de Tropa — efetivo da 1ª CIA por pelotão. Todos os alunos da
// Turma 13 consultam; só o admin edita (e só ele vê o e-mail).
export default async function TropaPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const isAdmin = !!session.user.isAdmin

  const alunos = await prisma.user.findMany({
    where: { matricula: { gt: 0 }, isAdmin: false },
    select: { matricula: true, nomeGuerra: true, nomeCompleto: true, pelotao: true, ativo: true, turma13: true, aniversario: true, email: true },
    orderBy: { matricula: "asc" },
  })
  const mes = mesVigente(hojeRecifeISO())

  return (
    <TropaClient
      isAdmin={isAdmin}
      minhaMatricula={session.user.matricula}
      alunos={alunos.map(a => {
        const g = grupoDaMatricula(a.matricula, mes)
        return {
          matricula: a.matricula, nomeGuerra: a.nomeGuerra, nomeCompleto: a.nomeCompleto,
          pelotao: a.pelotao ?? (a.turma13 ? 1 : null), ativo: a.ativo, turma13: a.turma13,
          aniversario: a.aniversario, equipe: g ? ROTULO_GRUPO[g] : null,
          ...(isAdmin ? { email: a.email } : {}),
        }
      })}
    />
  )
}
