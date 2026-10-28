"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { moduloLabel, moduloLabelCurto } from "@/lib/modulos-titulos"

type Materia = { sigla: string; nome: string; total: number; modulos: string[] }

const TIPOS: [string, string][] = [["", "Todas as modalidades"], ["certo_errado", "Certo/Errado"], ["multipla", "Múltipla escolha"], ["dissertativa", "Dissertativa"]]
const STATUS: [string, string][] = [["", "Todas"], ["nao_respondidas", "Não respondidas"], ["respondidas", "Respondidas"], ["acertei", "Acertei"], ["errei", "Errei"]]

// Filtros no estilo QConcursos — combináveis entre si e enviados ao GET /api/questoes.
type Filtros = { materia: string; modulos: string[]; tipo: string; status: string; excluirRespondidas: boolean; texto: string }
const FILTROS_VAZIOS: Filtros = { materia: "", modulos: [], tipo: "", status: "", excluirRespondidas: false, texto: "" }
const CHAVE_OCULTAR = "questoes:ocultarRespondidas"

function buildQuery(f: Filtros, extra = "") {
  const p = new URLSearchParams()
  if (f.materia) p.set("materia", f.materia)
  for (const m of f.modulos) p.append("modulo", m)
  if (f.tipo) p.set("tipo", f.tipo)
  if (f.excluirRespondidas) p.set("excluirRespondidas", "1")
  else if (f.status) p.set("status", f.status)
  if (f.texto.trim()) p.set("q", f.texto.trim())
  return p.toString() + extra
}

function lerOcultar() {
  try { return localStorage.getItem(CHAVE_OCULTAR) === "1" } catch { return false }
}
function gravarOcultar(v: boolean) {
  try { localStorage.setItem(CHAVE_OCULTAR, v ? "1" : "0") } catch { /* sem storage: só não lembra */ }
}

/** Estado dos filtros + contagem ao vivo de quantas questões batem. */
function useFiltros(materias: Materia[], inicial: Partial<Filtros> = {}, extraContagem = "") {
  const [f, setF] = useState<Filtros>({ ...FILTROS_VAZIOS, ...inicial })
  const [total, setTotal] = useState<number | null>(null)
  const [rodada, setRodada] = useState(0)   // recontar ao voltar de uma bateria (respondidas mudaram)

  useEffect(() => { if (lerOcultar()) setF(x => ({ ...x, excluirRespondidas: true })) }, [])

  const query = buildQuery(f)
  useEffect(() => {
    const ctl = new AbortController()
    setTotal(null)
    const t = setTimeout(() => {
      fetch(`/api/questoes?${query}&count=1${extraContagem}`, { signal: ctl.signal })
        .then(r => r.json()).then(j => setTotal(typeof j.total === "number" ? j.total : 0))
        .catch(() => {})
    }, 300)
    return () => { clearTimeout(t); ctl.abort() }
  }, [query, extraContagem, rodada])

  function set<K extends keyof Filtros>(k: K, v: Filtros[K]) {
    if (k === "excluirRespondidas") gravarOcultar(v as boolean)
    setF(x => ({ ...x, [k]: v, ...(k === "materia" ? { modulos: [] } : {}) }))
  }
  function limpar() { gravarOcultar(false); setF(FILTROS_VAZIOS) }
  const mAtual = materias.find(m => m.sigla === f.materia)
  return { f, set, limpar, total, mAtual, recontar: () => setRodada(r => r + 1) }
}

const chip = (ativo: boolean, desab = false): React.CSSProperties => ({
  padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: desab ? "default" : "pointer",
  border: `1px solid ${ativo ? "var(--olive)" : "rgba(58,74,58,0.3)"}`,
  background: ativo ? "var(--olive)" : "#fff", color: ativo ? "var(--canvas)" : "var(--ink)", opacity: desab ? 0.45 : 1,
})
const rotulo: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }

