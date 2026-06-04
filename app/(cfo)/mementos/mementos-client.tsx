"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown"

type MementoMeta = { id: string; materia: string; modulo: string; titulo: string; nome: string }
type CurrentUser = { matricula: number; nomeGuerra: string }
type GaivotaMsg = { id: string; matricula: number; nomeGuerra: string; texto: string; createdAt: string }
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

export function MementosClient({ mementos, flashMaterias, conteudoMaterias, disciplinas, isAdmin, currentUser, pdfMaterias }: {
  mementos: MementoMeta[]; flashMaterias: Mat[]; conteudoMaterias: ContMat[]; disciplinas: Disc[]; isAdmin: boolean; currentUser: CurrentUser; pdfMaterias: { sigla: string; nome: string }[]
}) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>("mementos")
  const abas: [Aba, string][] = [["mementos", "Mementos"]]
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

      {aba === "mementos" && <Mementos mementos={mementos} isAdmin={isAdmin} currentUser={currentUser} pdfMaterias={pdfMaterias} disciplinas={disciplinas} flashMaterias={flashMaterias} />}
      {aba === "admin" && isAdmin && <Admin disciplinas={disciplinas} conteudoMaterias={conteudoMaterias} onImport={() => router.refresh()} />}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}

// Nota de honra ao autor dos mementos
function NotaMaciel() {
  return (
    <div className="memento-honra" style={{
      borderRadius: 16, padding: "18px 20px", marginBottom: 24,
      background: "linear-gradient(135deg, #1f3b1f 0%, #2e4a2e 100%)", color: "#f4ecd8",
      border: "1px solid var(--gold)", boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>🦅</span>
        <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.15rem", color: "var(--gold)" }}>
          Reconhecimento &amp; Gratidão
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
        Estes mementos só existem graças ao <strong>MACIEL</strong> — o <em>“Pernambuco Imortal”</em>,{" "}
        <strong>1º colocado geral da 2ª Turma do CFO 2025</strong>. Quase todos os resumos aqui reunidos
        nasceram do seu estudo, da sua dedicação e da sua generosidade em compartilhar. Que cada página
        consultada honre esse legado. <strong>Muito obrigado, Pernambuco Imortal.</strong>
      </p>
    </div>
  )
}

// ── Gaivotas (chat colaborativo por matéria) ──
function Gaivotas({ materia, isAdmin, currentUser }: { materia: string; isAdmin: boolean; currentUser: CurrentUser }) {
  const [msgs, setMsgs] = useState<GaivotaMsg[] | null>(null)
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")

  async function carregar() {
    const res = await fetch(`/api/gaivotas?materia=${encodeURIComponent(materia)}`)
    if (res.ok) setMsgs(await res.json())
    else setMsgs([])
  }
  useEffect(() => { carregar() }, [materia]) // eslint-disable-line react-hooks/exhaustive-deps

  async function enviar() {
    const t = texto.trim()
    if (!t) return
    setEnviando(true); setErro("")
    const res = await fetch("/api/gaivotas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materia, texto: t }),
    })
    setEnviando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao enviar.") }
    const nova: GaivotaMsg = await res.json()
    setMsgs(m => [...(m || []), nova]); setTexto("")
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta gaivota?")) return
    const res = await fetch(`/api/gaivotas?id=${id}`, { method: "DELETE" })
    if (res.ok) setMsgs(m => (m || []).filter(x => x.id !== id))
  }

  const fmt = (s: string) => new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        🪶 Espaço colaborativo da turma — dúvidas, dicas e correções sobre <strong>{materia}</strong>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "14px 0" }}>
        {msgs === null && <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Carregando…</p>}
        {msgs?.length === 0 && <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Seja o primeiro a comentar.</p>}
        {msgs?.map(m => {
          const podeExcluir = isAdmin || m.matricula === currentUser.matricula
          return (
            <div key={m.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid rgba(58,74,58,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 13.5, color: "var(--olive)" }}>{m.nomeGuerra}</strong>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{fmt(m.createdAt)}</span>
                  {podeExcluir && (
                    <button onClick={() => excluir(m.id)} title="Excluir" style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 13, padding: 0 }}>✕</button>
                  )}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{m.texto}</p>
            </div>
          )
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={2} placeholder="Escreva uma gaivota…"
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviar() }}
          style={{ ...inputStyle, resize: "vertical", flex: 1 }} />
        <button onClick={enviar} disabled={enviando || !texto.trim()}
          style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: enviando || !texto.trim() ? "default" : "pointer", opacity: !texto.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}>
          {enviando ? "…" : "Enviar"}
        </button>
      </div>
      {erro && <p style={{ marginTop: 8, fontSize: 13, color: "var(--red)" }}>{erro}</p>}
      <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-60)" }}>Ctrl/⌘ + Enter para enviar.</p>
    </div>
  )
}

// ── Mementos (grid de matérias → memento / PDF / gaivotas) ──
type SubAba = "memento" | "pdf" | "flashcards" | "questoes" | "gaivotas"

