import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { grupoDaMatricula, mesVigente } from "@/lib/escalas-cia"
import { CalendarioClient } from "./calendario-client"

export const dynamic = "force-dynamic"

/** Data de hoje em ISO local (o toISOString() da Date é UTC e adianta o dia à noite). */
function hojeLocalIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function CalendarioPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const disciplinas = await prisma.disciplina.findMany({ select: { sigla: true, nome: true } })
  const nomeDisciplina = Object.fromEntries(disciplinas.map(d => [d.sigla, d.nome]))

  const hojeIso = hojeLocalIso()
  const matricula = session.user.matricula

  return (
    <CalendarioClient
      hojeIso={hojeIso}
      nomeDisciplina={nomeDisciplina}
      minhaMatricula={matricula}
      meuGrupo={grupoDaMatricula(matricula)}
      mes={mesVigente(hojeIso)}
    />
  )
}