function PainelFiltros({ materias, filtros, comTipo = true }: { materias: Materia[]; filtros: ReturnType<typeof useFiltros>; comTipo?: boolean }) {
  const { f, set, limpar, total, mAtual } = filtros
  const sujo = JSON.stringify(f) !== JSON.stringify(FILTROS_VAZIOS)
  function toggleModulo(md: string) {
    set("modulos", f.modulos.includes(md) ? f.modulos.filter(x => x !== md) : [...f.modulos, md])
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        <span style={rotulo}>Disciplina</span>
        <select style={inputStyle} value={f.materia} onChange={e => set("materia", e.target.value)}>
          <option value="">Todas as disciplinas</option>
          {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
        </select>
      </label>

      {mAtual && mAtual.modulos.length > 1 && (
        <div>
          <span style={rotulo}>Assunto {f.modulos.length > 0 && <span style={{ textTransform: "none", fontWeight: 600 }}>· {f.modulos.length} selecionado{f.modulos.length > 1 ? "s" : ""}</span>}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 210, overflowY: "auto", padding: 2 }}>
            <button type="button" onClick={() => set("modulos", [])} style={chip(f.modulos.length === 0)}>Todos</button>
            {mAtual.modulos.map(md => (
              <button key={md} type="button" onClick={() => toggleModulo(md)} style={{ ...chip(f.modulos.includes(md)), textAlign: "left", borderRadius: 12 }}>
                {moduloLabel(f.materia, md)}
              </button>
            ))}
          </div>
        </div>
      )}

      {comTipo && (
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
          <span style={rotulo}>Modalidade</span>
          <select style={inputStyle} value={f.tipo} onChange={e => set("tipo", e.target.value)}>
            {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      )}

      <div>
        <span style={rotulo}>Status</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {STATUS.map(([v, l]) => {
            const desab = f.excluirRespondidas && v !== "" && v !== "nao_respondidas"
            const ativo = f.excluirRespondidas ? v === "nao_respondidas" : f.status === v
            return (
              <button key={v} type="button" disabled={desab || f.excluirRespondidas} onClick={() => set("status", v)} style={chip(ativo, desab)}>{l}</button>
            )
          })}
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: f.excluirRespondidas ? "#eef4ea" : "#fff", border: `1px solid ${f.excluirRespondidas ? "var(--olive)" : "rgba(58,74,58,0.25)"}` }}>
        <input type="checkbox" checked={f.excluirRespondidas} onChange={e => set("excluirRespondidas", e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "var(--olive)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: "var(--ink)" }}>
          <strong>Ocultar questões que já respondi</strong>
          <span style={{ display: "block", fontSize: 12, color: "var(--ink-60)" }}>Mostra só as inéditas para você. Dissertativas contam como não respondidas.</span>
        </span>
      </label>

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        <span style={rotulo}>Palavra-chave</span>
        <input style={inputStyle} type="search" value={f.texto} onChange={e => set("texto", e.target.value)} placeholder="Buscar no enunciado (ex.: deserção, art. 244)" />
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13.5 }}>
        <span style={{ color: "var(--ink-60)" }}>
          {total === null ? "Contando…" : total < 0 ? "Não foi possível contar as questões." : <><strong style={{ color: total ? "var(--olive)" : "var(--red)", fontSize: 15 }}>{total}</strong> {total === 1 ? "questão encontrada" : "questões encontradas"}</>}
          {!f.materia && total !== null && total > 300 && <span> · serão sorteadas até 300</span>}
        </span>
        {sujo && <button type="button" onClick={limpar} style={{ border: "none", background: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, padding: 0 }}>Limpar filtros</button>}
      </div>
    </div>
  )
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

