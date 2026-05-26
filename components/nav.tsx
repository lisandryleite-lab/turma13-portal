"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

// ── SVG wrapper ───────────────────────────────────────────────────────────────
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

// ── Ícones inline (Lucide paths — sem biblioteca) ─────────────────────────────
const HomeIco   = () => <Svg><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-7h6v7"/></Svg>
const TrophyIco = () => <Svg><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></Svg>
const GridIco   = () => <Svg><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Svg>
const BookIco   = () => <Svg><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Svg>
const TargetIco = () => <Svg><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Svg>
const EscalaIco = () => <Svg><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Svg>
const StarIco   = () => <Svg><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>
const UsersIco  = () => <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>
const CakeIco   = () => <Svg><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></Svg>
const BellIco   = () => <Svg><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Svg>
const LinkIco   = () => <Svg><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></Svg>
const GearIco   = () => <Svg><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></Svg>
const OutIco    = () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></Svg>

// ── Rotas ──────────────────────────────────────────────────────────────────────
type LinkDef = { href: string; label: string; Icon: React.FC }

const LINKS: LinkDef[] = [
  { href: "/dashboard",    label: "Início",       Icon: HomeIco   },
  { href: "/ranking",      label: "Ranking",      Icon: TrophyIco },
  { href: "/qts",          label: "QTS",          Icon: GridIco   },
  { href: "/aulas",        label: "Aulas",        Icon: BookIco   },
  { href: "/missao",       label: "Missão",       Icon: TargetIco },
  { href: "/escalas",      label: "Escalas",      Icon: EscalaIco },
  { href: "/xerifancia",   label: "Xerifância",   Icon: StarIco   },
  { href: "/turma",        label: "Turma",        Icon: UsersIco  },
  { href: "/aniversarios", label: "Aniversários", Icon: CakeIco   },
  { href: "/avisos",       label: "Avisos",       Icon: BellIco   },
  { href: "/links",        label: "Links Úteis",  Icon: LinkIco   },
]

export function Nav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      className="sidebar"
      style={{
        background: "linear-gradient(180deg, var(--azul-profundo) 0%, #0a2550 100%)",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        boxShadow: "2px 0 16px rgba(11,45,94,0.18)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo" style={{
        padding: "18px 0 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 6,
        overflow: "hidden",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--dourado-claro)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        <span className="nav-label" style={{
          fontFamily: "var(--serif)",
          fontSize: 11,
          color: "var(--dourado-claro)",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textAlign: "center",
          lineHeight: 1.3,
        }}>
          CFO 2026<br />Turma 13
        </span>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "4px 0" }}>
        {LINKS.map((l) => {
          const ativo = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                textDecoration: "none",
                background: ativo ? "rgba(184,146,74,0.18)" : "transparent",
                borderLeft: ativo ? "3px solid var(--dourado)" : "3px solid transparent",
                color: ativo ? "#fff" : "rgba(255,255,255,0.72)",
                transition: "background 0.15s, color 0.15s",
                minWidth: 0,
              }}
              onMouseEnter={e => {
                if (!ativo) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
              }}
              onMouseLeave={e => {
                if (!ativo) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <span style={{ flexShrink: 0, width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <l.Icon />
              </span>
              <span className="nav-label" style={{ fontSize: 13, fontWeight: ativo ? 600 : 400 }}>
                {l.label}
              </span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            title="Admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              textDecoration: "none",
              background: pathname.startsWith("/admin") ? "rgba(184,146,74,0.18)" : "transparent",
              borderLeft: pathname.startsWith("/admin") ? "3px solid var(--dourado)" : "3px solid transparent",
              color: pathname.startsWith("/admin") ? "#fff" : "var(--dourado-claro)",
              marginTop: 4,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => {
              if (!pathname.startsWith("/admin")) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
            }}
            onMouseLeave={e => {
              if (!pathname.startsWith("/admin")) (e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <span style={{ flexShrink: 0, width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GearIco />
            </span>
            <span className="nav-label" style={{ fontSize: 13, fontWeight: pathname.startsWith("/admin") ? 600 : 400 }}>
              Admin
            </span>
          </Link>
        )}
      </nav>

      {/* Sair */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Sair"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: "transparent",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          width: "100%",
          color: "rgba(255,255,255,0.4)",
          overflow: "hidden",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ flexShrink: 0, width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <OutIco />
        </span>
        <span className="nav-label" style={{ fontSize: 13 }}>Sair</span>
      </button>
    </aside>
  )
}
