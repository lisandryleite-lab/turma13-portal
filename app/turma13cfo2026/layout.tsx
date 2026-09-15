import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppNav } from "@/components/app-nav"
import { AreaRestrita } from "@/components/area-restrita"
import { podeVerTurma13 } from "@/lib/acesso"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  // Mesma regra de app/(logado): estas telas são conteúdo do 1º Pelotão.
  // Sem isto, qualquer aluno do CFO chegava aqui digitando o endereço.
  if (!(await podeVerTurma13(session))) return <AreaRestrita />

  const isAdmin = session.user.isAdmin
  const nomeGuerra = session.user.nomeGuerra

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppNav isAdmin={isAdmin} nomeGuerra={nomeGuerra} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
