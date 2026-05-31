import Link from "next/link"

type Tile = "olive" | "gold"

const cards: {
  label: string
  href: string
  bg: Tile
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
    label: "Psicologia",
    href: "/psicologia",
    bg: "olive",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    ),
  },
  {
    label: "Turma 13",
    href: "/turma",
    bg: "gold",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      </svg>
    ),
  },
]

function CardTile({ card }: { card: (typeof cards)[number] }) {
  const isGold = card.bg === "gold"
  return (
    <Link
      href={card.href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
      }}
    >
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
    </Link>
  )
}

export default function PortalCfoHome() {
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
          CFO 2026
        </h1>
        <p
          style={{
            fontStyle: "italic",
            fontSize: "1rem",
            color: "var(--ink-60)",
            marginTop: 8,
          }}
        >
          isso é coisa nossa
        </p>
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
        <CardTile card={cards[0]} />
        <CardTile card={cards[1]} />
        <CardTile card={cards[2]} />
        <CardTile card={cards[3]} />
        {/* 6º espaço — placeholder pontilhado (reservado) */}
        <div
          aria-hidden
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            border: "2px dashed rgba(43, 42, 39, 0.20)",
          }}
        />
        <CardTile card={cards[4]} />
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
