"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown"

type MementoMeta = { id: string; materia: string; modulo: string; titulo: string; nome: string }
type Mat = { sigla: string; nome: string; total: number }
type Disc = { sigla: string; nome: string }
type Card = { id: string; frente: string; verso: string; modulo: string }
type Aba = "mementos" | "flashcards" | "admin"

const cardBox: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

export function MementosClient({ mementos, flashMaterias, disciplinas, isAdmin }: {
  mementos: MementoMeta[]; flashMaterias: Mat[]; disciplinas: Disc[]; isAdmin: boolean
}) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>("mementos")
  const abas: [Aba, string][] = [["mementos", "Mementos"], ["flashcards", "Flashcards"]]
  if (isAdmin) abas.push(["admin", "Admin"])

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 16 }}>
        Mementos & Cards
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

      {aba === "mementos" && <Mementos mementos={mementos} />}
      {aba === "flashcards" && <Flashcards materias={flashMaterias} />}
      {aba === "admin" && isAdmin && <Admin disciplinas={disciplinas} onImport={() => router.refresh()} />}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}

// ── Mementos (lista → leitura Markdown) ──
function Mementos({ mementos }: { mementos: MementoMeta[] }) {
  const [aberto, setAberto] = useState<{ titulo: string; html: string } | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function abrir(m: MementoMeta) {
    setCarregando(true)
    const res = await fetch(`/api/mementos?id=${m.id}`)
    const data = await res.json()
    setAberto({ titulo: m.titulo, html: renderMarkdown(data.conteudoMd || "") })
    setCarregando(false)
    window.scrollTo(0, 0)
  }

  if (aberto) {
    return (
      <div>
        <button onClick={() => setAberto(null)} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
          ← Lista de mementos
        </button>
        <div className="memento-md" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: aberto.html }} />
      </div>
    )
  }

  if (mementos.length === 0) return <p style={{ color: "var(--ink-60)" }}>Nenhum memento publicado ainda.</p>

  // agrupa por matéria
  const grupos = new Map<string, MementoMeta[]>()
  for (const m of mementos) { const k = `${m.materia} — ${m.nome}`; (grupos.get(k) || grupos.set(k, []).get(k)!).push(m) }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {carregando && <p style={{ color: "var(--ink-60)" }}>Carregando…</p>}
      {[...grupos.entries()].map(([titulo, items]) => (
        <div key={titulo}>
          <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.1rem", color: "var(--olive)", margin: "0 0 8px" }}>{titulo}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(m => (
              <button key={m.id} onClick={() => abrir(m)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.15)", background: "#fff", cursor: "pointer", fontSize: 15, color: "var(--ink)" }}>
                <strong>{m.titulo}</strong>{m.modulo ? <span style={{ color: "var(--ink-60)", fontSize: 13 }}> · Mód. {m.modulo}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Flashcards (estudo com cronômetro) ──
function Flashcards({ materias }: { materias: Mat[] }) {
  const [materia, setMateria] = useState("")
  const [cards, setCards] = useState<Card[] | null>(null)
  const [i, setI] = useState(0)
  const [virado, setVirado] = useState(false)
  const [seg, setSeg] = useState(0)

  useEffect(() => {
    if (!cards) return
    const t = setInterval(() => setSeg(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [cards])

  async function iniciar() {
    if (!materia) return
    const res = await fetch(`/api/flashcards?materia=${materia}`)
    const data: Card[] = await res.json()
    setCards(data.sort(() => Math.random() - 0.5)); setI(0); setVirado(false); setSeg(0)
  }

  if (!cards) {
    return (
      <div style={cardBox}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Escolha a matéria
          <select style={{ ...inputStyle, marginTop: 6 }} value={materia} onChange={e => setMateria(e.target.value)}>
            <option value="">— selecione —</option>
            {materias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome} ({m.total})</option>)}
          </select>
        </label>
        {materias.length === 0 && <p style={{ color: "var(--ink-60)", marginTop: 10, fontSize: 13.5 }}>Ainda não há flashcards cadastrados.</p>}
        <button onClick={iniciar} disabled={!materia} style={{ marginTop: 14, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: materia ? "pointer" : "default" }}>
          Estudar
        </button>
      </div>
    )
  }

  if (cards.length === 0) {
    return <div><p style={{ color: "var(--ink-60)" }}>Sem cards nessa matéria.</p><button onClick={() => setCards(null)} style={{ marginTop: 10, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Voltar</button></div>
  }

  const c = cards[i]
  const mm = String(Math.floor(seg / 60)).padStart(2, "0")
  const ss = String(seg % 60).padStart(2, "0")
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-60)", marginBottom: 10 }}>
        <span>Card {i + 1} de {cards.length}{c.modulo ? ` · Mód. ${c.modulo}` : ""}</span>
        <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, color: "var(--olive)" }}>⏱ {mm}:{ss}</span>
      </div>
      <button onClick={() => setVirado(v => !v)}
        style={{ width: "100%", minHeight: 220, padding: "24px 20px", borderRadius: 16, border: `2px solid ${virado ? "var(--gold)" : "var(--olive)"}`,
          background: virado ? "#fbf3e3" : "var(--olive)", color: virado ? "var(--ink)" : "var(--canvas)", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10 }}>
        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8 }}>{virado ? "Verso" : "Frente"}</span>
        <span style={{ fontSize: virado ? 16 : 19, fontWeight: virado ? 400 : 600, lineHeight: 1.5, fontFamily: virado ? "inherit" : "var(--serif-cfo)" }}>
          {virado ? c.verso : c.frente}
        </span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>toque para virar</span>
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <button onClick={() => { setI(x => Math.max(0, x - 1)); setVirado(false) }} disabled={i === 0}
          style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.5 : 1 }}>Anterior</button>
        {i + 1 < cards.length ? (
          <button onClick={() => { setI(x => x + 1); setVirado(false) }} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Próximo</button>
        ) : (
          <button onClick={() => setCards(null)} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Concluir</button>
        )}
      </div>
    </div>
  )
}

