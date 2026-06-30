import type { Session } from "next-auth"

// Quem pode gerir o módulo Financeiro: admin geral OU adm específico do financeiro.
export function ehGestorFinanceiro(session: Session | null): boolean {
  return !!session?.user && (session.user.isAdmin || session.user.financeiroAdmin)
}
