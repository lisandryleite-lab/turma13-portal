import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"
import { TREINO_ARMAMENTO_HREF, treinoArmamentoDisponivel } from "@/lib/treino-armamento"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/pagar", "/api/pagar"]
const TREINO_ARMAMENTO_BASE = TREINO_ARMAMENTO_HREF.replace(/\/index\.html$/, "") // "/treino-armamento"

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

      // Treino de Armamento é temporário: após 17/07 a URL direta some (mesmo logado).
      if (pathname.startsWith(TREINO_ARMAMENTO_BASE) && !treinoArmamentoDisponivel()) {
        return NextResponse.redirect(new URL("/inicio", request.url))
      }

      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return true
    },
  },
}
