"use client"

import { useEffect, useMemo, useState } from "react"

type Disciplina = {
  sigla: string; nome: string; modulo: string
  cargaTotal: number; cargaMinistrada: number
}

// Decreto 57.694/2024 — Plano do Curso CFO PM/BM.
// Frequência mínima de 75% da carga horária de CADA disciplina; logo, o aluno pode
// faltar no máximo 25% dela. Como o tempo de aula é indivisível, o limite prático é
// o piso de 25% (faltar uma aula a mais já derruba a frequência abaixo de 75%).
const LIMITE = 0.25

function limiteFaltas(cargaTotal: number) {
  return Math.floor(cargaTotal * LIMITE)
}

const STORAGE = "t13:faltas:v1"

function cor(faltas: number, limite: number) {
  if (limite === 0) return "#64748b"
  if (faltas > limite) return "#b91c1c"          // reprovado por frequência
  if (faltas === limite) return "#c2410c"        // no limite exato
  if (faltas / limite >= 0.6) return "#B8924A"   // atenção
  return "#15803d"                               // folga
}

function rotulo(faltas: number, limite: number) {
  if (limite === 0) return "Sem carga prevista"
  if (faltas > limite) return "Acima do limite"
  if (faltas === limite) return "No limite"
  if (faltas / limite >= 0.6) return "Atenção"
  return "Dentro do limite"
}

