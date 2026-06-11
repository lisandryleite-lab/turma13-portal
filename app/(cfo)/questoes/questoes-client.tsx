"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Materia = { sigla: string; nome: string; total: number; modulos: string[] }

const TIPOS: [string, string][] = [["", "Todos os tipos"], ["certo_errado", "Certo/Errado"], ["multipla", "Múltipla escolha"], ["dissertativa", "Dissertativa"]]
const moduloLabel = (m: string) => (m === "" ? "Sem módulo" : `Módulo ${m}`)
function buildQuery(materia: string, modulo: string, tipo: string, extra = "") {
  let q = `materia=${encodeURIComponent(materia)}${extra}`
  if (modulo !== "__all__") q += `&modulo=${encodeURIComponent(modulo)}`
  if (tipo) q += `&tipo=${encodeURIComponent(tipo)}`
  return q
}
type Disc = { sigla: string; nome: string }
type Stat = { sigla: string; nome: string; acertos: number; total: number }
type Alt = { id: string; texto: string }
type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }
type Correcao = {
  nota: number; veredito: string; resumo: string
  criterios: { criterio: string; atendido: boolean; comentario: string }[]
  pontosFortes: string[]; pontosAMelhorar: string[]
}
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
// Painel de correção da IA (dissertativa)
function CorrecaoIA({ c }: { c: Correcao }) {
  const cor = c.nota >= 7 ? "var(--olive)" : c.nota >= 5 ? "var(--gold)" : "var(--red)"
  const nota = Number.isFinite(c.nota) ? (Math.round(c.nota * 10) / 10).toString().replace(".", ",") : "—"
  return (
    <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 12, background: "#fbf7ee", border: "1px solid var(--gold)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.6rem", fontWeight: 700, color: cor }}>{nota}</span>
        <span style={{ fontSize: 13, color: "var(--ink-60)" }}>/ 10</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: cor, marginLeft: "auto" }}>{c.veredito}</span>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{c.resumo}</p>
      {c.criterios?.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          {c.criterios.map((cr, k) => (
            <li key={k} style={{ fontSize: 13.5, lineHeight: 1.45 }}>
              <span style={{ color: cr.atendido ? "var(--olive)" : "var(--red)", fontWeight: 700, marginRight: 6 }}>{cr.atendido ? "✓" : "✗"}</span>
              <strong>{cr.criterio}</strong>{cr.comentario ? <span style={{ color: "var(--ink-60)" }}> — {cr.comentario}</span> : null}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {c.pontosFortes?.length > 0 && (
          <div style={{ flex: "1 1 180px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--olive)", marginBottom: 3 }}>Pontos fortes</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--ink)" }}>{c.pontosFortes.map((p, k) => <li key={k}>{p}</li>)}</ul>
          </div>
        )}
        {c.pontosAMelhorar?.length > 0 && (
          <div style={{ flex: "1 1 180px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--red)", marginBottom: 3 }}>A melhorar</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--ink)" }}>{c.pontosAMelhorar.map((p, k) => <li key={k}>{p}</li>)}</ul>
          </div>
        )}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--ink-60)" }}>Correção gerada por IA — pode conter imprecisões; o modelo de resposta é a referência oficial.</p>
    </div>
  )
}

type Aba = "resolver" | "simulado" | "acerto" | "admin"

const card: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

