"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Materia = { sigla: string; nome: string; total: number }
type Disc = { sigla: string; nome: string }
type Stat = { sigla: string; nome: string; acertos: number; total: number }
type Alt = { id: string; texto: string }
type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }
type Questao = {
  id: string; materia: string; modulo: string; tipo: string
  contexto: string | null
  enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string | null
  modelo: Modelo | null; fonte: string | null
}

function Enunciado({ q }: { q: Questao }) {
  return (
    <>
      {q.contexto && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fbf3e3", border: "1px solid var(--gold)", fontSize: 14, color: "var(--ink)", marginBottom: 10, lineHeight: 1.5 }}>
          {q.contexto}
        </div>
      )}
      <p style={{ fontSize: 15.5, lineHeight: 1.5, margin: 0, color: "var(--ink)" }}>{q.enunciado}</p>
    </>
  )
}
type Aba = "resolver" | "simulado" | "acerto" | "admin"

const card: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

export function QuestoesClient({
  materias, disciplinas, isAdmin, stats, totalResp, totalAcertos,
}: {
  materias: Materia[]; disciplinas: Disc[]; isAdmin: boolean
  stats: Stat[]; totalResp: number; totalAcertos: number
}) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>("resolver")

  const abas: [Aba, string][] = [
    ["resolver", "Resolver"],
    ["simulado", "Simulado"],
    ["acerto", "% de acerto"],
  ]
  if (isAdmin) abas.push(["admin", "Admin"])

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 16 }}>
        Questões
      </h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {abas.map(([t, rot]) => (
          <button key={t} onClick={() => setAba(t)}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: aba === t ? "var(--olive)" : "var(--surface)", color: aba === t ? "var(--canvas)" : "var(--ink-60)" }}>
            {rot}
          </button>
        ))}
      </div>

      {aba === "resolver" && <Resolver materias={materias} />}
      {aba === "simulado" && <Simulado materias={materias} />}
      {aba === "acerto" && <Acerto stats={stats} totalResp={totalResp} totalAcertos={totalAcertos} />}
      {aba === "admin" && isAdmin && <Admin disciplinas={disciplinas} onImport={() => router.refresh()} />}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}

