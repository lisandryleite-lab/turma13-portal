"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Disciplina = {
  id: string; sigla: string; nome: string; modulo: string
  cargaTotal: number; cargaMinistrada: number; status: string
}

type Filtro = "todas" | "concluidas" | "andamento" | "pendentes"

function RingChart({ pct, size = 100 }: { pct: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const cor = pct >= 100 ? "#15803d" : pct >= 40 ? "#1A52A8" : "#B8924A"
  return (
    <svg width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.09} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={cor} strokeWidth={size * 0.09}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + size * 0.07} textAnchor="middle"
        fontSize={size < 60 ? size * 0.22 : size * 0.17}
        fontWeight="800" fill="#0B2D5E" fontFamily="Arial,sans-serif">
        {pct}%
      </text>
    </svg>
  )
}

function BadgeStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; cor: string }> = {
    "Concluída":    { bg: "#dcfce7", cor: "#15803d" },
    "Em andamento": { bg: "#dbeafe", cor: "#1A52A8" },
    "Início":       { bg: "#f1f5f9", cor: "#64748b" },
  }
  const s = map[status] || map["Início"]
  return (
    <span style={{
      background: s.bg, color: s.cor, borderRadius: 20, padding: "2px 9px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {status}
    </span>
  )
}

export function AulasClient({
  disciplinas, isAdmin, semana, totalCarga, totalMinistradas,
}: {
  disciplinas: Disciplina[]
  isAdmin: boolean
  semana: number
  totalCarga: number
  totalMinistradas: number
}) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const [abertas, setAbertas] = useState<Set<string>>(new Set())
  const [editando, setEditando] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<string, { cargaMinistrada: number; status: string }>>({})

  const pctGeral = totalCarga > 0 ? Math.round((totalMinistradas / totalCarga) * 100) : 0
  const concluidas = disciplinas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0)
  const emAndamento = disciplinas.filter(d => d.cargaMinistrada > 0 && d.cargaMinistrada < d.cargaTotal)
  const pendentes = disciplinas.filter(d => d.cargaMinistrada === 0)

  const mediaHorasSemana = semana > 0 ? totalMinistradas / semana : 0
  const restantes = totalCarga - totalMinistradas
  const semanasRestantes = mediaHorasSemana > 0 ? Math.ceil(restantes / mediaHorasSemana) : null
  const dataFimProjetada = semanasRestantes
    ? new Date(Date.now() + semanasRestantes * 7 * 24 * 60 * 60 * 1000)
    : null

  const listaFiltrada = filtro === "concluidas" ? concluidas
    : filtro === "andamento" ? emAndamento
    : filtro === "pendentes" ? pendentes
    : disciplinas

  const modulos = [...new Set(listaFiltrada.map(d => d.modulo))].sort()

  function toggleAberta(sigla: string) {
    setAbertas(prev => {
      const n = new Set(prev)
      n.has(sigla) ? n.delete(sigla) : n.add(sigla)
      return n
    })
  }

  async function salvar(sigla: string) {
    const val = valores[sigla]
    await fetch("/api/disciplinas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sigla, ...val }),
    })
    setEditando(null)
    router.refresh()
  }

  const FILTROS: { id: Filtro; label: string; n: number }[] = [
    { id: "todas",      label: "Todas",        n: disciplinas.length },
    { id: "andamento",  label: "Em andamento", n: emAndamento.length },
    { id: "concluidas", label: "Concluídas",   n: concluidas.length },
    { id: "pendentes",  label: "Pendentes",    n: pendentes.length },
  ]

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px" }}>

      {/* ── Painel resumo ── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px",
        border: "1.5px solid var(--cinza-borda)", boxShadow: "var(--shadow-md)",
        display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center",
        marginBottom: 24,
      }}>
        <RingChart pct={pctGeral} size={110} />

        <div style={{ flex: 1, minWidth: 180 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 22,
            color: "var(--azul-profundo)", marginBottom: 4 }}>
            Aulas — 52 Disciplinas
          </h1>
          <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 14 }}>
            {totalMinistradas}h de {totalCarga}h ministradas
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[
              { n: concluidas.length,  label: "Concluídas",   cor: "#15803d" },
              { n: emAndamento.length, label: "Em andamento", cor: "#1A52A8" },
              { n: pendentes.length,   label: "Pendentes",    cor: "#64748b" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--creme)", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ fontWeight: 800, fontSize: 20, color: s.cor }}>{s.n}</p>
                <p style={{ fontSize: 10, color: "var(--cinza-texto)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projeção */}
        {dataFimProjetada && (
          <div style={{ background: "var(--azul-claro)", borderRadius: 12, padding: "16px 20px", minWidth: 155 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--cinza-texto)", textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 6 }}>Projeção de Término</p>
            <p style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 18, color: "var(--azul-profundo)" }}>
              {dataFimProjetada.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 11, color: "var(--cinza-texto)", marginTop: 4 }}>
              ~{semanasRestantes} semanas restantes
            </p>
            <p style={{ fontSize: 11, color: "var(--cinza-texto)" }}>
              Média: {mediaHorasSemana.toFixed(1)}h/semana
            </p>
          </div>
        )}
      </div>

      {/* ── Filtros ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)} style={{
            padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
            borderColor: filtro === f.id ? "var(--azul-profundo)" : "var(--cinza-borda)",
            background: filtro === f.id ? "var(--azul-profundo)" : "#fff",
            color: filtro === f.id ? "#fff" : "var(--cinza-texto)",
            fontSize: 12, fontWeight: filtro === f.id ? 700 : 400,
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {f.label} <span style={{ opacity: 0.65 }}>({f.n})</span>
          </button>
        ))}
      </div>

      {/* ── Lista por módulo ── */}
      {listaFiltrada.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--cinza-texto)", padding: "40px 0" }}>
          Nenhuma disciplina nesta categoria.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {modulos.map(mod => (
            <div key={mod}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--cinza-texto)", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 6, paddingLeft: 4 }}>
                {mod}
              </p>
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid var(--cinza-borda)",
                boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                {listaFiltrada.filter(d => d.modulo === mod).map((d, i, arr) => {
                  const pct = d.cargaTotal > 0 ? Math.round((d.cargaMinistrada / d.cargaTotal) * 100) : 0
                  const aberta = abertas.has(d.sigla)
                  const val = valores[d.sigla]
                  return (
                    <div key={d.sigla} style={{ borderTop: i > 0 ? "1px solid var(--cinza-borda)" : "none" }}>
                      <button onClick={() => toggleAberta(d.sigla)} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12,
                        padding: "11px 16px", background: "transparent", border: "none",
                        cursor: "pointer", textAlign: "left",
                      }}>
                        <RingChart pct={pct} size={42} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--azul-medio)", flexShrink: 0 }}>
                              {d.sigla}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--grafite)", flex: 1, textAlign: "left" }}>
                              {d.nome}
                            </span>
                            <BadgeStatus status={d.status} />
                          </div>
                          <div style={{ height: 4, background: "#e2e8f0", borderRadius: 99, marginTop: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99,
                              background: pct >= 100 ? "#15803d" : pct > 0 ? "#1A52A8" : "#cbd5e1" }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--cinza-texto)", flexShrink: 0, width: 56, textAlign: "right" }}>
                          {d.cargaMinistrada}h/{d.cargaTotal}h
                        </span>
                        <span style={{ fontSize: 13, color: "var(--cinza-texto)", flexShrink: 0,
                          transform: aberta ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                      </button>

                      {aberta && (
                        <div style={{ background: "var(--creme)", borderTop: "1px solid var(--cinza-borda)",
                          padding: "14px 16px 14px 70px" }}>
                          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13, marginBottom: 10 }}>
                            <span><span style={{ color: "var(--cinza-texto)" }}>Ministradas: </span><strong>{d.cargaMinistrada}h</strong></span>
                            <span><span style={{ color: "var(--cinza-texto)" }}>Total: </span><strong>{d.cargaTotal}h</strong></span>
                            <span><span style={{ color: "var(--cinza-texto)" }}>Restante: </span><strong>{d.cargaTotal - d.cargaMinistrada}h</strong></span>
                            <span><span style={{ color: "var(--cinza-texto)" }}>Módulo: </span><strong>{d.modulo}</strong></span>
                          </div>

                          {isAdmin && editando !== d.sigla && (
                            <button onClick={e => { e.stopPropagation(); setEditando(d.sigla); setValores(v => ({ ...v, [d.sigla]: { cargaMinistrada: d.cargaMinistrada, status: d.status } })) }}
                              style={{ fontSize: 12, color: "var(--azul-medio)", background: "none",
                                border: "1px solid var(--azul-medio)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                              Editar progresso
                            </button>
                          )}

                          {editando === d.sigla && (
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                              <div>
                                <label style={{ fontSize: 11, color: "var(--cinza-texto)", display: "block", marginBottom: 2 }}>Horas ministradas</label>
                                <input type="number" min={0} max={d.cargaTotal}
                                  value={val?.cargaMinistrada ?? d.cargaMinistrada}
                                  onChange={e => setValores(v => ({ ...v, [d.sigla]: { ...val, cargaMinistrada: Number(e.target.value) } }))}
                                  style={{ border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13, width: 90 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, color: "var(--cinza-texto)", display: "block", marginBottom: 2 }}>Status</label>
                                <select value={val?.status ?? d.status}
                                  onChange={e => setValores(v => ({ ...v, [d.sigla]: { ...val, status: e.target.value } }))}
                                  style={{ border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                                  <option>Início</option>
                                  <option>Em andamento</option>
                                  <option>Concluída</option>
                                </select>
                              </div>
                              <button onClick={() => salvar(d.sigla)}
                                style={{ background: "var(--azul-profundo)", color: "#fff", border: "none",
                                  borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                                Salvar
                              </button>
                              <button onClick={() => setEditando(null)}
                                style={{ background: "none", border: "none", fontSize: 12, color: "var(--cinza-texto)", cursor: "pointer" }}>
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