export function QuestoesClient({
  materias, disciplinas, isAdmin, stats, totalResp, totalAcertos, initialMateria = "",
}: {
  materias: Materia[]; disciplinas: Disc[]; isAdmin: boolean
  stats: Stat[]; totalResp: number; totalAcertos: number; initialMateria?: string
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

      {aba === "resolver" && <Resolver materias={materias} initialMateria={initialMateria} />}
      {aba === "simulado" && <Simulado materias={materias} />}
      {aba === "acerto" && <Acerto stats={stats} totalResp={totalResp} totalAcertos={totalAcertos} />}
      {aba === "admin" && isAdmin && <Admin disciplinas={disciplinas} materias={materias} onImport={() => router.refresh()} />}

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
function Resolver({ materias, initialMateria = "" }: { materias: Materia[]; initialMateria?: string }) {
  const [materia, setMateria] = useState(materias.some(m => m.sigla === initialMateria) ? initialMateria : "")
  const [modulo, setModulo] = useState("__all__")
  const [tipo, setTipo] = useState("")
  const [qs, setQs] = useState<Questao[] | null>(null)
  const [i, setI] = useState(0)
  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ acertou: boolean; gabarito: string; explicacao: string | null } | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [feitas, setFeitas] = useState(0)
  const [disTexto, setDisTexto] = useState("")
  const [disRevelado, setDisRevelado] = useState(false)
  const [corrigindo, setCorrigindo] = useState(false)
  const [correcao, setCorrecao] = useState<Correcao | null>(null)
  const [corrErro, setCorrErro] = useState("")

  const mAtual = materias.find(m => m.sigla === materia)
  async function iniciar() {
    if (!materia) return
    const res = await fetch(`/api/questoes?${buildQuery(materia, modulo, tipo, "&shuffle=1")}`)
    const data = await res.json()
    setQs(data); setI(0); setEscolhida(null); setFeedback(null); setAcertos(0); setFeitas(0); setDisTexto(""); setDisRevelado(false); setCorrecao(null); setCorrErro("")
  }
  async function corrigirIA() {
    if (!qs || !disTexto.trim()) return
    setCorrigindo(true); setCorrErro(""); setCorrecao(null)
    try {
      const res = await fetch("/api/ia/corrigir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questaoId: qs[i].id, resposta: disTexto }) })
      const j = await res.json()
      if (!res.ok) setCorrErro(j.error || "Erro ao corrigir.")
      else setCorrecao(j)
    } catch { setCorrErro("Falha de conexão.") }
    setCorrigindo(false)
  }
  async function responder(r: string) {
    if (!qs) return
    setEscolhida(r)
    const res = await fetch("/api/respostas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questaoId: qs[i].id, resposta: r, modo: "resolver" }) })
    const j = await res.json()
    setFeedback(j); setFeitas(f => f + 1); if (j.acertou) setAcertos(a => a + 1)
  }
  function proxima() { setEscolhida(null); setFeedback(null); setDisTexto(""); setDisRevelado(false); setCorrecao(null); setCorrErro(""); setI(x => x + 1) }

  if (!qs) {
    return (
      <div style={card}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
          Matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={materia} onChange={e => { setMateria(e.target.value); setModulo("__all__") }}>
            <option value="">— selecione —</option>
            {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
          </select>
        </label>
        {mAtual && (
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <label style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Módulo
              <select style={{ ...inputStyle, marginTop: 6 }} value={modulo} onChange={e => setModulo(e.target.value)}>
                <option value="__all__">Todos os módulos</option>
                {mAtual.modulos.map(md => <option key={md} value={md}>{moduloLabel(md)}</option>)}
              </select>
            </label>
            <label style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Tipo
              <select style={{ ...inputStyle, marginTop: 6 }} value={tipo} onChange={e => setTipo(e.target.value)}>
                {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
        )}
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
            <textarea value={disTexto} onChange={e => setDisTexto(e.target.value)} disabled={corrigindo} rows={6}
              placeholder="Escreva sua resposta…" style={{ ...inputStyle, marginTop: 12, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button onClick={corrigirIA} disabled={corrigindo || !disTexto.trim()}
                style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "var(--canvas)", fontWeight: 600, cursor: corrigindo || !disTexto.trim() ? "default" : "pointer", opacity: !disTexto.trim() ? 0.5 : 1 }}>
                {corrigindo ? "Corrigindo…" : "✦ Corrigir com IA"}
              </button>
              {!disRevelado && (
                <button onClick={() => setDisRevelado(true)}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, cursor: "pointer" }}>
                  Ver modelo de resposta
                </button>
              )}
            </div>
            {corrErro && <p style={{ marginTop: 8, fontSize: 13, color: "var(--red)" }}>{corrErro}</p>}
            {correcao && <CorrecaoIA c={correcao} />}
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
  const [modulo, setModulo] = useState("__all__")
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

  const mAtual = materias.find(m => m.sigla === materia)
  async function iniciar() {
    if (!materia) return
    const res = await fetch(`/api/questoes?${buildQuery(materia, modulo, "", "&shuffle=1")}`)
    const todas: Questao[] = await res.json()
    const data = todas.filter(q => q.tipo !== "dissertativa").slice(0, Number(qtd) || 10)
    setQs(data); setI(0); setRespostas({}); setResultado(null); setRestante((Number(min) || 15) * 60)
  }

  if (!qs) {
    return (
      <div style={card}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={materia} onChange={e => { setMateria(e.target.value); setModulo("__all__") }}>
            <option value="">— selecione —</option>
            {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
          </select>
        </label>
        {mAtual && (
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginTop: 12 }}>Módulo
            <select style={{ ...inputStyle, marginTop: 6 }} value={modulo} onChange={e => setModulo(e.target.value)}>
              <option value="__all__">Todos os módulos</option>
              {mAtual.modulos.map(md => <option key={md} value={md}>{moduloLabel(md)}</option>)}
            </select>
          </label>
        )}
        <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 10 }}>O simulado usa apenas questões objetivas (Certo/Errado e Múltipla escolha).</p>
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

// ── Admin: importar pacote JSON + limpar matéria ──
function Admin({ disciplinas, materias, onImport }: { disciplinas: Disc[]; materias: Materia[]; onImport: () => void }) {
  const [json, setJson] = useState("")
  const [msg, setMsg] = useState("")
  const [enviando, setEnviando] = useState(false)
  // gerador IA
  const [genMat, setGenMat] = useState("")
  const [genMod, setGenMod] = useState("")
  const [genQtd, setGenQtd] = useState("8")
  const [genTipos, setGenTipos] = useState<string[]>(["certo_errado", "multipla", "dissertativa"])
  const [genTexto, setGenTexto] = useState("")
  const [gerando, setGerando] = useState(false)
  const [genMsg, setGenMsg] = useState("")
  function toggleTipo(t: string) { setGenTipos(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]) }
  async function gerarIA() {
    if (!genMat) return
    setGerando(true); setGenMsg("")
    try {
      const res = await fetch("/api/ia/gerar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materia: genMat, modulo: genMod.trim(), quantidade: Number(genQtd) || 8, tipos: genTipos, texto: genTexto.trim() }) })
      const j = await res.json()
      if (!res.ok) setGenMsg("✗ " + (j.error || "Erro"))
      else { setJson(JSON.stringify(j.pacote, null, 2)); setGenMsg(`✓ ${j.total} questões geradas — revise abaixo e clique em Importar.`) }
    } catch { setGenMsg("✗ Falha de conexão.") }
    setGerando(false)
  }
  // limpar
  const [limparMat, setLimparMat] = useState("")
  const [limparMod, setLimparMod] = useState("__all__")
  const [limpando, setLimpando] = useState(false)
  const [limparMsg, setLimparMsg] = useState("")
  const mLimpar = materias.find(m => m.sigla === limparMat)

  async function limpar() {
    if (!limparMat) return
    const escopo = limparMod === "__all__" ? "TODAS as questões" : `as questões do ${moduloLabel(limparMod)}`
    if (!confirm(`Excluir ${escopo} de ${limparMat}? Isso também apaga as respostas dos alunos e não pode ser desfeito.`)) return
    setLimpando(true); setLimparMsg("")
    let url = `/api/questoes/import?materia=${encodeURIComponent(limparMat)}`
    if (limparMod !== "__all__") url += `&modulo=${encodeURIComponent(limparMod)}`
    const res = await fetch(url, { method: "DELETE" })
    const j = await res.json()
    setLimpando(false)
    if (!res.ok) return setLimparMsg("✗ " + (j.error || "Erro"))
    setLimparMsg(`✓ ${j.removidas} questões removidas.`)
    setLimparMat(""); setLimparMod("__all__"); onImport()
  }

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
      {/* Gerador de questões com IA */}
      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 0, marginBottom: 8 }}>✦ Gerar questões com IA</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        A IA gera questões a partir do <strong>memento da matéria</strong> (ou de um texto colado). O resultado cai no campo de import abaixo para você <strong>revisar antes</strong> de salvar.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 160px" }}>Matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={genMat} onChange={e => setGenMat(e.target.value)}>
            <option value="">— selecione —</option>
            {disciplinas.map(d => <option key={d.sigla} value={d.sigla}>{d.sigla} — {d.nome}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 110px" }}>Módulo <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>(opc.)</span>
          <input style={{ ...inputStyle, marginTop: 6 }} value={genMod} onChange={e => setGenMod(e.target.value)} placeholder="ex.: 3" />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600, flex: "0 1 90px" }}>Qtd
          <input style={{ ...inputStyle, marginTop: 6 }} value={genQtd} onChange={e => setGenQtd(e.target.value)} inputMode="numeric" />
        </label>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
        {[["certo_errado", "Certo/Errado"], ["multipla", "Múltipla"], ["dissertativa", "Dissertativa"]].map(([v, l]) => (
          <label key={v} style={{ fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={genTipos.includes(v)} onChange={() => toggleTipo(v)} /> {l}
          </label>
        ))}
      </div>
      <textarea value={genTexto} onChange={e => setGenTexto(e.target.value)} rows={3} placeholder="(Opcional) Cole um texto-fonte. Vazio = usa o memento cadastrado da matéria."
        style={{ ...inputStyle, marginTop: 10, resize: "vertical" }} />
      <button onClick={gerarIA} disabled={gerando || !genMat || genTipos.length === 0}
        style={{ marginTop: 10, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "var(--canvas)", fontWeight: 600, cursor: gerando || !genMat ? "default" : "pointer", opacity: !genMat || genTipos.length === 0 ? 0.6 : 1 }}>
        {gerando ? "Gerando… (pode levar até 1 min)" : "✦ Gerar questões"}
      </button>
      {genMsg && <p style={{ marginTop: 10, fontSize: 13.5, color: genMsg.startsWith("✓") ? "var(--olive)" : "var(--red)", lineHeight: 1.5 }}>{genMsg}</p>}

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 28, marginBottom: 8 }}>Revisar e salvar</h2>
      <p style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        As questões geradas pela IA aparecem aqui para você <strong>revisar</strong> antes de salvar. A importação é idempotente (re-importar atualiza).
      </p>
      <textarea value={json} onChange={e => setJson(e.target.value)} rows={10} placeholder="Gere questões acima para revisar aqui…"
        style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, marginTop: 8 }} />
      <button onClick={importar} disabled={enviando || !json.trim()} style={{ marginTop: 10, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: enviando ? "default" : "pointer" }}>
        {enviando ? "Importando…" : "Importar questões"}
      </button>
      {msg && <p style={{ marginTop: 10, fontSize: 13.5, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)", lineHeight: 1.5 }}>{msg}</p>}

      {/* Limpar matéria */}
      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--red)", marginTop: 32, marginBottom: 8 }}>Limpar matéria</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        Remove as questões (e as respostas dos alunos) de uma matéria — útil para recadastrar do zero. Ação irreversível.
      </p>
      {materias.length === 0 ? <p style={{ color: "var(--ink-60)", fontSize: 13.5 }}>Nenhuma matéria com questões.</p> : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 180px" }}>Matéria
            <select style={{ ...inputStyle, marginTop: 6 }} value={limparMat} onChange={e => { setLimparMat(e.target.value); setLimparMod("__all__") }}>
              <option value="">— selecione —</option>
              {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} ({m.total})</option>)}
            </select>
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 160px" }}>Módulo
            <select style={{ ...inputStyle, marginTop: 6 }} value={limparMod} onChange={e => setLimparMod(e.target.value)} disabled={!mLimpar}>
              <option value="__all__">Todos</option>
              {mLimpar?.modulos.map(md => <option key={md} value={md}>{moduloLabel(md)}</option>)}
            </select>
          </label>
          <button onClick={limpar} disabled={!limparMat || limpando} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--red)", background: "#fff", color: "var(--red)", fontWeight: 600, cursor: !limparMat || limpando ? "default" : "pointer", opacity: !limparMat ? 0.5 : 1 }}>
            {limpando ? "Removendo…" : "Excluir"}
          </button>
        </div>
      )}
      {limparMsg && <p style={{ marginTop: 10, fontSize: 13.5, color: limparMsg.startsWith("✓") ? "var(--olive)" : "var(--red)" }}>{limparMsg}</p>}
    </div>
  )
}