// ── Admin: importar memento + flashcards ──
function Admin({ disciplinas, onImport }: { disciplinas: Disc[]; onImport: () => void }) {
  const [json, setJson] = useState("")
  const [msg, setMsg] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function importar() {
    setEnviando(true); setMsg("")
    let body: any
    try { body = JSON.parse(json) } catch { setEnviando(false); return setMsg("✗ JSON inválido.") }
    const res = await fetch("/api/mementos/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const j = await res.json()
    setEnviando(false)
    if (!res.ok) return setMsg("✗ " + (j.error || "Erro"))
    setMsg(`✓ ${j.materia}${j.modulo ? "/" + j.modulo : ""}: ${j.mementoMsg || "sem memento"}; cards ${j.criadosCards} criados, ${j.atualizadosCards} atualizados.${j.erros?.length ? " Avisos: " + j.erros.join("; ") : ""}`)
    setJson(""); onImport()
  }

  return (
    <div>
      <p style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.5 }}>
        Cole o <strong>pacote JSON</strong> (memento em Markdown + flashcards). A matéria deve existir entre as {disciplinas.length} disciplinas.
      </p>
      <pre style={{ ...cardBox, fontSize: 12, overflowX: "auto", color: "var(--ink-60)" }}>{`{
  "materia": "LPMO", "modulo": "1",
  "memento": { "titulo": "Lei 14.751/23 — Fundamentos",
    "conteudoMd": "# Capítulo 1\\n\\nTexto **em negrito**...\\n\\n| A | B |\\n|---|---|\\n| x | y |\\n\\n> ⚠ Pegadinha de prova\\n> 🔑 palavra-chave" },
  "flashcards": [
    { "frente": "Base constitucional da Lei 14.751/23?", "verso": "Art. 22, XXI da CF/88 — competência privativa da União." }
  ]
}`}</pre>
      <textarea value={json} onChange={e => setJson(e.target.value)} rows={10} placeholder="Cole o JSON aqui…"
        style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, marginTop: 8 }} />
      <button onClick={importar} disabled={enviando || !json.trim()} style={{ marginTop: 10, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: enviando ? "default" : "pointer" }}>
        {enviando ? "Importando…" : "Importar"}
      </button>
      {msg && <p style={{ marginTop: 10, fontSize: 13.5, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)", lineHeight: 1.5 }}>{msg}</p>}
    </div>
  )
}
