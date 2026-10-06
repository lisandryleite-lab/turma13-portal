import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { semanaAtual } from "@/lib/utils"
import { ResumoHoje, carregarResumoHoje } from "@/components/resumo-hoje"
import { ContagemCFO } from "@/components/contagem-cfo"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

// Ícones (Lucide, inline — sem biblioteca)
const Ico = ({ children }: { children: React.ReactNode }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
)

type Tile = { href: string; label: string; nota: string; cor: "olive" | "gold"; icon: React.ReactNode }

const SECOES: Tile[] = [
  { href: "/qts", label: "QTS", nota: "Grade da semana", cor: "gold",
    icon: <Ico><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></Ico> },
  { href: "/aulas", label: "Aulas e faltas", nota: "Carga horária · 25%", cor: "olive",
    icon: <Ico><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></Ico> },
  { href: "/escalas", label: "Escalas", nota: "Plantão · Faxina · Serviço", cor: "gold",
    icon: <Ico><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /></Ico> },
  { href: "/xerifancia", label: "Xerifância", nota: "Xerife atual e histórico", cor: "olive",
    icon: <Ico><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Ico> },
  { href: "/tropa", label: "Controle de Tropa", nota: "Alunos por pelotão", cor: "gold",
    icon: <Ico><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Ico> },
]

const ATALHOS: Tile[] = [
  { href: "/mementos", label: "Mementos", nota: "Resumos por matéria", cor: "olive",
    icon: <Ico><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /></Ico> },
  { href: "/documentos", label: "Documentos", nota: "Modelos e links", cor: "gold",
    icon: <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></Ico> },
  { href: "/ranking", label: "Ranking", nota: "Notas e previsão", cor: "olive",
    icon: <Ico><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Ico> },
]

function TileCard({ t, tamanho = 72 }: { t: Tile; tamanho?: number }) {
  return (
    <Link href={t.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textDecoration: "none", padding: "6px 4px" }}>
      <span style={{
        width: tamanho, height: tamanho, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
        background: t.cor === "gold" ? "var(--gold)" : "var(--olive)", color: "var(--canvas)",
        border: "1px solid var(--gold)", boxShadow: "0 6px 18px rgba(43,42,39,0.12)",
      }}>
        {t.icon}
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", textAlign: "center", lineHeight: 1.25 }}>
        {t.label}
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--gold)", marginTop: 2 }}>{t.nota}</span>
      </span>
    </Link>
  )
}

const tituloSecao: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const matricula = session.user.matricula

  const semana = semanaAtual()

  // Tudo num Promise.all só — cada consulta fora daqui vira um roundtrip a mais.
  const [aluno, xerife, resumoHoje] = await Promise.all([
    prisma.user.findUnique({ where: { matricula }, select: { nomeGuerra: true } }),
    prisma.xerife.findFirst({ where: { atual: true } }),
    carregarResumoHoje(),
  ])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.8rem", color: "var(--olive)", margin: 0 }}>
          Olá, {aluno?.nomeGuerra}!
        </h1>
        <p style={{ color: "var(--ink-60)", fontSize: 13.5, margin: "4px 0 0" }}>Semana {semana}/52 · Mat. {matricula}</p>
      </div>

      {xerife && (
        <Link href="/xerifancia" style={{
          display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
          background: "rgba(181,147,63,0.12)", border: "1px solid rgba(181,147,63,0.35)",
          borderRadius: 12, padding: "9px 14px", marginBottom: 16, color: "var(--ink)",
        }}>
          <span aria-hidden>⭐</span>
          <span style={{ fontSize: 13.5 }}>Xerife atual: <strong>{xerife.nomeGuerra}</strong> <span style={{ color: "var(--gold)", fontSize: 12 }}>Mat. {xerife.matricula}</span></span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--olive)", fontWeight: 600 }}>histórico →</span>
        </Link>
      )}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: 32 }}>
        <ContagemCFO tema="olive" />
        <ResumoHoje matricula={matricula} dados={resumoHoje} />
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={tituloSecao}>Turma 13</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "24px 12px" }}>
          {SECOES.map(t => <TileCard key={t.href} t={t} />)}
        </div>
      </section>

      <section>
        <h2 style={tituloSecao}>Atalhos do portal</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "24px 12px" }}>
          {ATALHOS.map(t => <TileCard key={t.href} t={t} tamanho={60} />)}
        </div>
      </section>

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </div>
  )
}
