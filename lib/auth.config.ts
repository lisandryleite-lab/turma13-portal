import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

// "/camisa": mockups da camisa do pelotão — precisam abrir sem login, senão o
// formulário público de /pedido mostra imagem quebrada (o middleware redirecionava
// os JPGs pra /login e o otimizador do Next devolvia 400).
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/pagar", "/api/pagar", "/pedido", "/api/pedido", "/camisa"]

// Únicos destinos de quem ainda está com a senha inicial: a própria troca e a
// tela que explica como fazer. Sem isso o redirecionamento viraria um laço.
const SENHA_PATHS = ["/trocar-senha", "/alterar-senha", "/ajuda-senha"]

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // O middleware roda no Edge e não carrega os callbacks de lib/auth.ts, então
    // os campos que ele precisa ler do token são copiados aqui.
    session({ session, token }) {
      const t = token as { turma13?: boolean; senhaTrocada?: boolean }
      if (session.user) {
        session.user.turma13 = t.turma13
        session.user.senhaTrocada = t.senhaTrocada
      }
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isApi = pathname.startsWith("/api/auth")
      const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
      const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico"

      if (isStatic || isApi || isPublic) return true

      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Senha inicial (= matrícula) ainda não trocada: o aluno não circula pelo
      // portal antes de trocar. `undefined` é token emitido antes deste campo
      // existir — nesse caso deixa passar, senão a mudança expulsaria todo mundo
      // que já está logado; a exigência passa a valer no próximo login.
      if (auth.user?.senhaTrocada === false && !SENHA_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.redirect(new URL("/trocar-senha", request.url))
      }

      return true
    },
  },
}
