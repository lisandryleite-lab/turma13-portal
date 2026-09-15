import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      matricula: number
      nomeGuerra: string
      isAdmin: boolean
      financeiroAdmin: boolean
      // opcional: sessões emitidas antes deste campo existir não o trazem —
      // ver lib/acesso.ts, que consulta o banco nesse caso
      turma13?: boolean
    }
  }

  interface User {
    id: string
    email: string
    matricula: number
    nomeGuerra: string
    isAdmin: boolean
    financeiroAdmin?: boolean
    turma13?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    matricula: number
    nomeGuerra: string
    isAdmin: boolean
    financeiroAdmin: boolean
    turma13?: boolean
  }
}
