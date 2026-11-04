import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        matricula: { label: "Matrícula", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.matricula || !credentials?.password) return null
        const matricula = Number(credentials.matricula)
        if (isNaN(matricula)) return null

        const user = await prisma.user.findUnique({ where: { matricula } })
        if (!user) return null

        const ok = await bcrypt.compare(credentials.password as string, user.password)
        if (!ok) return null

        return {
          id: user.id,
          matricula: user.matricula,
          nomeGuerra: user.nomeGuerra,
          email: user.email,
          isAdmin: user.isAdmin,
          financeiroAdmin: user.financeiroAdmin,
          turma13: user.turma13,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.matricula = user.matricula
        token.nomeGuerra = user.nomeGuerra
        token.isAdmin = user.isAdmin
        token.financeiroAdmin = (user as { financeiroAdmin?: boolean }).financeiroAdmin ?? false
        token.turma13 = user.turma13 ?? false
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.matricula = token.matricula
      session.user.nomeGuerra = token.nomeGuerra
      session.user.isAdmin = token.isAdmin
      session.user.financeiroAdmin = (token as { financeiroAdmin?: boolean }).financeiroAdmin ?? false
      // undefined em sessões abertas antes deste campo existir — o layout da T13 consulta o banco
      session.user.turma13 = token.turma13
      return session
    },
  },
  events: {
    // Registra cada login para contagem de acessos ao site (visível no painel admin).
    async signIn({ user }) {
      const u = user as { id?: string; matricula?: number; nomeGuerra?: string }
      if (!u?.id || u.matricula == null) return
      try {
        await prisma.logAcesso.create({
          data: {
            userId: u.id,
            matricula: u.matricula,
            nomeGuerra: u.nomeGuerra ?? "",
            area: "login",
            acao: "entrou no sistema",
          },
        })
      } catch {
        // o log nunca deve quebrar o login
      }
    },
  },
})
