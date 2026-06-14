"use client"

import { useMemo, useState } from "react"

type Log = {
  id: string
  timestamp: string
  nomeGuerra: string
  matricula: number
  area: string
  acao: string
}

type Periodo = "hoje" | "7d" | "semana" | "dia" | "tudo"

function inicioDoDia(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// segunda-feira da semana de uma data
function inicioDaSemana(d: Date) {
  const base = inicioDoDia(d)
  const dow = base.getDay() // 0=dom
  const diff = dow === 0 ? -6 : 1 - dow
  base.setDate(base.getDate() + diff)
  return base
}

const fmtDiaLongo = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
const fmtHora = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

export function LogsAdmin({ logs }: { logs: Log[] }) {
  const [aberto, setAberto] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>("7d")
  const [dia, setDia] = useState("") // yyyy-mm-dd quando periodo === "dia"

  const filtrados = useMemo(() => {
    const agora = new Date()
    return logs.filter(l => {
      const t = new Date(l.timestamp)
      if (periodo === "hoje") return t >= inicioDoDia(agora)
      if (periodo === "7d") return t >= new Date(agora.getTime() - 7 * 864e5)
      if (periodo === "semana") return t >= inicioDaSemana(agora)
      if (periodo === "dia") {
        if (!dia) return true
        const sel = new Date(dia + "T12:00:00")
        return inicioDoDia(t).getTime() === inicioDoDia(sel).getTime()
      }
      return true // tudo
    })
  }, [logs, periodo, dia])

  // agrupa por dia (mais recente primeiro)
  const grupos = useMemo(() => {
    const map = new Map<string, Log[]>()
    for (const l of filtrados) {
      const k = inicioDoDia(new Date(l.timestamp)).toISOString()
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(l)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtrados])

  const btn = (p: Periodo, label: string) => (
    <button
      onClick={() => setPeriodo(p)}
      style={{
        padding: "5px 12px", borderRadius: 99, fontSize: 12.5, cursor: "pointer",
        border: "1px solid " + (periodo === p ? "var(--olive)" : "rgba(58,74,58,0.25)"),
        background: periodo === p ? "var(--olive)" : "transparent",
        color: periodo === p ? "var(--canvas)" : "var(--ink-60)",
        fontWeight: periodo === p ? 600 : 400,
      }}
    >
      {label}
    </button>
  )

  return (
    <section style={{ marginTop: 28 }}>
      {/* Cabeçalho minimizável */}
      <button
        onClick={() => setAberto(a => !a)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          background: "transparent", border: "none", padding: 0, textAlign: "left",
        }}
      >
        <span aria-hidden style={{ fontSize: 14, color: "var(--olive)", transform: aberto ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▶</span>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }}>
          Modificações
        </h2>
        <span style={{ fontSize: 13, color: "var(--ink-60)" }}>({logs.length}) · LGPD</span>
      </button>

      {aberto && (
        <div style={{ marginTop: 12 }}>
          {/* Filtros */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 }}>
            {btn("hoje", "Hoje")}
            {btn("semana", "Esta semana")}
            {btn("7d", "7 dias")}
            {btn("tudo", "Tudo")}
            <span style={{ width: 1, height: 20, background: "rgba(58,74,58,0.2)", margin: "0 2px" }} />
            <input
              type="date"
              value={dia}
              onChange={e => { setDia(e.target.value); setPeriodo("dia") }}
              style={{
                border: "1px solid rgba(58,74,58,0.25)", borderRadius: 8, padding: "5px 10px",
                fontSize: 12.5, color: "var(--ink)", background: "transparent",
              }}
            />
            <span style={{ fontSize: 12.5, color: "var(--ink-60)", marginLeft: "auto" }}>
              {filtrados.length} registro{filtrados.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Lista agrupada por dia */}
          {grupos.length === 0 ? (
            <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Nenhuma modificação no período.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {grupos.map(([k, itens]) => (
                <div key={k}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: "var(--olive)", textTransform: "uppercase",
                    letterSpacing: "0.04em", marginBottom: 6,
                  }}>
                    {fmtDiaLongo(new Date(k))} · {itens.length}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {itens.map(l => (
                      <li key={l.id} style={{
                        fontSize: 13, color: "var(--ink)", padding: "8px 12px", borderRadius: 8,
                        background: "#fff", border: "1px solid rgba(58,74,58,0.12)",
                      }}>
                        <span style={{ color: "var(--ink-60)" }}>{fmtHora(new Date(l.timestamp))}</span>
                        {" · "}<strong>{l.nomeGuerra}</strong> ({l.matricula})
                        {" · "}<span style={{ color: "var(--olive)" }}>{l.area}</span>
                        {" — "}{l.acao}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
