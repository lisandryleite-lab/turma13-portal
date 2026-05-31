import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { BottomNav } from "@/components/bottom-nav"
import { prisma } from "@/lib/prisma"

export default async function LogadoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  // Portal da Turma 13 (1º Pelotão) — restrito aos membros + admin.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { turma13: true },
  })
  if (!me?.turma13 && !session.user.isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div aria-hidden style={{ fontSize: 40 }}>🔒</div>
          <h1 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)", fontSize: "1.5rem", marginTop: 12 }}>
            Área restrita
          </h1>
          <p style={{ color: "var(--ink-60)", marginTop: 8 }}>
            O portal da <strong>Turma 13</strong> é exclusivo dos alunos do 1º Pelotão.
          </p>
          <Link href="/inicio" style={{ display: "inline-block", marginTop: 20, padding: "10px 18px", borderRadius: 8, background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600 }}>
            ← Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

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