// Renderiza o contexto suportando tabelas em markdown (| a | b |) + linhas de texto.
function ContextoView({ texto }: { texto: string }) {
  const linhas = texto.split("\n")
  const ehLinhaTabela = (l: string) => l.trim().startsWith("|") && l.includes("|", 1)
  const ehSeparador = (l: string) => /^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|?\s*$/.test(l)
  const celulas = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim())

  const blocos: React.ReactNode[] = []
  let i = 0
  while (i < linhas.length) {
    if (ehLinhaTabela(linhas[i])) {
      const rows: string[] = []
      while (i < linhas.length && ehLinhaTabela(linhas[i])) { rows.push(linhas[i]); i++ }
      const header = celulas(rows[0])
      const body = rows.slice(ehSeparador(rows[1] || "") ? 2 : 1).map(celulas)
      blocos.push(
        <table key={`t${i}`} style={{ borderCollapse: "collapse", margin: "6px 0", fontSize: 13.5 }}>
          <thead>
            <tr>{header.map((c, k) => (
              <th key={k} style={{ border: "1px solid var(--gold)", background: "var(--gold)", color: "#fff", padding: "3px 10px", textAlign: k === 0 ? "left" : "right" }}>{c}</th>
            ))}</tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri}>{r.map((c, k) => (
                <td key={k} style={{ border: "1px solid #e4d9bd", padding: "3px 10px", textAlign: k === 0 ? "left" : "right", fontWeight: k === 0 ? 600 : 400 }}>{c}</td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      )
    } else {
      const l = linhas[i]
      if (l.trim()) blocos.push(<p key={`p${i}`} style={{ margin: "4px 0" }}>{l}</p>)
      i++
    }
  }
  return <>{blocos}</>
}

function Enunciado({ q }: { q: Questao }) {
  return (
    <>
      {q.contexto && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fbf3e3", border: "1px solid var(--gold)", fontSize: 14, color: "var(--ink)", marginBottom: 10, lineHeight: 1.5, overflowX: "auto" }}>
          <ContextoView texto={q.contexto} />
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
  const filtros = useFiltros(materias, { materia: materias.some(m => m.sigla === initialMateria) ? initialMateria : "" })
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

  async function iniciar() {
    if (!filtros.total) return   // 0 = nada a resolver; -1 (contagem falhou) segue
    const res = await fetch(`/api/questoes?${buildQuery(filtros.f, "&shuffle=1")}`)
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
        {materias.length === 0 ? <p style={{ color: "var(--ink-60)", margin: 0, fontSize: 13.5 }}>Ainda não há questões cadastradas.</p> : (
          <PainelFiltros materias={materias} filtros={filtros} />
        )}
        <button onClick={iniciar} disabled={!filtros.total}
          style={{ marginTop: 16, width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, fontSize: 15,
            cursor: filtros.total ? "pointer" : "default", opacity: filtros.total ? 1 : 0.5 }}>
          Resolver questões
        </button>
      </div>
    )
  }

  if (i >= qs.length) {
    return (
      <div style={{ ...card, textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)" }}>Concluído!</h2>
        <p style={{ fontSize: 18, marginTop: 8 }}>Acertos: <strong>{acertos}/{feitas}</strong></p>
        <button onClick={() => { setQs(null); filtros.recontar() }} style={{ marginTop: 14, padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
          Voltar aos filtros
        </button>
      </div>
    )
  }

  const q = qs[i]
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", fontSize: 13, color: "var(--ink-60)", marginBottom: 8 }}>
        <span>{q.materia}{q.modulo ? ` · ${moduloLabelCurto(q.materia, q.modulo)}` : ""}</span>
        <span>
          Questão {i + 1} de {qs.length} · acertos {acertos}/{feitas}
          <button onClick={() => { setQs(null); filtros.recontar() }} style={{ marginLeft: 10, border: "none", background: "none", padding: 0, color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Filtros</button>
        </span>
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
  const filtros = useFiltros(materias, {}, "&objetivas=1")
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
    if (!filtros.total) return   // 0 = nada a resolver; -1 (contagem falhou) segue
    const res = await fetch(`/api/questoes?${buildQuery(filtros.f, `&objetivas=1&shuffle=1&limit=${Number(qtd) || 10}`)}`)
    const data: Questao[] = await res.json()
    setQs(data); setI(0); setRespostas({}); setResultado(null); setRestante((Number(min) || 15) * 60)
  }

  if (!qs) {
    return (
      <div style={card}>
        <PainelFiltros materias={materias} filtros={filtros} comTipo={false} />
        <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 10 }}>O simulado usa apenas questões objetivas (Certo/Errado e Múltipla escolha).</p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Nº de questões
            <input style={{ ...inputStyle, marginTop: 6 }} value={qtd} onChange={e => setQtd(e.target.value)} inputMode="numeric" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Tempo (min)
            <input style={{ ...inputStyle, marginTop: 6 }} value={min} onChange={e => setMin(e.target.value)} inputMode="numeric" />
          </label>
        </div>
        <button onClick={iniciar} disabled={!filtros.total} style={{ marginTop: 14, width: "100%", padding: "12px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, fontSize: 15, cursor: filtros.total ? "pointer" : "default", opacity: filtros.total ? 1 : 0.5 }}>
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
        <button onClick={() => { setQs(null); filtros.recontar() }} style={{ marginTop: 14, padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
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
    const escopo = limparMod === "__all__" ? "TODAS as questões" : `as questões do ${moduloLabel(limparMat, limparMod)}`
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
              {mLimpar?.modulos.map(md => <option key={md} value={md}>{moduloLabel(limparMat, md)}</option>)}
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
