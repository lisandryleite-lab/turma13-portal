"use client"

import { useState } from "react"
import { EscalaCiaPainel } from "@/components/escala-cia-painel"

// Duas visões na aba Escalas da Turma 13: o painel da 1ª CIA (hoje, minhas
// escalas, plantão, funções e guarda-bandeira) e as escalas internas do
// pelotão (serviço P1/P3/P4, faxina e plantão) — estas vêm prontas do servidor.
export function EscalasTabs({ hojeIso, minhaMatricula, children }: { hojeIso: string; minhaMatricula: number; children: React.ReactNode }) {
  const [aba, setAba] = useState<"cia" | "turma">("cia")
  const abas = [
    { id: "cia", label: "Hoje e minhas escalas" },
    { id: "turma", label: "Serviço, faxina e plantão" },
  ] as const
  return (
    <>
      <div className="no-print" style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 0" }}>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.6rem", color: "var(--olive)", margin: "0 0 12px" }}>Escalas</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                background: aba === a.id ? "var(--olive)" : "var(--surface)", color: aba === a.id ? "var(--canvas)" : "var(--ink-60)" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      {aba === "cia" ? (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 16px 40px" }}>
          <EscalaCiaPainel hojeIso={hojeIso} minhaMatricula={minhaMatricula} />
        </div>
      ) : children}
    </>
  )
}
