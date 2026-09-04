"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { renderMarkdown } from "@/lib/markdown"
import { MEMENTO_PROPRIO } from "@/lib/mementos-pdfs"
import { CALENDARIO_PROVAS, CALENDARIO_FONTE, dmy, periodo, provasPorMateria, situacao } from "@/lib/calendario-provas"
import { DRIVE_MEMENTOS_URL, MIDIA_INFO, embedDe, ehLocal, extensaoDe, type TipoMidia } from "@/lib/midia-embed"

type MementoMeta = { id: string; materia: string; modulo: string; titulo: string; nome: string }
type CurrentUser = { matricula: number; nomeGuerra: string }
type PdfPart = { file: string; label: string }
type PdfMateria = { sigla: string; nome: string; parts: PdfPart[] }
type ApostilaMateria = { sigla: string; parts: PdfPart[] }
type GaivotaMsg = { id: string; matricula: number; nomeGuerra: string; texto: string; createdAt: string }
type Disc = { sigla: string; nome: string; status: string }
type Midia = { id: string; materia: string; tipo: string; titulo: string; url: string; ordem: number }
type ContMat = { sigla: string; nome: string; modulos: string[] }
type Aba = "mementos" | "admin"

const moduloLabel = (m: string) => (m === "" ? "Sem módulo" : `Módulo ${m}`)

const cardBox: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