function Mementos({ mementos, isAdmin, currentUser, pdfMaterias, disciplinas, flashMaterias }: {
  mementos: MementoMeta[]; isAdmin: boolean; currentUser: CurrentUser; pdfMaterias: { sigla: string; nome: string }[]
  disciplinas: Disc[]; flashMaterias: Mat[]
}) {
  const comPdf = new Set(pdfMaterias.map(p => p.sigla))
  const flashMap = new Map(flashMaterias.map(f => [f.sigla, f]))
  const [materiaSel, setMateriaSel] = useState<string | null>(null)
  const [subAba, setSubAba] = useState<SubAba>("memento")
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

  // leitura de um memento (markdown estilizado + imprimir)
  if (aberto) {
    return (
      <div>
        <div className="memento-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button onClick={() => setAberto(null)} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
            ← Voltar
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

  // agrupa mementos por matéria + inclui matérias que só têm PDF
  const grupos = new Map<string, { nome: string; items: MementoMeta[] }>()
  for (const m of mementos) {
    const e = grupos.get(m.materia) || { nome: m.nome, items: [] }
    e.items.push(m); grupos.set(m.materia, e)
  }
  for (const p of pdfMaterias) {
    if (!grupos.has(p.sigla)) grupos.set(p.sigla, { nome: p.nome, items: [] })
  }
  // inclui TODAS as disciplinas do curso (mesmo sem memento/PDF → "em breve")
  for (const d of disciplinas) {
    if (!grupos.has(d.sigla)) grupos.set(d.sigla, { nome: d.nome, items: [] })
  }
  const materias = [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  // ── detalhe de uma matéria (sub-abas) ──
  if (materiaSel) {
    const grupo = grupos.get(materiaSel)
    const sigla = materiaSel
    const flash = flashMap.get(sigla)
    const subAbas: [SubAba, string][] = [
      ["memento", "📄 Memento"], ["pdf", "📕 PDF Pernambuco Imortal"],
      ["flashcards", `🃏 Flashcards${flash ? ` (${flash.total})` : ""}`],
      ["questoes", "❓ Questões"], ["gaivotas", "🪶 Gaivotas"],
    ]
    return (
      <div>
        <button onClick={() => { setMateriaSel(null); setSubAba("memento") }} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
          ← Todas as matérias
        </button>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.3rem", color: "var(--olive)", margin: "10px 0 14px" }}>
          {sigla}{grupo?.nome && grupo.nome !== sigla ? ` — ${grupo.nome}` : ""}
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {subAbas.map(([t, rot]) => (
            <button key={t} onClick={() => setSubAba(t)}
              style={{ padding: "7px 13px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: subAba === t ? "var(--olive)" : "var(--surface)", color: subAba === t ? "var(--canvas)" : "var(--ink-60)" }}>
              {rot}
            </button>
          ))}
        </div>

        {subAba === "memento" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {carregando && <p style={{ color: "var(--ink-60)" }}>Carregando…</p>}
            {!grupo?.items.length && <p style={{ color: "var(--ink-60)" }}>Nenhum memento publicado para esta matéria ainda.</p>}
            {grupo?.items.map(m => (
              <button key={m.id} onClick={() => abrir(m)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.15)", background: "#fff", cursor: "pointer", fontSize: 15, color: "var(--ink)" }}>
                <strong>{m.titulo}</strong>{m.modulo ? <span style={{ color: "var(--ink-60)", fontSize: 13 }}> · Mód. {m.modulo}</span> : null}
              </button>
            ))}
          </div>
        )}

        {subAba === "pdf" && <PdfOriginal sigla={sigla} />}
        {subAba === "flashcards" && <FlashcardsMateria flash={flash} sigla={sigla} />}
        {subAba === "questoes" && <QuestoesLink sigla={sigla} />}
        {subAba === "gaivotas" && <Gaivotas materia={sigla} isAdmin={isAdmin} currentUser={currentUser} />}
      </div>
    )
  }

  // ── grade de matérias (estilo app) ──
  return (
    <div>
      <NotaMaciel />
      {materias.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhum memento publicado ainda.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {materias.map(([sigla, e]) => {
            const temPdf = comPdf.has(sigla)
            const flash = flashMap.get(sigla)
            const vazio = e.items.length === 0 && !temPdf && !flash
            const rodape = e.items.length > 0
              ? `${e.items.length} ${e.items.length === 1 ? "memento" : "mementos"}`
              : (temPdf ? "PDF Pernambuco Imortal" : (flash ? `${flash.total} flashcards` : "em breve"))
            const subInicial: SubAba = e.items.length > 0 ? "memento" : temPdf ? "pdf" : flash ? "flashcards" : "memento"
            return (
              <button key={sigla} onClick={() => { setMateriaSel(sigla); setSubAba(subInicial) }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
                  minHeight: 118, padding: "16px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                  border: "1px solid rgba(58,74,58,0.15)", background: vazio ? "var(--surface)" : "#fff",
                  boxShadow: vazio ? "none" : "0 2px 8px rgba(0,0,0,0.05)", opacity: vazio ? 0.72 : 1,
                }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, alignSelf: "stretch", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 700, fontSize: "1.35rem", color: "var(--olive)" }}>{sigla}</span>
                  <span style={{ display: "flex", gap: 3, fontSize: 11 }}>
                    {temPdf && <span title="PDF Pernambuco Imortal">📕</span>}
                    {flash && <span title="Flashcards">🃏</span>}
                  </span>
                </span>
                <span style={{ fontSize: 12.5, color: "var(--ink-60)", lineHeight: 1.35 }}>{e.nome !== sigla ? e.nome : "Memento"}</span>
                <span style={{ fontSize: 11.5, color: vazio ? "var(--ink-60)" : "var(--gold)", fontWeight: 600 }}>{rodape} ›</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Visualizador do PDF original (servido de /public/mementos/<sigla>.pdf)
function PdfOriginal({ sigla }: { sigla: string }) {
  const [erro, setErro] = useState(false)
  const src = `/mementos/${encodeURIComponent(sigla)}.pdf`
  if (erro) {
    return (
      <div style={cardBox}>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
          📕 O PDF Pernambuco Imortal de <strong>{sigla}</strong> ainda não foi adicionado.
          <br />Coloque o arquivo em <code>/public/mementos/{sigla}.pdf</code>.
        </p>
      </div>
    )
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <a href={src} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
          ↗ Abrir em nova aba
        </a>
        <a href={src} download
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
          ⬇ Baixar
        </a>
      </div>
      <object data={src} type="application/pdf" onError={() => setErro(true)}
        style={{ width: "100%", height: "70vh", borderRadius: 12, border: "1px solid rgba(58,74,58,0.15)" }}>
        <iframe src={src} title={`PDF ${sigla}`} style={{ width: "100%", height: "70vh", border: "none", borderRadius: 12 }} />
      </object>
    </div>
  )
}

// Flashcards de UMA matéria (dentro do card)
function FlashcardsMateria({ flash, sigla }: { flash: Mat | undefined; sigla: string }) {
  const [modulo, setModulo] = useState("__all__")
  const [cards, setCards] = useState<Card[] | null>(null)
  const [i, setI] = useState(0)
  const [virado, setVirado] = useState(false)

  if (!flash) {
    return (
      <div style={cardBox}>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
          🃏 Ainda não há flashcards de <strong>{sigla}</strong>. <em>Em breve.</em>
        </p>
      </div>
    )
  }

  async function iniciar() {
    let url = `/api/flashcards?materia=${encodeURIComponent(sigla)}`
    if (modulo !== "__all__") url += `&modulo=${encodeURIComponent(modulo)}`
    const res = await fetch(url)
    const data: Card[] = await res.json()
    setCards(data.sort(() => Math.random() - 0.5)); setI(0); setVirado(false)
  }

  if (!cards) {
    return (
      <div style={cardBox}>
        <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--ink-60)" }}>{flash.total} flashcards de {sigla}.</p>
        {flash.modulos.length > 1 && (
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Módulo
            <select style={{ ...inputStyle, marginTop: 6 }} value={modulo} onChange={e => setModulo(e.target.value)}>
              <option value="__all__">Todos os módulos</option>
              {flash.modulos.map(md => <option key={md} value={md}>{moduloLabel(md)}</option>)}
            </select>
          </label>
        )}
        <button onClick={iniciar} style={{ padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
          Estudar
        </button>
      </div>
    )
  }
  if (cards.length === 0) {
    return <div><p style={{ color: "var(--ink-60)" }}>Sem cards nesse filtro.</p><button onClick={() => setCards(null)} style={{ marginTop: 10, padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>Voltar</button></div>
  }

  const c = cards[i]
  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--ink-60)", marginBottom: 10 }}>Card {i + 1} de {cards.length}{c.modulo ? ` · Mód. ${c.modulo}` : ""}</div>
      <button onClick={() => setVirado(v => !v)}
        style={{ width: "100%", minHeight: 200, padding: "24px 20px", borderRadius: 16, border: `2px solid ${virado ? "var(--gold)" : "var(--olive)"}`,
          background: virado ? "#fbf3e3" : "var(--olive)", color: virado ? "var(--ink)" : "var(--canvas)", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10 }}>
        <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8 }}>{virado ? "Verso" : "Frente"}</span>
        <span style={{ fontSize: virado ? 15 : 19, fontWeight: virado ? 400 : 600, lineHeight: 1.55, fontFamily: virado ? "inherit" : "var(--serif-cfo)", whiteSpace: virado ? "pre-wrap" : "normal", textAlign: virado ? "left" : "center", width: virado ? "100%" : "auto" }}>
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

// Link para as questões da matéria
function QuestoesLink({ sigla }: { sigla: string }) {
  return (
    <div style={cardBox}>
      <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
        ❓ Resolva questões de <strong>{sigla}</strong> no banco de questões da turma.
      </p>
      <Link href={`/questoes?materia=${encodeURIComponent(sigla)}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
        Ir para Questões de {sigla} →
      </Link>
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
