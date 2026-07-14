import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { ViewToggle } from "../view-toggle"

type Tile = "olive" | "gold"

const cards: {
  label: string
  href: string
  bg: Tile
  externo?: boolean
  icon: React.ReactNode
}[] = [
  {
    label: "Ranking",
    href: "/ranking",
    bg: "gold",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    label: "Questões",
    href: "/questoes",
    bg: "olive",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Mementos",
    href: "/mementos",
    bg: "olive",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
      </svg>
    ),
  },
  {
    label: "Armamento",
    href: "/treino-armamento/index.html",
    bg: "gold",
    externo: true,
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="22" x2="18" y1="12" y2="12" />
        <line x1="6" x2="2" y1="12" y2="12" />
        <line x1="12" x2="12" y1="6" y2="2" />
        <line x1="12" x2="12" y1="22" y2="18" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: "Permutas",
    href: "/permutas",
    bg: "olive",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 6h18" />
        <path d="m7 22-4-4 4-4" />
        <path d="M21 18H3" />
      </svg>
    ),
  },
  {
    label: "Documentos",
    href: "/documentos",
    bg: "gold",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
  },
  {
    label: "Psicologia",
    href: "https://agendamento-apmp.vercel.app/",
    bg: "olive",
    externo: true,
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M12 6v12" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      </svg>
    ),
  },
  {
    label: "Turma 13",
    href: "/dashboard",
    bg: "gold",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      </svg>
    ),
  },
]

// Card extra "Modificar senha" — só para alunos que NÃO são da Turma 13
// (eles não entram no portal T13, onde fica a troca de senha).
const cardSenha: (typeof cards)[number] = {
  label: "Modificar senha",
  href: "/trocar-senha",
  bg: "olive",
  icon: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  ),
}

function CardTile({ card }: { card: (typeof cards)[number] }) {
  const isGold = card.bg === "gold"
  const wrapStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  }
  const inner = (
    <>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isGold ? "var(--gold)" : "var(--olive)",
          color: "var(--canvas)",
          border: "1px solid var(--gold)",
          boxShadow: "0 6px 18px rgba(43, 42, 39, 0.12)",
        }}
      >
        {card.icon}
      </div>
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ink)",
        }}
      >
        {card.label}
      </span>
    </>
  )

  if (card.externo) {
    return (
      <a href={card.href} target="_blank" rel="noopener noreferrer" style={wrapStyle}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={card.href} style={wrapStyle}>
      {inner}
    </Link>
  )
}

export default async function PortalCfoHome() {
  const session = await auth()
  const isAdmin = !!session?.user?.isAdmin
  const admView = await adminAtivo(isAdmin)

  // Alunos fora da Turma 13 ganham um 6º card "Modificar senha"
  const eu = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { turma13: true } })
    : null
  const cardsToShow = eu?.turma13 ? cards : [...cards, cardSenha]

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 24px",
      }}
    >
      {isAdmin && (
        <div style={{ alignSelf: "flex-end", marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
          {admView && (
            <Link href="/painel" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--olive)", textDecoration: "none" }}>
              Painel admin
            </Link>
          )}
          <ViewToggle adminAtivo={admView} />
        </div>
      )}
      <header style={{ textAlign: "center", marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: "var(--serif-cfo)",
            fontWeight: 600,
            fontSize: "2rem",
            color: "var(--olive)",
            margin: 0,
          }}
        >
          Portal CFO 2026
        </h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "32px 40px",
          width: "100%",
          maxWidth: 460,
          flex: 1,
          justifyItems: "center",
          alignContent: "start",
        }}
      >
        {cardsToShow.map(card => (
          <CardTile key={card.href} card={card} />
        ))}
      </div>

      <footer
        style={{
          marginTop: 40,
          fontSize: 13,
          color: "var(--ink-60)",
          textAlign: "center",
        }}
      >
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}
