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
