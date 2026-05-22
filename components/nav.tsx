"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const LINKS = [
  { href: "/dashboard",    label: "Início",       icon: "🏠" },
  { href: "/ranking",      label: "Ranking",      icon: "🏆" },
  { href: "/qts",          label: "QTS",          icon: "📅" },
  { href: "/aulas",        label: "Aulas",        icon: "📚" },
  { href: "/missao",       label: "Missão",       icon: "🎯" },
  { href: "/escalas",      label: "Escalas",      icon: "🔄" },
  { href: "/xerifancia",   label: "Xerifância",   icon: "⭐" },
  { href: "/turma",        label: "Turma",        icon: "👥" },
  { href: "/aniversarios", label: "Aniversários", icon: "🎂" },
  { href: "/avisos",       label: "Avisos",       icon: "📢" },
  { href: "/links",        label: "Links Úteis",  icon: "🔗" },
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
        <span style={{ fontSize: 22 }}>🎖️</span>
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                textDecoration: "none",
                background: ativo ? "rgba(184,146,74,0.22)" : "transparent",
                borderLeft: ativo ? "3px solid var(--dourado)" : "3px solid transparent",
                transition: "background 0.15s",
                minWidth: 0,
              }}
              onMouseEnter={e => {
                if (!ativo) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"
              }}
              onMouseLeave={e => {
                if (!ativo) (e.currentTarget as HTMLElement).style.background = "transparent"
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{l.icon}</span>
              <span
                className="nav-label"
                style={{
                  fontSize: 13,
                  fontWeight: ativo ? 600 : 400,
                  color: ativo ? "#fff" : "rgba(255,255,255,0.78)",
                }}
              >
                {l.label}
              </span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              textDecoration: "none",
              background: pathname.startsWith("/admin") ? "rgba(184,146,74,0.22)" : "transparent",
              borderLeft: pathname.startsWith("/admin") ? "3px solid var(--dourado)" : "3px solid transparent",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>⚙️</span>
            <span className="nav-label" style={{
              fontSize: 13,
              fontWeight: pathname.startsWith("/admin") ? 600 : 400,
              color: "var(--dourado-claro)",
            }}>
              Admin
            </span>
          </Link>
        )}
      </nav>

      {/* Sair */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
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
          overflow: "hidden",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>🚪</span>
        <span className="nav-label" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          Sair
        </span>
      </button>
    </aside>
  )
}
