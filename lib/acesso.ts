import type { Session } from "next-auth"
import { prisma } from "@/lib/prisma"

/**
 * Quem pode entrar no portal da Turma 13 (1º Pelotão): os membros e o admin.
 *
 * O `turma13` viaja no JWT desde que a sessão foi criada, então o caso normal
 * não toca o banco. Sessões emitidas ANTES desse campo existir não têm o valor
 * no token — para essas, e só para essas, consultamos o banco, senão o aluno
 * seria expulso da própria área até o token expirar (30 dias).
 * Esse fallback pode sair quando não houver mais tokens antigos em circulação.
 */
export async function podeVerTurma13(session: Session): Promise<boolean> {
  if (session.user.isAdmin) return true
  if (typeof session.user.turma13 === "boolean") return session.user.turma13

  if (!session.user.id) return false
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { turma13: true },
  })
  return !!me?.turma13
}
