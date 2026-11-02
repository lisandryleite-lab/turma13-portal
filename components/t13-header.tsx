"use client"

// Cabeçalho da área Turma 13 — mesma linguagem visual do Portal CFO (creme,
// verde-oliva e dourado): título, volta ao portal e as seções em "pílulas"
// roláveis (funciona igual no celular, sem sidebar nem barra inferior).

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

type Secao = { href: string; label: string; ativoEm?: string[] }

const SECOES: Secao[] = [
  { href: "/dashboard", label: "Início" },
  { href: "/qts", label: "QTS" },
  { href: "/aulas", label: "Aulas e faltas", ativoEm: ["/faltas"] },
  { href: "/escalas", label: "Escalas" },
  { href: "/xerifancia", label: "Xerifância" },
  { href: "/tropa", label: "Controle de Tropa" },
]

export function T13Header({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const secoes = isAdmin ? [...SECOES, { href: "/admin", label: "Admin" }] : SECOES
  const ativo = (s: Secao) => pathname === s.href || pathname.startsWith(`${s.href}/`) || (s.ativoEm ?? []).some(p => pathname.startsWith(p))

  return (
    <header className="no-print" style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(250,249,245,0.94)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(58,74,58,0.12)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 13.5, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>← Portal</Link>
          <Link href="/dashboard" style={{ textDecoration: "none", textAlign: "center", minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.15rem", color: "var(--olive)", lineHeight: 1.1 }}>Turma 13</span>
            <span style={{ display: "block", fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>1º Pelotão · CFO 2026</span>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ background: "none", border: "none", color: "var(--ink-60)", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0, padding: 0 }}>
            Sair
          </button>
        </div>
        <nav style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 0 10px", scrollbarWidth: "none" }}>
          {secoes.map(s => {
            const on = ativo(s)
            return (
              <Link key={s.href} href={s.href}
                style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
                  background: on ? "var(--olive)" : "var(--surface)", color: on ? "var(--canvas)" : "var(--ink-60)" }}>
                {s.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
