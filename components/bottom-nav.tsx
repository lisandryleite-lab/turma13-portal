"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const HomeIco   = () => <Svg><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-7h6v7"/></Svg>
const EscalaIco = () => <Svg><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Svg>
const GridIco   = () => <Svg><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Svg>
const BellIco   = () => <Svg><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Svg>
const UsersIco  = () => <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>

type LinkDef = { href: string; label: string; Icon: React.FC }

const LINKS: LinkDef[] = [
  { href: "/dashboard",   label: "Início",  Icon: HomeIco   },
  { href: "/escalas",     label: "Escalas", Icon: EscalaIco },
  { href: "/qts",         label: "QTS",     Icon: GridIco   },
  { href: "/comunicados", label: "Avisos",  Icon: BellIco   },
  { href: "/turma",       label: "Turma",   Icon: UsersIco  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "var(--azul-profundo)",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 30,
        boxShadow: "0 -2px 16px rgba(11,45,94,0.22)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {LINKS.map((l) => {
        const ativo = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
              color: ativo ? "var(--dourado-claro)" : "rgba(255,255,255,0.48)",
              flex: 1,
              padding: "8px 0",
              transition: "color 0.15s",
            }}
          >
            <l.Icon />
            <span style={{
              fontSize: 10,
              fontFamily: "var(--sans)",
              fontWeight: ativo ? 600 : 400,
              letterSpacing: "0.02em",
            }}>
              {l.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