// ── Alternativas / botões de resposta ──
function Opcoes({ q, escolhida, gabarito, onPick }: { q: Questao; escolhida: string | null; gabarito: string | null; onPick: (r: string) => void }) {
  const opts: Alt[] = q.tipo === "certo_errado"
    ? [{ id: "certo", texto: "Certo" }, { id: "errado", texto: "Errado" }]
    : q.alternativas
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
      {opts.map(o => {
        const sel = escolhida === o.id
        let bg = "#fff", bd = "rgba(58,74,58,0.25)", cor = "var(--ink)"
        if (gabarito) {
          if (o.id === gabarito) { bg = "#eef4ea"; bd = "var(--olive)"; cor = "var(--olive)" }
          else if (sel) { bg = "#fbecec"; bd = "var(--red)"; cor = "var(--red)" }
        } else if (sel) { bd = "var(--olive)" }
        return (
          <button key={o.id} onClick={() => !gabarito && onPick(o.id)} disabled={!!gabarito}
            style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${bd}`, background: bg, color: cor,
              fontSize: 15, cursor: gabarito ? "default" : "pointer" }}>
            {q.tipo !== "certo_errado" && <strong style={{ marginRight: 8 }}>{o.id}.</strong>}{o.texto}
          </button>
        )
      })}
    </div>
  )
}

// ── Resolver ──
function Resolver({ materias }: { materias: Materia[] }) {
  const [materia, setMateria] = useState("")
  const [qs, setQs] = useState<Questao[] | null>(null)
  const [i, setI] = useState(0)
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ acertou: boolean; gabarito: string; explicacao: string | null } | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [feitas, setFeitas] = useState(0)
  const [disTexto, setDisTexto] = useState("")
  const [disRevelado, setDisRevelado] = useState(false)

  async function iniciar() {
    if (!materia) return
    const res = await fetch(`/api/questoes?materia=${materia}&shuffle=1`)
    const data = await res.json()
    setQs(data); setI(0); setEscolhida(null); setFeedback(null); setAcertos(0); setFeitas(0); setDisTexto(""); setDisRevelado(false)
  }
  async function responder(r: string) {
    if (!qs) return
    setEscolhida(r)
    const res = await fetch("/api/respostas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questaoId: qs[i].id, resposta: r, modo: "resolver" }) })
    const j = await res.json()
    setFeedback(j); setFeitas(f => f + 1); if (j.acertou) setAcertos(a => a + 1)
  }
  function proxima() { setEscolhida(null); setFeedback(null); setDisTexto(""); setDisRevelado(false); setI(x => x + 1) }

  if (!qs) {
    return (
      <div style={card}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
          Escolha a matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={materia} onChange={e => setMateria(e.target.value)}>
            <option value="">— selecione —</option>
            {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
          </select>
        </label>
        {materias.length === 0 && <p style={{ color: "var(--ink-60)", marginTop: 10, fontSize: 13.5 }}>Ainda não há questões cadastradas.</p>}
        <button onClick={iniciar} disabled={!materia} style={{ marginTop: 14, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: materia ? "pointer" : "default" }}>
          Começar
        </button>
      </div>
    )
  }

  if (i >= qs.length) {
    return (
      <div style={{ ...card, textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)" }}>Concluído!</h2>
        <p style={{ fontSize: 18, marginTop: 8 }}>Acertos: <strong>{acertos}/{feitas}</strong></p>
        <button onClick={() => setQs(null)} style={{ marginTop: 14, padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
          Escolher outra matéria
        </button>
      </div>
    )
  }

  const q = qs[i]
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-60)", marginBottom: 8 }}>
        <span>{q.materia}{q.modulo ? ` · Mód. ${q.modulo}` : ""}</span>
        <span>Questão {i + 1} de {qs.length} · acertos {acertos}/{feitas}</span>
      </div>
      <div style={card}>
        <Enunciado q={q} />
        {q.tipo === "dissertativa" ? (
          <>
            <textarea value={disTexto} onChange={e => setDisTexto(e.target.value)} disabled={disRevelado} rows={6}
              placeholder="Escreva sua resposta…" style={{ ...inputStyle, marginTop: 12, resize: "vertical" }} />
            {!disRevelado && (
              <button onClick={() => setDisRevelado(true)} style={{ marginTop: 10, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
                Ver modelo de resposta
              </button>
            )}
          </>
        ) : (
          <Opcoes q={q} escolhida={escolhida} gabarito={feedback?.gabarito ?? null} onPick={responder} />
        )}
      </div>

      {/* Feedback objetivo */}
      {feedback && q.tipo !== "dissertativa" && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: feedback.acertou ? "#eef4ea" : "#fbecec", border: `1px solid ${feedback.acertou ? "var(--olive)" : "var(--red)"}` }}>
          <strong style={{ color: feedback.acertou ? "var(--olive)" : "var(--red)" }}>{feedback.acertou ? "✓ Acertou" : "✗ Errou"}</strong>
          {feedback.explicacao && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{feedback.explicacao}</p>}
          <button onClick={proxima} style={{ marginTop: 10, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
            {i + 1 < qs.length ? "Próxima" : "Ver resultado"}
          </button>
        </div>
      )}

      {/* Modelo da dissertativa */}
      {disRevelado && q.tipo === "dissertativa" && q.modelo && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#eef2f8", borderLeft: "3px solid var(--olive)" }}>
          <strong style={{ color: "var(--olive)" }}>▸ Modelo de resposta</strong>
          {q.modelo.estrutura && <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-60)" }}><strong>Estrutura:</strong> {q.modelo.estrutura}</p>}
          {q.modelo.criterios && q.modelo.criterios.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, color: "var(--ink-60)" }}>
              {q.modelo.criterios.map((c, k) => <li key={k}>{c}</li>)}
            </ul>
          )}
          {q.modelo.resposta && <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{q.modelo.resposta}</p>}
          <button onClick={proxima} style={{ marginTop: 10, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
            {i + 1 < qs.length ? "Próxima" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Simulado ──
function Simulado({ materias }: { materias: Materia[] }) {
  const [materia, setMateria] = useState("")
  const [qtd, setQtd] = useState("10")
  const [min, setMin] = useState("15")
  const [qs, setQs] = useState<Questao[] | null>(null)
  const [i, setI] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [restante, setRestante] = useState(0)
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(null)

  const finalizar = useCallback(async () => {
    if (!qs) return
    let acertos = 0
    for (const q of qs) {
      const r = respostas[q.id]
      if (!r) continue
      const res = await fetch("/api/respostas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questaoId: q.id, resposta: r, modo: "simulado" }) })
      const j = await res.json()
      if (j.acertou) acertos++
    }
    setResultado({ acertos, total: qs.length })
    setRestante(0)
  }, [qs, respostas])

  useEffect(() => {
    if (!qs || resultado || restante <= 0) return
    const t = setInterval(() => setRestante(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [qs, resultado, restante])

  useEffect(() => {
    if (qs && !resultado && restante === 0 && Object.keys(respostas).length >= 0 && qs.length > 0) {
      // tempo esgotou
      finalizar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante])

  async function iniciar() {
    if (!materia) return
    const res = await fetch(`/api/questoes?materia=${materia}&shuffle=1`)
    const todas: Questao[] = await res.json()
    const data = todas.filter(q => q.tipo !== "dissertativa").slice(0, Number(qtd) || 10)
    setQs(data); setI(0); setRespostas({}); setResultado(null); setRestante((Number(min) || 15) * 60)
  }

  if (!qs) {
    return (
      <div style={card}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={materia} onChange={e => setMateria(e.target.value)}>
            <option value="">— selecione —</option>
            {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Nº de questões
            <input style={{ ...inputStyle, marginTop: 6 }} value={qtd} onChange={e => setQtd(e.target.value)} inputMode="numeric" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Tempo (min)
            <input style={{ ...inputStyle, marginTop: 6 }} value={min} onChange={e => setMin(e.target.value)} inputMode="numeric" />
          </label>
        </div>
        <button onClick={iniciar} disabled={!materia} style={{ marginTop: 14, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: materia ? "pointer" : "default" }}>
          Iniciar simulado
        </button>
      </div>
    )
  }

  if (resultado) {
    const pct = resultado.total ? Math.round((resultado.acertos / resultado.total) * 100) : 0
    return (
      <div style={{ ...card, textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)" }}>Simulado encerrado</h2>
        <p style={{ fontSize: 22, marginTop: 8, fontWeight: 700, color: "var(--olive)" }}>{resultado.acertos}/{resultado.total} · {pct}%</p>
        <button onClick={() => setQs(null)} style={{ marginTop: 14, padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
          Novo simulado
        </button>
      </div>
    )
  }

  const q = qs[i]
  const mm = String(Math.floor(restante / 60)).padStart(2, "0")
  const ss = String(restante % 60).padStart(2, "0")
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--ink-60)" }}>Questão {i + 1} de {qs.length}</span>
        <span style={{ fontFamily: "var(--serif-cfo)", fontSize: 18, fontWeight: 600, color: restante < 60 ? "var(--red)" : "var(--olive)" }}>⏱ {mm}:{ss}</span>
      </div>
      <div style={card}>
        <Enunciado q={q} />
        <Opcoes q={q} escolhida={respostas[q.id] ?? null} gabarito={null} onPick={r => setRespostas(p => ({ ...p, [q.id]: r }))} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.5 : 1 }}>
          Anterior
        </button>
        {i + 1 < qs.length ? (
          <button onClick={() => setI(x => x + 1)} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Próxima</button>
        ) : (
          <button onClick={finalizar} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Finalizar</button>
        )}
      </div>
    </div>
  )
}

// ── % de acerto ──
function Acerto({ stats, totalResp, totalAcertos }: { stats: Stat[]; totalResp: number; totalAcertos: number }) {
  if (totalResp === 0) return <p style={{ color: "var(--ink-60)" }}>Você ainda não respondeu questões. Vá em “Resolver” para começar.</p>
  const pctGeral = Math.round((totalAcertos / totalResp) * 100)
  return (
    <div>
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "var(--ink-60)" }}>Desempenho geral</div>
        <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2rem", fontWeight: 600, color: "var(--olive)" }}>{pctGeral}%</div>
        <div style={{ fontSize: 14, color: "var(--ink-60)" }}>{totalAcertos} acertos em {totalResp} respostas</div>
      </div>
      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 24, marginBottom: 12 }}>Por matéria</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {stats.map(s => {
          const pct = Math.round((s.acertos / s.total) * 100)
          return (
            <li key={s.sigla}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{s.sigla}</span>
                <span style={{ color: "var(--ink-60)" }}>{s.acertos}/{s.total} · {pct}%</span>
              </div>
              <div style={{ height: 14, borderRadius: 6, background: "var(--surface)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct >= 70 ? "var(--olive)" : pct >= 50 ? "var(--gold)" : "var(--red)" }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Admin: importar pacote JSON ──
function Admin({ disciplinas, onImport }: { disciplinas: Disc[]; onImport: () => void }) {
  const [json, setJson] = useState("")
  const [msg, setMsg] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function importar() {
    setEnviando(true); setMsg("")
    let body: any
    try { body = JSON.parse(json) } catch { setEnviando(false); return setMsg("✗ JSON inválido.") }
    const res = await fetch("/api/questoes/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const j = await res.json()
    setEnviando(false)
    if (!res.ok) return setMsg("✗ " + (j.error || "Erro"))
    setMsg(`✓ ${j.materia}${j.modulo ? "/" + j.modulo : ""}: ${j.criadas} criadas, ${j.atualizadas} atualizadas (total ${j.totalMateria}).${j.erros?.length ? " Avisos: " + j.erros.join("; ") : ""}`)
    setJson("")
    onImport()
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.5 }}>
        Cole o <strong>pacote JSON</strong> gerado no Claude. A matéria precisa existir entre as {disciplinas.length} disciplinas (sigla). Importação idempotente (re-importar atualiza).
      </p>
      <pre style={{ ...card, fontSize: 12, overflowX: "auto", color: "var(--ink-60)" }}>{`{
  "materia": "LPMO", "modulo": "1",
  "questoes": [
    { "tipo": "multipla", "contexto": "(opcional) caso prático…",
      "enunciado": "...", "alternativas": [{"id":"A","texto":"..."},{"id":"B","texto":"..."}],
      "gabarito": "A", "explicacao": "gabarito comentado", "fonte": "Lei 14.751/23" },
    { "tipo": "certo_errado", "enunciado": "...", "gabarito": "certo",
      "explicacao": "justificativa (em F, explica o erro)" },
    { "tipo": "dissertativa", "enunciado": "...",
      "modelo": { "estrutura": "Intro → Desenv. → Conclusão",
        "criterios": ["critério 1","critério 2"], "resposta": "modelo de resposta…" } }
  ]
}`}</pre>
      <textarea value={json} onChange={e => setJson(e.target.value)} rows={10} placeholder="Cole o JSON aqui…"
        style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, marginTop: 8 }} />
      <button onClick={importar} disabled={enviando || !json.trim()} style={{ marginTop: 10, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: enviando ? "default" : "pointer" }}>
        {enviando ? "Importando…" : "Importar questões"}
      </button>
      {msg && <p style={{ marginTop: 10, fontSize: 13.5, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)", lineHeight: 1.5 }}>{msg}</p>}
    </div>
  )
}
