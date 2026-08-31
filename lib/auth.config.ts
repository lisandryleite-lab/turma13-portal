import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

// "/camisa": mockups da camisa do pelotão — precisam abrir sem login, senão o
// formulário público de /pedido mostra imagem quebrada (o middleware redirecionava
// os JPGs pra /login e o otimizador do Next devolvia 400).
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/pagar", "/api/pagar", "/pedido", "/api/pedido", "/camisa"]

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isApi = pathname.startsWith("/api/auth")
      const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
      const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico"

      if (isStatic || isApi || isPublic) return true

      if (!auth) {
        // Numa rota de API, redirecionar para /login devolve 307 + HTML. O
        // cliente então faz `res.json()` em cima de uma página e quebra com um
        // erro de parse, escondendo a causa real (sessão expirada). Aqui vai
        // 401 em JSON, no mesmo formato das outras respostas de erro.
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Sessão expirada. Entre de novo." }, { status: 401 })
        }
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return true
    },
  },
}
