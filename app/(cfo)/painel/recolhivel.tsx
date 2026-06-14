"use client"

import { useState, type ReactNode } from "react"

export function Recolhivel({
  titulo,
  resumo,
  children,
  inicialAberto = false,
}: {
  titulo: string
  resumo?: string
  children: ReactNode
  inicialAberto?: boolean
}) {
  const [aberto, setAberto] = useState(inicialAberto)
  return (
    <section style={{ marginTop: 28 }}>
      <button
        onClick={() => setAberto(a => !a)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          background: "transparent", border: "none", padding: 0, textAlign: "left",
        }}
      >
        <span aria-hidden style={{ fontSize: 14, color: "var(--olive)", transform: aberto ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▶</span>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }}>{titulo}</h2>
        {resumo && <span style={{ fontSize: 13, color: "var(--ink-60)" }}>{resumo}</span>}
      </button>
      {aberto && <div style={{ marginTop: 12 }}>{children}</div>}
    </section>
  )
}
