import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Nav } from "@/components/nav"
import { BottomNav } from "@/components/bottom-nav"
import { AreaRestrita } from "@/components/area-restrita"
import { podeVerTurma13 } from "@/lib/acesso"

export default async function LogadoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  // Portal da Turma 13 (1º Pelotão) — restrito aos membros + admin.
  if (!(await podeVerTurma13(session))) return <AreaRestrita />

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--creme)" }}>
      <Nav isAdmin={session.user.isAdmin} />
      <main className="main-logado" style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
