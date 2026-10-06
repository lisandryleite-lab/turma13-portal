import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { T13Header } from "@/components/t13-header"
import { prisma } from "@/lib/prisma"

// A área Turma 13 usa a mesma paleta do Portal CFO. As telas antigas foram
// escritas com as variáveis azuis (--azul-profundo, --creme…); em vez de
// reescrever cada uma, as variáveis são redefinidas aqui para os tons do
// portal (verde-oliva, dourado e creme).
const PALETA_T13 = {
  "--azul-profundo": "#3a4a3a",
  "--azul-medio": "#4f6347",
  "--azul-suave": "#6b7f5e",
  "--azul-claro": "#eef1e8",
  "--creme": "#faf9f5",
  "--dourado": "#b5933f",
  "--dourado-claro": "#e0c979",
  "--grafite": "#2b2a27",
  "--cinza-texto": "rgba(43, 42, 39, 0.62)",
  "--cinza-borda": "rgba(58, 74, 58, 0.12)",
  "--serif": "Georgia, Cambria, \"Times New Roman\", serif",
  "--shadow-sm": "0 1px 3px rgba(43, 42, 39, 0.06)",
  "--shadow-md": "0 4px 16px rgba(43, 42, 39, 0.10)",
  "--shadow-lg": "0 12px 40px rgba(43, 42, 39, 0.14)",
} as React.CSSProperties

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
    <div style={{ ...PALETA_T13, minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)" }}>
      <T13Header isAdmin={!!session.user.isAdmin} />
      <main style={{ minWidth: 0 }}>{children}</main>
    </div>
  )
}
