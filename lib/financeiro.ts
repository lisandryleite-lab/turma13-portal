import type { Session } from "next-auth"

// Quem pode gerir o módulo Financeiro (editar/excluir cotas, confirmar
// pagamentos, lanches): admin geral OU adm específico do financeiro.
export function ehGestorFinanceiro(session: Session | null): boolean {
  return !!session?.user && (session.user.isAdmin || session.user.financeiroAdmin)
}

// Quem pode CRIAR cotas: gestor financeiro OU qualquer membro da Turma 13.
// (edição/exclusão/confirmação de pagamento continuam só com o gestor.)
export function podeCriarCota(session: Session | null, ehTurma13: boolean): boolean {
  return ehGestorFinanceiro(session) || (!!session?.user && ehTurma13)
}
