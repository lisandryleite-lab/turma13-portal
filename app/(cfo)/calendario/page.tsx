import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
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

  const matricula = session.user.matricula
  const [disciplinas, usuario, doBanco] = await Promise.all([
    prisma.disciplina.findMany({ select: { sigla: true, nome: true } }),
    prisma.user.findUnique({ where: { matricula }, select: { turma: true, turma13: true } }),
    // eventos cadastrados pelo admin (tolerante: sem a tabela, segue vazio)
    prisma.eventoCalendario.findMany({
      select: {
        id: true, inicio: true, fim: true, titulo: true, tipo: true,
        unidade: true, segmento: true, turma: true, turno: true, obs: true,
      },
      orderBy: [{ inicio: "asc" }, { titulo: "asc" }],
    }).catch(() => []),
  ])
  const nomeDisciplina = Object.fromEntries(disciplinas.map(d => [d.sigla, d.nome]))

  // O portal é do 1º Pelotão (Turma 13); as demais turmas do CFO existem no
  // escopo mas ainda não têm eventos próprios cadastrados.
  const minhaTurma = usuario?.turma13 ? "T13" : usuario?.turma ? `T${usuario.turma}` : null

  return (
    <Suspense fallback={null}>
      <CalendarioClient
        hojeIso={hojeLocalIso()}
        nomeDisciplina={nomeDisciplina}
        minhaMatricula={matricula}
        meuGrupo={grupoDaMatricula(matricula)}
        mes={mesVigente(hojeLocalIso())}
        minhaTurma={minhaTurma}
        isAdmin={await adminAtivo(session.user.isAdmin)}
        eventosDoBanco={doBanco}
      />
    </Suspense>
  )
}
