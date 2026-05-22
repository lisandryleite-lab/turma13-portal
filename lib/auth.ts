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
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.matricula = token.matricula
      session.user.nomeGuerra = token.nomeGuerra
      session.user.isAdmin = token.isAdmin
      return session
    },
  },
})
