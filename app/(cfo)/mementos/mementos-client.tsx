"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown"

type MementoMeta = { id: string; materia: string; modulo: string; titulo: string; nome: string }
type Mat = { sigla: string; nome: string; total: number; modulos: string[] }
type Disc = { sigla: string; nome: string }
type Card = { id: string; frente: string; verso: string; modulo: string }
type ContMat = { sigla: string; nome: string; modulos: string[] }
type Aba = "mementos" | "flashcards" | "admin"

const moduloLabel = (m: string) => (m === "" ? "Sem módulo" : `Módulo ${m}`)

const cardBox: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

export function MementosClient({ mementos, flashMaterias, conteudoMaterias, disciplinas, isAdmin }: {
  mementos: MementoMeta[]; flashMaterias: Mat[]; conteudoMaterias: ContMat[]; disciplinas: Disc[]; isAdmin: boolean
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
      {aba === "admin" && isAdmin && <Admin disciplinas={disciplinas} conteudoMaterias={conteudoMaterias} onImport={() => router.refresh()} />}

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
        <div className="memento-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button onClick={() => setAberto(null)} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
            ← Lista de mementos
          </button>
          <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            🖨 Imprimir
          </button>
        </div>
        <div className="memento-md memento-print" style={{ marginTop: 16 }}>
          <h1 className="memento-print-titulo" style={{ display: "none" }}>{aberto.titulo}</h1>
          <div dangerouslySetInnerHTML={{ __html: aberto.html }} />
        </div>
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
  const [modulo, setModulo] = useState("__all__")
  const [cards, setCards] = useState<Card[] | null>(null)
  const [i, setI] = useState(0)
  const [virado, setVirado] = useState(false)
  const [seg, setSeg] = useState(0)

  const mAtual = materias.find(m => m.sigla === materia)

  useEffect(() => {
    if (!cards) return
    const t = setInterval(() => setSeg(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [cards])

  async function iniciar() {
    if (!materia) return
    let url = `/api/flashcards?materia=${encodeURIComponent(materia)}`
    if (modulo !== "__all__") url += `&modulo=${encodeURIComponent(modulo)}`
    const res = await fetch(url)
    const data: Card[] = await res.json()
    setCards(data.sort(() => Math.random() - 0.5)); setI(0); setVirado(false); setSeg(0)
  }

  // ── Imprimir cards: 1 quadrado por módulo, 4 módulos por folha A4 (2×2) ──
  async function imprimirCards() {
    if (!materia) return
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    let url = `/api/flashcards?materia=${encodeURIComponent(materia)}`
    if (modulo !== "__all__") url += `&modulo=${encodeURIComponent(modulo)}`
    const res = await fetch(url)
    const data: Card[] = await res.json()
    if (!data.length) { alert("Sem cards para imprimir."); return }

    // agrupa por módulo (ordem numérica), preservando a ordem dos cards
    const porMod = new Map<string, Card[]>()
    for (const c of data) { const k = c.modulo || ""; if (!porMod.has(k)) porMod.set(k, []); porMod.get(k)!.push(c) }
    const mods = [...porMod.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    const nome = mAtual?.nome || materia

    // 1 quadrado por módulo; 4 por folha (2×2)
    const quadrados = mods.map(m => {
      const cards = porMod.get(m)!
      const linhas = cards.map(c =>
        `<div class="fc-item"><div class="fc-frente">${esc(c.frente)}</div><div class="fc-verso">${esc(c.verso)}</div></div>`
      ).join("")
      return `<div class="fc-quad">
        <div class="fc-head">${materia} · ${m ? "Módulo " + esc(m) : "Geral"}</div>
        <div class="fc-body">${linhas}</div>
      </div>`
    })
    // completa a última folha com quadrados vazios para manter a grade 2×2
    while (quadrados.length % 4 !== 0) quadrados.push(`<div class="fc-quad fc-empty"></div>`)
    const paginas: string[] = []
    for (let k = 0; k < quadrados.length; k += 4) paginas.push(`<div class="fc-page">${quadrados.slice(k, k + 4).join("")}</div>`)

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <title>Cards — ${esc(nome)}</title>
      <style>
        @page { size: A4 portrait; margin: 6mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #14241c; }
        .fc-page { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
          gap: 4mm; width: 198mm; height: 285mm; page-break-after: always; }
        .fc-page:last-child { page-break-after: auto; }
        .fc-quad { border: 1px dashed #9aa; border-radius: 6px; padding: 6mm; overflow: hidden;
          display: flex; flex-direction: column; }
        .fc-empty { border-color: transparent; }
        .fc-head { font-weight: 800; font-size: 12px; color: #3a5a3a; text-transform: uppercase;
          letter-spacing: .04em; border-bottom: 1.5px solid #3a5a3a; padding-bottom: 3px; margin-bottom: 6px; }
        .fc-body { overflow: hidden; }
        .fc-item { margin-bottom: 7px; }
        .fc-frente { font-weight: 700; font-size: 10.5px; line-height: 1.25; color: #14241c; }
        .fc-verso { font-size: 9.5px; line-height: 1.3; color: #2c3a2c; white-space: pre-wrap; margin-top: 1px; }
      </style></head>
      <body>${paginas.join("")}
        <script>window.onload=function(){window.print()}<\/script>
      </body></html>`

    const w = window.open("", "_blank")
    if (!w) { alert("Permita pop-ups para imprimir os cards."); return }
    w.document.open(); w.document.write(html); w.document.close()
  }

  if (!cards) {
    return (
      <div style={cardBox}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Escolha a matéria
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
        {materias.length === 0 && <p style={{ color: "var(--ink-60)", marginTop: 10, fontSize: 13.5 }}>Ainda não há flashcards cadastrados.</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button onClick={iniciar} disabled={!materia} style={{ padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: materia ? "pointer" : "default" }}>
            Estudar
          </button>
          <button onClick={imprimirCards} disabled={!materia} style={{ padding: "11px 16px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, cursor: materia ? "pointer" : "default", opacity: materia ? 1 : 0.5 }}>
            🖨️ Imprimir cards
          </button>
        </div>
        {materia && <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 8 }}>Impressão: 1 quadrado por módulo, 4 por folha A4 — recorte e leve no bolso.</p>}
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
        <span style={{
          fontSize: virado ? 15 : 19, fontWeight: virado ? 400 : 600, lineHeight: 1.55,
          fontFamily: virado ? "inherit" : "var(--serif-cfo)",
          whiteSpace: virado ? "pre-wrap" : "normal", textAlign: virado ? "left" : "center",
          width: virado ? "100%" : "auto",
        }}>
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
function Admin({ disciplinas, conteudoMaterias, onImport }: { disciplinas: Disc[]; conteudoMaterias: ContMat[]; onImport: () => void }) {
  const [json, setJson] = useState("")
  const [msg, setMsg] = useState("")
  const [enviando, setEnviando] = useState(false)
  // limpar
  const [limparMat, setLimparMat] = useState("")
  const [limparMod, setLimparMod] = useState("__all__")
  const [limpando, setLimpando] = useState(false)
  const [limparMsg, setLimparMsg] = useState("")
  const mLimpar = conteudoMaterias.find(m => m.sigla === limparMat)

  async function limpar() {
    if (!limparMat) return
    const escopo = limparMod === "__all__" ? "TODO o conteúdo (mementos e cards)" : `o conteúdo do ${moduloLabel(limparMod)}`
    if (!confirm(`Excluir ${escopo} de ${limparMat}? Ação irreversível.`)) return
    setLimpando(true); setLimparMsg("")
    let url = `/api/mementos/import?materia=${encodeURIComponent(limparMat)}`
    if (limparMod !== "__all__") url += `&modulo=${encodeURIComponent(limparMod)}`
    const res = await fetch(url, { method: "DELETE" })
    const j = await res.json()
    setLimpando(false)
    if (!res.ok) return setLimparMsg("✗ " + (j.error || "Erro"))
    setLimparMsg(`✓ ${j.mementos} mementos e ${j.flashcards} cards removidos.`)
    setLimparMat(""); setLimparMod("__all__"); onImport()
  }

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

      {/* Limpar matéria */}
      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--red)", marginTop: 32, marginBottom: 8 }}>Limpar matéria</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        Remove os mementos e flashcards de uma matéria (ou de um módulo específico) — útil para recadastrar do zero. Ação irreversível.
      </p>
      {conteudoMaterias.length === 0 ? <p style={{ color: "var(--ink-60)", fontSize: 13.5 }}>Nenhuma matéria com conteúdo.</p> : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 180px" }}>Matéria
            <select style={{ ...inputStyle, marginTop: 6 }} value={limparMat} onChange={e => { setLimparMat(e.target.value); setLimparMod("__all__") }}>
              <option value="">— selecione —</option>
              {conteudoMaterias.map(m => <option key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome}</option>)}
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