export function MementosClient({ mementos, conteudoMaterias, disciplinas, isAdmin, currentUser, pdfMaterias, apostilaMaterias, midias, hojeISO }: {
  mementos: MementoMeta[]; conteudoMaterias: ContMat[]; disciplinas: Disc[]; isAdmin: boolean; currentUser: CurrentUser; pdfMaterias: PdfMateria[]; apostilaMaterias: ApostilaMateria[]
  midias: Midia[]; hojeISO: string
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

      {aba === "mementos" && <Mementos mementos={mementos} isAdmin={isAdmin} currentUser={currentUser} pdfMaterias={pdfMaterias} disciplinas={disciplinas} apostilaMaterias={apostilaMaterias} midias={midias} hojeISO={hojeISO} />}
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

// ── Mementos (grid de matérias → abas fixas por matéria) ──
// Ordem padronizada em TODAS as matérias; o que não existir mostra "em breve".
type SubAba = "memento" | "apostila" | "video" | "audio" | "mapa" | "questoes" | "tutor" | "gaivotas"

function Mementos({ mementos, isAdmin, currentUser, pdfMaterias, disciplinas, apostilaMaterias, midias: midiasIniciais, hojeISO }: {
  mementos: MementoMeta[]; isAdmin: boolean; currentUser: CurrentUser; pdfMaterias: PdfMateria[]
  disciplinas: Disc[]; apostilaMaterias: ApostilaMateria[]; midias: Midia[]; hojeISO: string
}) {
  const comPdf = new Set(pdfMaterias.map(p => p.sigla))
  const pdfPartsMap = new Map(pdfMaterias.map(p => [p.sigla, p.parts]))
  const apostilaPartsMap = new Map(apostilaMaterias.map(a => [a.sigla, a.parts]))
  const comApostila = new Set(apostilaMaterias.map(a => a.sigla))
  const statusMap = new Map(disciplinas.map(d => [d.sigla, d.status]))
  const provas = provasPorMateria(hojeISO)
  const [midias, setMidias] = useState<Midia[]>(midiasIniciais)
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

  function abrirMateria(sigla: string, sub: SubAba = "memento") {
    setMateriaSel(sigla); setSubAba(sub); window.scrollTo({ top: 0, behavior: "smooth" })
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
  for (const a of apostilaMaterias) {
    if (!grupos.has(a.sigla)) grupos.set(a.sigla, { nome: a.sigla, items: [] })
  }
  // inclui TODAS as disciplinas do curso (mesmo sem memento/PDF → "em breve")
  for (const d of disciplinas) {
    if (!grupos.has(d.sigla)) grupos.set(d.sigla, { nome: d.nome, items: [] })
  }
  const materias = [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const nomes = new Map(materias.map(([sigla, e]) => [sigla, e.nome]))

  const midiasDe = (sigla: string, tipo: TipoMidia) => midias.filter(m => m.materia === sigla && m.tipo === tipo)

  // ── detalhe de uma matéria (abas fixas) ──
  if (materiaSel) {
    const grupo = grupos.get(materiaSel)
    const sigla = materiaSel
    const parts = pdfPartsMap.get(sigla) ?? []
    const temPdf = parts.length > 0
    const temApostila = comApostila.has(sigla)
    const temMemento = temPdf || (grupo?.items.length ?? 0) > 0
    const mementoLabel = MEMENTO_PROPRIO.has(sigla) ? "PDF Memento" : temMemento ? "PDF Pernambuco Imortal" : "Memento"
    const prova = provas.get(sigla)
    const status = statusMap.get(sigla)
    const concluida = status === "Concluída" && !prova
    // [aba, rótulo, tem conteúdo?] — abas sem conteúdo ficam esmaecidas
    const subAbas: [SubAba, string, boolean][] = [
      ["memento", mementoLabel, temMemento],
      ["apostila", "Apostila", temApostila],
      ["video", "🎬 Memento em vídeo", midiasDe(sigla, "video").length > 0],
      ["audio", "🎧 Memento em áudio", midiasDe(sigla, "audio").length > 0],
      ["mapa", "🧠 Mapa mental", midiasDe(sigla, "mapa").length > 0],
      ["questoes", "Questões", true],
      ["tutor", "✦ Tutor IA", true],
      ["gaivotas", "🪶 Gaivotas", true],
    ]
    return (
      <div>
        <button onClick={() => { setMateriaSel(null); setSubAba("memento") }} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
          ← Todas as matérias
        </button>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.3rem", color: "var(--olive)", margin: "10px 0 10px" }}>
          {sigla}{grupo?.nome && grupo.nome !== sigla ? ` — ${grupo.nome}` : ""}
        </h2>
        {prova && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, marginBottom: 14, fontSize: 13, fontWeight: 600,
            background: situacao(prova.semana, hojeISO) === "passada" ? "var(--surface)" : "rgba(181,147,63,0.16)",
            color: situacao(prova.semana, hojeISO) === "passada" ? "var(--ink-60)" : "var(--olive)", border: "1px solid rgba(181,147,63,0.45)" }}>
            📝 {situacao(prova.semana, hojeISO) === "passada" ? "Prova realizada" : situacao(prova.semana, hojeISO) === "atual" ? "Prova ESTA semana" : "Prova prevista"}
            {prova.prova.rotulo ? ` (${prova.prova.rotulo})` : ""} · semana {prova.semana.semana} · {periodo(prova.semana)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {subAbas.map(([t, rot, tem]) => (
            <button key={t} onClick={() => setSubAba(t)} title={tem ? undefined : "Em breve"}
              style={{ padding: "7px 13px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: subAba === t ? "var(--olive)" : "var(--surface)", color: subAba === t ? "var(--canvas)" : "var(--ink-60)",
                opacity: tem || subAba === t ? 1 : 0.55 }}>
              {rot}
            </button>
          ))}
        </div>

        {subAba === "memento" && (
          temPdf ? <PdfOriginal sigla={sigla} parts={parts} /> : (
            grupo?.items.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {carregando && <p style={{ color: "var(--ink-60)" }}>Carregando…</p>}
                {grupo.items.map(m => (
                  <button key={m.id} onClick={() => abrir(m)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.15)", background: "#fff", cursor: "pointer", fontSize: 15, color: "var(--ink)" }}>
                    <strong>{m.titulo}</strong>{m.modulo ? <span style={{ color: "var(--ink-60)", fontSize: 13 }}> · Mód. {m.modulo}</span> : null}
                  </button>
                ))}
              </div>
            ) : <EmBreve texto={<>Memento de <strong>{sigla}</strong> <em>em breve</em>.</>} concluida={concluida} />
          )
        )}

        {subAba === "apostila" && (
          temApostila
            ? <PdfOriginal sigla={sigla} parts={apostilaPartsMap.get(sigla) ?? []} base="apostilas" labelVazio="apostila" />
            : <EmBreve texto={<>Apostila de <strong>{sigla}</strong> <em>em breve</em>.</>} concluida={concluida} />
        )}
        {(subAba === "video" || subAba === "audio" || subAba === "mapa") && (
          <MidiaTab key={`${sigla}-${subAba}`} sigla={sigla} tipo={subAba} itens={midiasDe(sigla, subAba)} isAdmin={isAdmin} concluida={concluida}
            onAdd={m => setMidias(l => [...l, m])} onRemove={id => setMidias(l => l.filter(x => x.id !== id))} />
        )}
        {subAba === "questoes" && <QuestoesLink sigla={sigla} />}
        {subAba === "tutor" && <TutorIA materia={sigla} />}
        {subAba === "gaivotas" && <Gaivotas materia={sigla} isAdmin={isAdmin} currentUser={currentUser} />}
      </div>
    )
  }

  // ── grade de matérias (estilo app) ──
  return (
    <div>
      <NotaMaciel />
      <CalendarioProvas hojeISO={hojeISO} nomes={nomes} onAbrir={sigla => abrirMateria(sigla)} />
      {materias.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhum memento publicado ainda.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {materias.map(([sigla, e]) => {
            const temPdf = comPdf.has(sigla)
            const temApostila = comApostila.has(sigla)
            const temMidia = midias.some(m => m.materia === sigla)
            const vazio = e.items.length === 0 && !temPdf && !temApostila && !temMidia
            const rodape = MEMENTO_PROPRIO.has(sigla) ? "PDF Memento"
              : temPdf ? "PDF Pernambuco Imortal"
              : e.items.length > 0 ? "PDF Pernambuco Imortal"
              : temApostila ? "Apostila"
              : temMidia ? "Vídeo / áudio"
              : "em breve"
            const subInicial: SubAba = (e.items.length > 0 || temPdf) ? "memento" : temApostila ? "apostila"
              : (midias.find(m => m.materia === sigla)?.tipo as SubAba | undefined) ?? "memento"
            const prova = provas.get(sigla)
            const sit = prova ? situacao(prova.semana, hojeISO) : null
            return (
              <button key={sigla} onClick={() => abrirMateria(sigla, subInicial)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
                  minHeight: 118, padding: "16px 14px", borderRadius: 16, cursor: "pointer", textAlign: "left", position: "relative",
                  border: sit === "atual" ? "1.5px solid var(--gold)" : "1px solid rgba(58,74,58,0.15)", background: vazio ? "var(--surface)" : "#fff",
                  boxShadow: vazio ? "none" : "0 2px 8px rgba(0,0,0,0.05)", opacity: vazio ? 0.72 : 1,
                }}>
                {prova && sit !== "passada" && (
                  <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                    background: sit === "atual" ? "var(--gold)" : "rgba(181,147,63,0.18)", color: sit === "atual" ? "#fff" : "var(--olive)" }}>
                    📝 {sit === "atual" ? "PROVA" : periodo(prova.semana).replace(" a ", "–")}
                  </span>
                )}
                <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 700, fontSize: "1.35rem", color: "var(--olive)" }}>{sigla}</span>
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

// Mensagem padrão de conteúdo ainda não publicado (com atalho para a pasta do Drive)
function EmBreve({ texto, concluida, drive }: { texto: React.ReactNode; concluida?: boolean; drive?: boolean }) {
  return (
    <div style={cardBox}>
      <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-60)", lineHeight: 1.6 }}>{texto}</p>
      {concluida && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-60)" }}>Matéria concluída — o material será publicado conforme o calendário de estudos.</p>}
      {drive && (
        <a href={DRIVE_MEMENTOS_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 13.5, fontWeight: 600, color: "var(--olive)", textDecoration: "none" }}>
          📁 Ver pasta de mementos no Drive ↗
        </a>
      )}
    </div>
  )
}

// ── Calendário de provas (semanas 34–39) ──
function CalendarioProvas({ hojeISO, nomes, onAbrir }: { hojeISO: string; nomes: Map<string, string>; onAbrir: (sigla: string) => void }) {
  const [aberto, setAberto] = useState(true)
  const proximas = CALENDARIO_PROVAS.filter(s => situacao(s, hojeISO) !== "passada")
  const semanaAtual = CALENDARIO_PROVAS.find(s => situacao(s, hojeISO) === "atual")
  const resumo = semanaAtual?.provas.length
    ? `Esta semana: ${semanaAtual.provas.map(p => p.sigla).join(" e ")}`
    : proximas.find(s => s.provas.length) ? `Próxima: ${proximas.find(s => s.provas.length)!.provas.map(p => p.sigla).join(" e ")} · ${periodo(proximas.find(s => s.provas.length)!)}` : "Calendário encerrado"

  return (
    <section style={{ marginBottom: 24, borderRadius: 16, border: "1px solid rgba(181,147,63,0.45)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <button onClick={() => setAberto(a => !a)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 20 }}>📝</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.1rem", color: "var(--olive)" }}>Calendário de Provas</span>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-60)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resumo}</span>
          </span>
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-60)", transform: aberto ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
      </button>
      {aberto && (
        <div style={{ padding: "0 18px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CALENDARIO_PROVAS.map(s => {
              const sit = situacao(s, hojeISO)
              return (
                <div key={s.semana} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12,
                  background: sit === "atual" ? "rgba(181,147,63,0.14)" : "var(--surface)",
                  border: sit === "atual" ? "1px solid var(--gold)" : "1px solid transparent", opacity: sit === "passada" ? 0.55 : 1 }}>
                  <div style={{ flexShrink: 0, width: 92 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: sit === "atual" ? "var(--gold)" : "var(--ink-60)", textTransform: "uppercase" }}>
                      {sit === "atual" ? "Esta semana" : `Semana ${s.semana}`}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{dmy(s.inicio)} – {dmy(s.fim)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {s.provas.length === 0 ? (
                      <div style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.45 }}>{s.obs ?? "Sem avaliação teórica."}</div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {s.provas.map(p => (
                          <button key={p.sigla} onClick={() => onAbrir(p.sigla)} title={nomes.get(p.sigla) ?? p.sigla}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700,
                              background: sit === "passada" ? "var(--surface)" : "var(--olive)", color: sit === "passada" ? "var(--ink-60)" : "var(--canvas)",
                              border: sit === "passada" ? "1px solid rgba(58,74,58,0.25)" : "none", textDecoration: sit === "passada" ? "line-through" : "none" }}>
                            {p.sigla}{p.rotulo ? <span style={{ fontWeight: 500, opacity: 0.85 }}>{p.rotulo}</span> : null}
                          </button>
                        ))}
                      </div>
                    )}
                    {s.provas.length > 0 && (
                      <div style={{ marginTop: 5, fontSize: 12, color: "var(--ink-60)", lineHeight: 1.4 }}>
                        {s.provas.map(p => nomes.get(p.sigla) ?? p.sigla).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>
            Fonte: {CALENDARIO_FONTE} · <a href="/calendario-provas-cfo-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>ver PDF oficial ↗</a>. Toque na sigla para abrir o material da matéria.
          </p>
        </div>
      )}
    </section>
  )
}

// ── Vídeo / áudio / mapa mental por matéria (links do Drive ou YouTube) ──
function MidiaTab({ sigla, tipo, itens, isAdmin, concluida, onAdd, onRemove }: {
  sigla: string; tipo: TipoMidia; itens: Midia[]; isAdmin: boolean; concluida: boolean
  onAdd: (m: Midia) => void; onRemove: (id: string) => void
}) {
  const info = MIDIA_INFO[tipo]
  const [i, setI] = useState(0)
  const [titulo, setTitulo] = useState("")
  const [url, setUrl] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState("")

  async function adicionar() {
    setSalvando(true); setMsg("")
    const res = await fetch("/api/mementos/midia", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materia: sigla, tipo, titulo: titulo.trim() || `${info.rotulo} — ${sigla}`, url }),
    })
    const j = await res.json().catch(() => ({}))
    setSalvando(false)
    if (!res.ok) return setMsg("✗ " + (j.error || "Erro ao salvar."))
    onAdd(j); setTitulo(""); setUrl(""); setMsg("✓ Publicado.")
  }
  async function remover(id: string) {
    if (!confirm(`Remover este ${info.curto} de ${sigla}?`)) return
    const res = await fetch(`/api/mementos/midia?id=${id}`, { method: "DELETE" })
    if (res.ok) { onRemove(id); setI(0) }
  }

  const sel = itens[Math.min(i, Math.max(0, itens.length - 1))]
  const local = sel ? ehLocal(sel.url) : false
  const embed = sel && !local ? embedDe(sel.url) : null
  const altura = tipo === "video" ? undefined : tipo === "audio" ? 120 : "70vh"
  const linkStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 14, textDecoration: "none" }

  return (
    <div>
      {itens.length === 0 ? (
        <EmBreve drive concluida={concluida} texto={<>{info.icone} {info.rotulo} de <strong>{sigla}</strong> <em>em breve</em>.</>} />
      ) : (
        <div>
          {itens.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {itens.map((m, idx) => (
                <button key={m.id} onClick={() => setI(idx)}
                  style={{ padding: "7px 13px", borderRadius: 999, border: "1px solid var(--olive)", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                    background: idx === i ? "var(--olive)" : "#fff", color: idx === i ? "var(--canvas)" : "var(--olive)" }}>
                  {m.titulo}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 600 }}>{info.icone} {sel.titulo}</span>
            <a href={sel.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>↗ Abrir em nova aba</a>
            {local && <a href={sel.url} download style={linkStyle}>⬇ Baixar</a>}
            {isAdmin && !local && <button onClick={() => remover(sel.id)} style={{ ...linkStyle, color: "var(--red)", borderColor: "var(--red)", cursor: "pointer" }}>✕ Remover</button>}
          </div>
          {local ? (
            <PlayerLocal tipo={tipo} url={sel.url} titulo={`${info.rotulo} ${sigla} — ${sel.titulo}`} />
          ) : embed?.src ? (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(58,74,58,0.15)", background: "#000",
              ...(tipo === "video" ? { aspectRatio: "16 / 9" } : { height: altura }) }}>
              <iframe key={embed.src} src={embed.src} title={`${info.rotulo} ${sigla} — ${sel.titulo}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                style={{ width: "100%", height: "100%", border: "none", display: "block" }} />
            </div>
          ) : (
            <div style={cardBox}><p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>Este link não pode ser embutido aqui — use “Abrir em nova aba”.</p></div>
          )}
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--ink-60)" }}>
            {tipo === "mapa" ? "Mapa mental" : "Conteúdo"} gerado com NotebookLM a partir do memento da matéria.
            {local ? " Se o player não carregar, use “Baixar”." : " Se o player não carregar, abra em nova aba (é preciso estar logado no Google com acesso ao Drive da turma)."}
          </p>
        </div>
      )}

      {isAdmin && (
        <div style={{ ...cardBox, marginTop: 16, border: "1px dashed rgba(58,74,58,0.35)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>
            + Publicar {info.curto} de {sigla} <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>(admin)</span>
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--ink-60)", lineHeight: 1.5 }}>
            Suba o arquivo na pasta <a href={DRIVE_MEMENTOS_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>MEMENTOS (MATERIAL DE ESTUDO)</a> do Drive,
            marque “Qualquer pessoa com o link”, copie o link e cole abaixo. Links do YouTube também funcionam.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={`Título (ex.: ${info.rotulo} — Módulo 1)`} style={{ ...inputStyle, flex: "1 1 200px" }} />
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://drive.google.com/file/d/…/view" style={{ ...inputStyle, flex: "2 1 260px" }} />
            <button onClick={adicionar} disabled={salvando || !url.trim()}
              style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: salvando || !url.trim() ? "default" : "pointer", opacity: !url.trim() ? 0.5 : 1 }}>
              {salvando ? "Salvando…" : "Publicar"}
            </button>
          </div>
          {msg && <p style={{ margin: "8px 0 0", fontSize: 13, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)" }}>{msg}</p>}
        </div>
      )}
    </div>
  )
}

// Player para arquivos servidos pelo próprio portal (/public/midias/<SIGLA>/…)
function PlayerLocal({ tipo, url, titulo }: { tipo: TipoMidia; url: string; titulo: string }) {
  const borda: React.CSSProperties = { borderRadius: 12, border: "1px solid rgba(58,74,58,0.15)", overflow: "hidden" }
  if (tipo === "video") {
    return (
      <div style={{ ...borda, background: "#000" }}>
        <video key={url} src={url} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "70vh", display: "block" }}>
          Seu navegador não reproduz este vídeo. <a href={url} download>Baixe o arquivo</a>.
        </video>
      </div>
    )
  }
  if (tipo === "audio") {
    return (
      <div style={{ ...borda, background: "var(--surface)", padding: "18px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 34 }}>🎧</span>
        <audio key={url} src={url} controls preload="metadata" style={{ flex: "1 1 260px", minWidth: 0 }}>
          Seu navegador não reproduz este áudio. <a href={url} download>Baixe o arquivo</a>.
        </audio>
      </div>
    )
  }
  const ext = extensaoDe(url)
  if (ext === "pdf") {
    return (
      <object key={url} data={url} type="application/pdf" style={{ ...borda, width: "100%", height: "75vh" }}>
        <iframe src={url} title={titulo} style={{ width: "100%", height: "75vh", border: "none", borderRadius: 12 }} />
      </object>
    )
  }
  // imagem (png/jpg/webp/svg)
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={titulo} style={{ ...borda, width: "100%", height: "auto", display: "block", background: "#fff" }} />
}

// Visualizador de PDF (1 ou várias partes, rotuladas). base = pasta em /public.
function PdfOriginal({ sigla, parts, base = "mementos", labelVazio = "PDF Pernambuco Imortal" }: { sigla: string; parts: PdfPart[]; base?: string; labelVazio?: string }) {
  const [i, setI] = useState(0)

  if (parts.length === 0) {
    return (
      <div style={cardBox}>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
          Não há {labelVazio} de <strong>{sigla}</strong>.
        </p>
      </div>
    )
  }

  const sel = parts[Math.min(i, parts.length - 1)]
  const src = `/${base}/${encodeURIComponent(sel.file)}`
  const linkStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 14, textDecoration: "none" }

  return (
    <div>
      {parts.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {parts.map((p, idx) => (
            <button key={p.file} onClick={() => setI(idx)}
              style={{ padding: "7px 13px", borderRadius: 999, border: "1px solid var(--olive)", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: idx === i ? "var(--olive)" : "#fff", color: idx === i ? "var(--canvas)" : "var(--olive)" }}>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {parts.length > 1 && <span style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 600 }}>{sel.label}:</span>}
        <a href={src} target="_blank" rel="noopener noreferrer" style={linkStyle}>↗ Abrir em nova aba</a>
        <a href={src} download style={linkStyle}>⬇ Baixar</a>
      </div>
      <object key={src} data={src} type="application/pdf"
        style={{ width: "100%", height: "70vh", borderRadius: 12, border: "1px solid rgba(58,74,58,0.15)" }}>
        <iframe src={src} title={`PDF ${sigla} ${sel.label}`} style={{ width: "100%", height: "70vh", border: "none", borderRadius: 12 }} />
      </object>
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

// ── Tutor IA por matéria (chat com streaming) ──
function TutorIA({ materia }: { materia: string }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [erro, setErro] = useState("")

  async function enviar() {
    const pergunta = input.trim()
    if (!pergunta || streaming) return
    setErro("")
    const base = [...msgs, { role: "user" as const, content: pergunta }]
    setMsgs([...base, { role: "assistant", content: "" }])
    setInput(""); setStreaming(true)
    try {
      const res = await fetch("/api/ia/tutor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia, messages: base }),
      })
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Erro ao consultar o tutor.")
      }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        setMsgs(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c })
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha de conexão.")
      setMsgs(m => m.slice(0, -1))
    }
    setStreaming(false)
  }

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.5, marginTop: 0 }}>
        ✦ Tire dúvidas de <strong>{materia}</strong> com a IA, que responde usando o <strong>memento da matéria</strong> como base. Pode conter imprecisões — confirme no material oficial.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "12px 0" }}>
        {msgs.length === 0 && <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Ex.: “Explique a diferença entre detenção e prisão disciplinar.”</p>}
        {msgs.map((m, k) => (
          <div key={k} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "92%", padding: "10px 13px", borderRadius: 12, fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
            background: m.role === "user" ? "var(--olive)" : "var(--surface)",
            color: m.role === "user" ? "var(--canvas)" : "var(--ink)",
            border: m.role === "user" ? "none" : "1px solid rgba(58,74,58,0.12)",
          }}>
            {m.content || (streaming ? "…" : "")}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} placeholder={`Pergunte algo sobre ${materia}…`}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviar() }}
          style={{ ...inputStyle, resize: "vertical", flex: 1 }} />
        <button onClick={enviar} disabled={streaming || !input.trim()}
          style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: streaming || !input.trim() ? "default" : "pointer", opacity: !input.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}>
          {streaming ? "…" : "Enviar"}
        </button>
      </div>
      {erro && <p style={{ marginTop: 8, fontSize: 13, color: "var(--red)" }}>{erro}</p>}
      <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-60)" }}>Ctrl/⌘ + Enter para enviar.</p>
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