export function FaltasClient({ disciplinas }: { disciplinas: Disciplina[] }) {
  const [faltas, setFaltas] = useState<Record<string, number>>({})
  const [carregado, setCarregado] = useState(false)
  const [busca, setBusca] = useState("")
  const [soRisco, setSoRisco] = useState(false)

  // As faltas são anotação pessoal do aluno — ficam só no navegador dele,
  // nunca no banco (o portal não tem controle oficial de frequência).
  // O localStorage só existe no cliente, então a leitura precisa ser em efeito:
  // ler no render inicial quebraria a hidratação (servidor renderiza tudo zerado).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(STORAGE)
      if (bruto) setFaltas(JSON.parse(bruto))
    } catch { /* storage indisponível — segue com tudo zerado */ }
    setCarregado(true)
  }, [])

  useEffect(() => {
    if (!carregado) return
    try { localStorage.setItem(STORAGE, JSON.stringify(faltas)) } catch { /* ignora */ }
  }, [faltas, carregado])

  function setFalta(sigla: string, valor: number) {
    setFaltas(f => {
      const n = { ...f }
      if (valor <= 0) delete n[sigla]
      else n[sigla] = valor
      return n
    })
  }

  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalLimite = disciplinas.reduce((s, d) => s + limiteFaltas(d.cargaTotal), 0)
  const totalFaltas = disciplinas.reduce((s, d) => s + (faltas[d.sigla] || 0), 0)
  const emRisco = disciplinas.filter(d => {
    const lim = limiteFaltas(d.cargaTotal)
    return lim > 0 && (faltas[d.sigla] || 0) >= lim
  })

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return disciplinas.filter(d => {
      if (soRisco) {
        const lim = limiteFaltas(d.cargaTotal)
        if (!(lim > 0 && (faltas[d.sigla] || 0) >= lim)) return false
      }
      if (!termo) return true
      return d.sigla.toLowerCase().includes(termo) || d.nome.toLowerCase().includes(termo)
    })
  }, [disciplinas, busca, soRisco, faltas])

  const modulos = [...new Set(lista.map(d => d.modulo))].sort()

  function imprimir() {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const mods = [...new Set(disciplinas.map(d => d.modulo))].sort()

    const secoes = mods.map(mod => {
      const linhas = disciplinas.filter(d => d.modulo === mod).map(d => {
        const lim = limiteFaltas(d.cargaTotal)
        const f = faltas[d.sigla] || 0
        const c = cor(f, lim)
        return `<tr>
          <td style="border:1px solid #cbd5e1;padding:2px 5px;font-weight:700;color:#1A52A8;white-space:nowrap">${esc(d.sigla)}</td>
          <td style="border:1px solid #cbd5e1;padding:2px 5px">${esc(d.nome)}</td>
          <td style="border:1px solid #cbd5e1;padding:2px 5px;text-align:center">${d.cargaTotal}h</td>
          <td style="border:1px solid #cbd5e1;padding:2px 5px;text-align:center;font-weight:700;color:#0B2D5E">${lim}h</td>
          <td style="border:1px solid #cbd5e1;padding:2px 5px;text-align:center">${f}h</td>
          <td style="border:1px solid #cbd5e1;padding:2px 5px;text-align:center;font-weight:700;color:${c}">${Math.max(0, lim - f)}h</td>
        </tr>`
      }).join("")
      return `<tr><td colspan="6" style="background:#0B2D5E;color:#fff;padding:3px 6px;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:0.06em">${esc(mod)}</td></tr>${linhas}`
    }).join("")

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <title>Limite de Faltas (25%) — Turma 13</title>
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 10px; color: #1e293b; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
      </style></head>
      <body>
        <div style="text-align:center;margin-bottom:8px">
          <h1 style="font-size:18px;color:#0B2D5E;margin:0">Limite de Faltas por Disciplina — Turma 13</h1>
          <p style="font-size:10px;color:#475569;margin:2px 0 0">
            Frequência mínima de 75% &middot; limite de 25% de faltas &middot; Decreto 57.694/2024
          </p>
          <p style="font-size:10px;color:#475569;margin:2px 0 0">
            Curso: ${totalCarga}h &middot; limite total ${totalLimite}h &middot; faltas anotadas ${totalFaltas}h
          </p>
        </div>
        <table>
          <thead>
            <tr style="background:#1A52A8;color:#fff">
              <th style="border:1px solid #1A52A8;padding:3px 5px;text-align:left">Sigla</th>
              <th style="border:1px solid #1A52A8;padding:3px 5px;text-align:left">Disciplina</th>
              <th style="border:1px solid #1A52A8;padding:3px 5px">Carga</th>
              <th style="border:1px solid #1A52A8;padding:3px 5px">Pode faltar</th>
              <th style="border:1px solid #1A52A8;padding:3px 5px">Faltei</th>
              <th style="border:1px solid #1A52A8;padding:3px 5px">Saldo</th>
            </tr>
          </thead>
          <tbody>${secoes}</tbody>
        </table>
        <p style="font-size:9px;color:#64748b;margin-top:8px">
          As faltas anotadas são um controle pessoal, sem valor oficial. A frequência que vale é a lançada pela Divisão de Ensino.
        </p>
      </body></html>`

    const w = window.open("", "_blank")
    if (!w) { alert("Permita pop-ups para imprimir.") ; return }
    w.document.open(); w.document.write(html); w.document.close()
    w.onload = () => w.print()
  }

  const CARTOES = [
    { n: `${totalLimite}h`, label: "Limite total do curso", cor: "#0B2D5E" },
    { n: `${totalFaltas}h`, label: "Faltas anotadas", cor: totalFaltas > totalLimite ? "#b91c1c" : "#1A52A8" },
    { n: String(emRisco.length), label: "Disciplinas no limite", cor: emRisco.length ? "#b91c1c" : "#15803d" },
  ]

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px" }}>

      {/* ── Cabeçalho ── */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: 24,
        border: "1.5px solid var(--cinza-borda)", boxShadow: "var(--shadow-md)", marginBottom: 20,
      }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 22,
          color: "var(--azul-profundo)", marginBottom: 4 }}>
          Limite de Faltas — 25%
        </h1>
        <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
          O <strong>Decreto 57.694/2024</strong> exige frequência mínima de <strong>75%</strong> da carga
          horária de cada disciplina. Na prática, dá para faltar no máximo <strong>25%</strong> — acima
          disso, reprova por frequência, mesmo com nota boa.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
          {CARTOES.map(c => (
            <div key={c.label} style={{ background: "var(--creme)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontWeight: 800, fontSize: 22, color: c.cor }}>{c.n}</p>
              <p style={{ fontSize: 11, color: "var(--cinza-texto)" }}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controles ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar disciplina…"
          style={{ flex: 1, minWidth: 180, border: "1.5px solid var(--cinza-borda)", borderRadius: 20,
            padding: "7px 16px", fontSize: 13, background: "#fff" }}
        />
        <button onClick={() => setSoRisco(v => !v)} style={{
          padding: "7px 16px", borderRadius: 20, border: "1.5px solid",
          borderColor: soRisco ? "#b91c1c" : "var(--cinza-borda)",
          background: soRisco ? "#b91c1c" : "#fff",
          color: soRisco ? "#fff" : "var(--cinza-texto)",
          fontSize: 12, fontWeight: soRisco ? 700 : 400, cursor: "pointer",
        }}>
          ⚠ No limite ({emRisco.length})
        </button>
        <button onClick={imprimir} style={{
          padding: "7px 16px", borderRadius: 20, border: "1.5px solid var(--azul-profundo)",
          background: "var(--azul-profundo)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>
          🖨️ Imprimir
        </button>
      </div>

      {/* ── Lista por módulo ── */}
      {lista.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--cinza-texto)", padding: "40px 0" }}>
          Nenhuma disciplina encontrada.
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
                {lista.filter(d => d.modulo === mod).map((d, i) => {
                  const lim = limiteFaltas(d.cargaTotal)
                  const f = faltas[d.sigla] || 0
                  const saldo = lim - f
                  const c = cor(f, lim)
                  const usado = lim > 0 ? Math.min(100, (f / lim) * 100) : 0
                  return (
                    <div key={d.sigla} style={{
                      borderTop: i > 0 ? "1px solid var(--cinza-borda)" : "none",
                      padding: "11px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                    }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--azul-medio)" }}>{d.sigla}</span>
                          <span style={{ fontSize: 13, color: "var(--grafite)" }}>{d.nome}</span>
                          <span style={{ background: `${c}1a`, color: c, borderRadius: 20, padding: "2px 9px",
                            fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                            {rotulo(f, lim)}
                          </span>
                        </div>
                        <div style={{ height: 5, background: "#e2e8f0", borderRadius: 99, marginTop: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${usado}%`, background: c, borderRadius: 99 }} />
                        </div>
                        <p style={{ fontSize: 11, color: "var(--cinza-texto)", marginTop: 5 }}>
                          Carga {d.cargaTotal}h · já dadas {d.cargaMinistrada}h ·{" "}
                          <strong style={{ color: "var(--azul-profundo)" }}>pode faltar {lim}h</strong>
                          {lim > 0 && ` (25% de ${d.cargaTotal}h)`}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ textAlign: "center" }}>
                          <label style={{ fontSize: 9, color: "var(--cinza-texto)", display: "block",
                            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                            Faltei
                          </label>
                          <input
                            type="number" min={0} max={d.cargaTotal} value={f}
                            onChange={e => setFalta(d.sigla, Math.max(0, Math.min(d.cargaTotal, Number(e.target.value) || 0)))}
                            style={{ border: "1.5px solid var(--cinza-borda)", borderRadius: 8,
                              padding: "5px 8px", fontSize: 13, width: 62, textAlign: "center" }}
                          />
                        </div>
                        <div style={{ textAlign: "center", minWidth: 58 }}>
                          <p style={{ fontSize: 9, color: "var(--cinza-texto)", textTransform: "uppercase",
                            letterSpacing: "0.06em", marginBottom: 3 }}>Saldo</p>
                          <p style={{ fontWeight: 800, fontSize: 17, color: c }}>
                            {saldo >= 0 ? `${saldo}h` : `−${-saldo}h`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--cinza-texto)", marginTop: 20, lineHeight: 1.6,
        background: "var(--creme)", borderRadius: 10, padding: "12px 14px" }}>
        O campo <strong>Faltei</strong> é anotação pessoal e fica salva só neste navegador — não vai para o
        banco e ninguém mais vê. A frequência que vale é a lançada pela Divisão de Ensino.
        O limite considera a carga <strong>total prevista</strong> da disciplina, e 1 tempo de aula = 1 hora.
      </p>
    </div>
  )
}
