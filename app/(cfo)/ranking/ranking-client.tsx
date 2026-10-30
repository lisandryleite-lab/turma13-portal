"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { calcularComponentes, calcularProjecaoConsolidada, calcularPosicaoHistorica, BASE_T1, BASE_T2, type Verificacao } from "@/lib/ranking"

type Nota = { id: string; disciplina: string; avaliacao: string; valor: number; ehAF: boolean; apto: boolean }
type Disc = { sigla: string; nome: string; status: string; fase: "concluida" | "andamento" | "inicio"; ordem: number }
type Aba = "lancar" | "ranking" | "simular"

const card: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

// Em andamento primeiro: é onde as notas novas costumam cair.
const GRUPOS_DISC = [
  ["andamento", "Em andamento"],
  ["concluida", "Concluídas"],
  ["inicio", "Pendentes"],
] as const

const AVALIACOES = ["P1", "P2", "P3", "AF"] as const

import { semAcento, bate } from "@/lib/busca"

function toVerif(notas: Nota[]): Verificacao[] {
  return notas.map(n => ({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto }))
}
const mgcDe = (mfic: number | null, nfdc: number, tcc: number) =>
  mfic == null ? null : Number(((mfic * 6.5 + nfdc * 2.5 + tcc * 1) / 10).toFixed(3))

// MDs reais por disciplina (exclui TCC e conceito), aplicando regra de MDR
function mdsReais(notas: Nota[]): number[] {
  const g = new Map<string, Nota[]>()
  for (const n of notas) { if (n.disciplina === "TCC") continue; if (!g.has(n.disciplina)) g.set(n.disciplina, []); g.get(n.disciplina)!.push(n) }
  const out: number[] = []
  for (const [, ns] of g) {
    if (ns.some(n => n.apto)) continue
    const reg = ns.filter(n => !n.ehAF && !n.apto)
    if (reg.length === 0) continue
    let m = reg.reduce((s, n) => s + n.valor, 0) / reg.length
    const af = ns.find(n => n.ehAF)?.valor ?? null
    if (m < 7 && m >= 4 && af != null) { const med = (m + af) / 2; m = med >= 7 ? 7 : med }
    out.push(m)
  }
  return out
}

export function RankingClient({
  notasIniciais, nfdc, disciplinas, totalDisciplinas, turmaSize, mgcsOutros, nomeGuerra,
}: {
  notasIniciais: Nota[]; nfdc: number; disciplinas: Disc[]; totalDisciplinas: number; turmaSize: number; mgcsOutros: number[]
  nomeGuerra: string
}) {
  const router = useRouter()
  const [notas, setNotas] = useState<Nota[]>(notasIniciais)
  const [aba, setAba] = useState<Aba>("lancar")
  const [hoje, setHoje] = useState("")
  useEffect(() => { setHoje(new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })) }, [])

  // form lançar
  const [disc, setDisc] = useState("")
  const [busca, setBusca] = useState("")
  const [buscaDisc, setBuscaDisc] = useState("")
  const [aval, setAval] = useState("P1")
  const [valor, setValor] = useState("")
  const [ehAF, setEhAF] = useState(false)
  const [apto, setApto] = useState(false)
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  // NFDC e TCC (editáveis; default 10)
  const tccReal = notas.find(n => n.disciplina === "TCC")?.valor ?? null
  const [nfdcState, setNfdcState] = useState(nfdc)
  const [tccState, setTccState] = useState<number>(tccReal ?? 10)

  const comp = calcularComponentes(toVerif(notas), nfdcState)
  const mfic = comp.mfic
  const mgc = mgcDe(mfic, nfdcState, tccState)

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setErro("")
    const v = Number(valor.replace(",", "."))
    if (!disc) return setErro("Escolha a disciplina.")
    if (isNaN(v) || v < 0 || v > 10) return setErro("Nota deve ser entre 0 e 10.")
    setSalvando(true)
    const res = await fetch("/api/notas-cfo", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disciplina: disc, avaliacao: aval || "P1", valor: v, ehAF, apto }),
    })
    setSalvando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao salvar.") }
    const nova: Nota = await res.json()
    setNotas(prev => {
      const i = prev.findIndex(n => n.disciplina === nova.disciplina && n.avaliacao === nova.avaliacao)
      if (i >= 0) { const c = [...prev]; c[i] = nova; return c }
      return [...prev, nova].sort((a, b) => a.disciplina.localeCompare(b.disciplina))
    })
    setValor(""); setEhAF(false); setApto(false); setAval("P1")
    router.refresh()
  }

  // Tocar numa nota lançada traz ela de volta ao formulário para corrigir.
  function editar(n: Nota) {
    setDisc(n.disciplina); setAval(n.avaliacao); setValor(String(n.valor)); setEhAF(n.ehAF); setApto(n.apto); setErro("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  function escolherAval(a: string) { setAval(a); setEhAF(a === "AF") }

  async function excluir(id: string) {
    if (!confirm("Excluir esta nota?")) return
    const res = await fetch(`/api/notas-cfo?id=${id}`, { method: "DELETE" })
    if (res.ok) { setNotas(prev => prev.filter(n => n.id !== id)); router.refresh() }
  }

  async function salvarNfdc(v: number) {
    await fetch("/api/nfdc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nfdc: v }) })
    setNfdcState(v); router.refresh()
  }
  async function salvarTcc(v: number) {
    const res = await fetch("/api/notas-cfo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ disciplina: "TCC", avaliacao: "TCC", valor: v }) })
    if (res.ok) {
      const nova: Nota = await res.json()
      setNotas(prev => { const i = prev.findIndex(n => n.disciplina === "TCC"); if (i >= 0) { const c = [...prev]; c[i] = nova; return c } return [...prev, nova] })
      setTccState(v); router.refresh()
    }
  }

  const grupos = new Map<string, Nota[]>()
  for (const n of notas) { if (!grupos.has(n.disciplina)) grupos.set(n.disciplina, []); grupos.get(n.disciplina)!.push(n) }
  const nomeDisc = (s: string) => disciplinas.find(d => d.sigla === s)?.nome || s
  function md(ns: Nota[]): number | null {
    const reg = ns.filter(n => !n.ehAF && !n.apto)
    if (reg.length === 0) return null
    return reg.reduce((s, n) => s + n.valor, 0) / reg.length
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 4 }}>
        Ranking & Previsão
      </h1>
      <p style={{ color: "var(--ink-60)", margin: 0 }}>Olá, {nomeGuerra}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        {([["lancar", "Lançar notas"], ["ranking", "Meu ranking"], ["simular", "Simular"]] as const).map(([t, rot]) => (
          <button key={t} onClick={() => setAba(t)}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: aba === t ? "var(--olive)" : "var(--surface)", color: aba === t ? "var(--canvas)" : "var(--ink-60)" }}>
            {rot}
          </button>
        ))}
      </div>

      <div style={{ margin: "14px 0 0", fontSize: 12.5, color: "var(--ink-60)" }}>
        Simulação não-oficial · só você vê as suas notas ·{" "}
        <details style={{ display: "inline" }}>
          <summary style={{ display: "inline", cursor: "pointer", color: "var(--olive)", fontWeight: 600 }}>como é calculado</summary>
          <span style={{ display: "block", marginTop: 4 }}>MGC = (MFIC×6,5 + NFDC×2,5 + TCC×1) ÷ 10, pela fórmula do CFO.</span>
        </details>
      </div>

      {aba === "lancar" && (() => {
        const termoDisc = semAcento(buscaDisc.trim())
        const ordenadas = (fase: string) => disciplinas.filter(d => d.fase === fase)
          .sort((a, b) => a.ordem - b.ordem || a.sigla.localeCompare(b.sigla))
        const chip = (d: Disc) => {
          const sel = disc === d.sigla
          const temNota = grupos.has(d.sigla)
          return (
            <button key={d.sigla} type="button" title={d.nome} onClick={() => { setDisc(d.sigla); setErro("") }}
              style={{
                padding: "5px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: sel ? "1px solid var(--olive)" : "1px solid rgba(58,74,58,0.2)",
                background: sel ? "var(--olive)" : temNota ? "#eef2ea" : "#fff",
                color: sel ? "var(--canvas)" : "var(--ink)",
              }}>
              {temNota && !sel ? "✓ " : ""}{d.sigla}
            </button>
          )
        }
        const resultados = termoDisc
          ? disciplinas.filter(d => bate(`${d.sigla} ${d.nome}`, termoDisc)).sort((a, b) => a.sigla.localeCompare(b.sigla))
          : []
        const avalPadrao = (AVALIACOES as readonly string[]).includes(aval)
        const comNotas = notas.filter(n => n.disciplina !== "TCC")

        return (
          <>
            {/* 1 · disciplina */}
            <div style={{ marginTop: 20 }}>
              <input style={{ ...inputStyle, fontSize: 14 }} value={buscaDisc} onChange={e => setBuscaDisc(e.target.value)}
                placeholder="Buscar disciplina (sigla ou nome)" aria-label="Buscar disciplina" />
              {termoDisc ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {resultados.length > 0 ? resultados.map(chip)
                    : <span style={{ fontSize: 13, color: "var(--ink-60)" }}>Nenhuma disciplina com “{buscaDisc}”.</span>}
                </div>
              ) : (
                <div style={{ marginTop: 6 }}>
                  {GRUPOS_DISC.map(([fase, rotulo]) => {
                    const lista = ordenadas(fase)
                    if (lista.length === 0) return null
                    return (
                      <details key={fase} open={fase === "andamento"} style={{ borderBottom: "1px solid rgba(58,74,58,0.1)", padding: "8px 0" }}>
                        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--olive)" }}>
                          {rotulo} <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>({lista.length})</span>
                        </summary>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{lista.map(chip)}</div>
                      </details>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2 · avaliação + nota */}
            <form onSubmit={salvar} style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "var(--surface)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: disc ? "var(--olive)" : "var(--ink-60)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {disc ? `${disc} — ${nomeDisc(disc)}` : "Escolha uma disciplina acima"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {AVALIACOES.map(a => (
                  <button key={a} type="button" onClick={() => escolherAval(a)}
                    style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: "1px solid rgba(58,74,58,0.2)",
                      background: aval === a ? "var(--olive)" : "#fff", color: aval === a ? "var(--canvas)" : "var(--ink)" }}>
                    {a}
                  </button>
                ))}
                {!avalPadrao && (
                  <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--olive)", color: "var(--canvas)" }}>{aval}</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={valor} onChange={e => setValor(e.target.value)}
                  placeholder="Nota (0–10)" inputMode="decimal" aria-label="Nota" />
                <button type="submit" disabled={salvando || !disc}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontSize: 15, fontWeight: 600,
                    cursor: salvando || !disc ? "default" : "pointer", opacity: disc ? 1 : 0.5 }}>
                  {salvando ? "Salvando…" : "Salvar"}
                </button>
              </div>
              <label style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontSize: 12.5, color: "var(--ink-60)" }}>
                <input type="checkbox" checked={apto} onChange={e => setApto(e.target.checked)} /> disciplina de conceito (APTO/INAPTO)
              </label>
              {erro && <p style={{ margin: "8px 0 0", color: "var(--red)", fontSize: 13.5 }}>✗ {erro}</p>}
            </form>

            {/* NFDC e TCC — recolhido */}
            <details style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "var(--surface)" }}>
              <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>
                NFDC {nfdcState.toFixed(1)} · TCC {tccState.toFixed(1)}{tccReal == null ? "*" : ""}
                <span style={{ fontWeight: 400, color: "var(--ink-60)" }}> — ajustar</span>
              </summary>
              <div style={{ marginTop: 10 }}>
                <NfdcTccEditor nfdc={nfdcState} tcc={tccState} tccDefinido={tccReal != null} onSaveNfdc={salvarNfdc} onSaveTcc={salvarTcc} plano />
              </div>
            </details>

            {/* Minhas notas */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 28, marginBottom: 6, gap: 12 }}>
              <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }}>
                Minhas notas {comNotas.length > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-60)" }}>· MFIC {mfic != null ? mfic.toFixed(3) : "—"}</span>}
              </h2>
              {comNotas.length > 0 && (
                <button onClick={() => { setBusca(""); setTimeout(() => window.print(), 50) }}
                  style={{ background: "none", border: "none", padding: 0, color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Imprimir
                </button>
              )}
            </div>
            {grupos.size > 8 && (
              <div className="no-print" style={{ marginBottom: 8 }}>
                <input style={{ ...inputStyle, fontSize: 14 }} value={busca} onChange={e => setBusca(e.target.value)}
                  placeholder="Filtrar minhas notas" aria-label="Filtrar minhas notas" />
              </div>
            )}
            {comNotas.length === 0 ? (
              <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Nenhuma nota ainda. Escolha uma disciplina acima para começar.</p>
            ) : (
              <div className="notas-print">
                {/* Cabeçalho que só aparece na impressão */}
                <div className="print-only" style={{ marginBottom: 14 }}>
                  <h1 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.5rem", color: "#000", margin: "0 0 2px", borderBottom: "2px solid #000", paddingBottom: 6 }}>
                    Boletim de Notas — {nomeGuerra}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#333" }}>
                    Portal CFO PM 2026 · emitido em {hoje} · <em>simulação não-oficial (notas informadas pelo aluno)</em>
                  </p>
                </div>
                {(() => {
                  // Mesma ordem do seletor: Concluídas (ordem de término no QTS) →
                  // Em andamento → Pendentes; a busca filtra por sigla ou nome.
                  const termo = semAcento(busca.trim())
                  const info = new Map(disciplinas.map(d => [d.sigla, d]))
                  const lista = [...grupos.entries()]
                    .filter(([d]) => d !== "TCC")
                    .filter(([d]) => bate(`${d} ${nomeDisc(d)}`, termo))
                  const secoes = [...GRUPOS_DISC.map(([fase, rotulo]) => [fase, rotulo] as const), ["outras", "Outras"] as const]
                    .map(([fase, rotulo]) => ({
                      rotulo,
                      itens: lista.filter(([d]) => (info.get(d)?.fase ?? "outras") === fase)
                        .sort(([a], [b]) => (info.get(a)?.ordem ?? 0) - (info.get(b)?.ordem ?? 0) || a.localeCompare(b)),
                    }))
                    .filter(sec => sec.itens.length > 0)
                  if (secoes.length === 0) return <p style={{ color: "var(--ink-60)", fontSize: 14 }}>Nenhuma disciplina com nota bate com “{busca}”.</p>
                  return secoes.map(sec => (
                    <section key={sec.rotulo} style={{ marginTop: 14 }}>
                      <h3 style={{ margin: "0 0 2px", fontSize: 11.5, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {sec.rotulo} ({sec.itens.length})
                      </h3>
                      {sec.itens.map(([d, ns]) => {
                        const m = md(ns)
                        const abaixo = m != null && m < 7
                        return (
                          <div key={d} className="nota-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(58,74,58,0.1)" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                                <strong style={{ color: "var(--olive)", fontSize: 15, flexShrink: 0 }}>{d}</strong>
                                <span style={{ fontSize: 12.5, color: "var(--ink-60)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nomeDisc(d)}</span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
                                {ns.map(n => (
                                  <span key={n.id} style={{ display: "inline-flex", alignItems: "center", borderRadius: 6, background: "var(--surface)", fontSize: 13 }}>
                                    <button onClick={() => editar(n)} title="Corrigir esta nota"
                                      style={{ background: "none", border: "none", padding: "3px 4px 3px 8px", cursor: "pointer", fontSize: 13, color: "var(--ink)" }}>
                                      {n.avaliacao}{n.ehAF && n.avaliacao !== "AF" ? " (AF)" : ""}{n.apto ? " · conceito" : ""} <strong style={{ color: "var(--olive)" }}>{n.valor.toFixed(2)}</strong>
                                    </button>
                                    <button className="no-print" onClick={() => excluir(n.id)} aria-label={`Excluir ${n.avaliacao} de ${d}`} title="Excluir"
                                      style={{ background: "none", border: "none", padding: "3px 8px 3px 2px", cursor: "pointer", fontSize: 15, lineHeight: 1, color: "var(--ink-60)" }}>×</button>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: abaixo ? "var(--red)" : "var(--olive)" }}>
                              {abaixo ? "▼ " : ""}MD {m != null ? m.toFixed(2) : "—"}
                            </span>
                          </div>
                        )
                      })}
                    </section>
                  ))
                })()}
                {/* Resumo que só aparece na impressão */}
                <div className="print-only" style={{ marginTop: 16, paddingTop: 10, borderTop: "1px solid #ccc", fontSize: 13, color: "#000" }}>
                  <strong>Resumo:</strong> MFIC {mfic != null ? mfic.toFixed(3) : "—"} · NFDC {nfdcState.toFixed(1)} · TCC {tccState.toFixed(1)}{tccReal == null ? "*" : ""} · <strong>MGC {mgc != null ? mgc.toFixed(3) : "—"}</strong>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#555" }}>MGC = (MFIC×6,5 + NFDC×2,5 + TCC×1) ÷ 10. {tccReal == null ? "* TCC ainda não lançado (10 por padrão). " : ""}Documento sem valor oficial.</div>
                </div>
              </div>
            )}
          </>
        )
      })()}

      {aba === "ranking" && (
        mgc == null ? <p style={{ color: "var(--ink-60)", marginTop: 20 }}>Lance suas notas para ver o ranking e a previsão.</p> : (
          <RankingPanel mgc={mgc} mfic={mfic} nfdc={nfdcState} tcc={tccState} tccDefinido={tccReal != null}
            mgcsOutros={mgcsOutros} turmaSize={turmaSize} onSaveNfdc={salvarNfdc} onSaveTcc={salvarTcc} />
        )
      )}

      {aba === "simular" && (
        <Simular mdsBase={mdsReais(notas)} tccInicial={tccReal ?? 10} nfdcInicial={nfdcState}
          totalDisciplinas={totalDisciplinas} mgcsOutros={mgcsOutros} turmaSize={turmaSize} />
      )}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}


// ── Editor de NFDC e TCC (default 10) ──
function NfdcTccEditor({ nfdc, tcc, tccDefinido, onSaveNfdc, onSaveTcc, plano }: {
  nfdc: number; tcc: number; tccDefinido: boolean; onSaveNfdc: (v: number) => void; onSaveTcc: (v: number) => void
  plano?: boolean // sem caixa própria (quando já está dentro de outra)
}) {
  const [n, setN] = useState(String(nfdc))
  const [t, setT] = useState(String(tcc))
  const [msg, setMsg] = useState("")
  return (
    <div style={plano ? undefined : card}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 200px" }}>
          Nota Disciplinar (NFDC) <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>— inicia em 10</span>
          <input style={{ ...inputStyle, marginTop: 4 }} value={n} onChange={e => setN(e.target.value)} inputMode="decimal" />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600, flex: "1 1 200px" }}>
          Nota do TCC {tccDefinido ? "" : <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>— ainda não lançada</span>}
          <input style={{ ...inputStyle, marginTop: 4 }} value={t} onChange={e => setT(e.target.value)} inputMode="decimal" />
        </label>
        <button
          onClick={() => {
            const nv = Number(n.replace(",", ".")), tv = Number(t.replace(",", "."))
            if (isNaN(nv) || nv < 0 || nv > 10 || isNaN(tv) || tv < 0 || tv > 10) return setMsg("Valores devem ser entre 0 e 10.")
            onSaveNfdc(nv); onSaveTcc(tv); setMsg("✓ Salvo.")
          }}
          style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "var(--gold)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer" }}>
          Salvar
        </button>
      </div>
      {msg && <p style={{ margin: "8px 0 0", fontSize: 13, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)" }}>{msg}</p>}
    </div>
  )
}

// ── Painel "Meu ranking" ──
function RankingPanel({ mgc, mfic, nfdc, tcc, tccDefinido, mgcsOutros, turmaSize, onSaveNfdc, onSaveTcc }: {
  mgc: number; mfic: number | null; nfdc: number; tcc: number; tccDefinido: boolean
  mgcsOutros: number[]; turmaSize: number; onSaveNfdc: (v: number) => void; onSaveTcc: (v: number) => void
}) {
  const acima = mgcsOutros.filter(m => m > mgc).length
  const totalComDados = mgcsOutros.length + 1
  const posReal = acima + 1
  const posT1 = Math.round(calcularPosicaoHistorica(mgc, BASE_T1))
  const posT2 = Math.round(calcularPosicaoHistorica(mgc, BASE_T2))
  const proj = calcularProjecaoConsolidada(mgc, acima, turmaSize, totalComDados)

  const box = (label: string, v: string, sub?: string) => (
    <div style={{ padding: "12px 10px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)" }}>{v}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--ink-60)" }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ padding: "20px 18px", borderRadius: 14, background: "var(--olive)", color: "var(--canvas)", textAlign: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Sua MGC (autodeclarada)</div>
        <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2.2rem", fontWeight: 600 }}>{mgc.toFixed(3)}</div>
        <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>Posição provável: <strong>{proj.provavel}º</strong> de {turmaSize} (T3)</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>faixa entre {proj.melhor}º e {proj.conservador}º</div>
      </div>

      {/* Posições certeiras */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        {box("Entre quem já lançou (T3)", `${posReal}º`, `de ${totalComDados}`)}
        {box("Se fosse da T1", `${posT1}º`, `de ${BASE_T1.length}`)}
        {box("Se fosse da T2", `${posT2}º`, `de ${BASE_T2.length}`)}
      </div>

      {/* Componentes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 }}>
        {box("MFIC", mfic != null ? mfic.toFixed(3) : "—")}
        {box("NFDC", nfdc.toFixed(1))}
        {box("TCC", tcc.toFixed(1) + (tccDefinido ? "" : "*"))}
      </div>

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.1rem", color: "var(--olive)", marginTop: 24, marginBottom: 8 }}>Ajustar NFDC e TCC</h2>
      <NfdcTccEditor nfdc={nfdc} tcc={tcc} tccDefinido={tccDefinido} onSaveNfdc={onSaveNfdc} onSaveTcc={onSaveTcc} />

      <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
        A posição <strong>na T3</strong> compara com {totalComDados} alunos que já lançaram notas; as posições <strong>T1/T2</strong> usam as notas
        finais oficiais daquelas turmas. {tccDefinido ? "" : "* TCC ainda não lançado — usando 10 por padrão. "}Não é a nota oficial.
      </p>
    </div>
  )
}

// ── Simular (independente das notas oficiais) ──
function Simular({ mdsBase, tccInicial, nfdcInicial, totalDisciplinas, mgcsOutros, turmaSize }: {
  mdsBase: number[]; tccInicial: number; nfdcInicial: number; totalDisciplinas: number; mgcsOutros: number[]; turmaSize: number
}) {
  const feitas = mdsBase.length
  const restantesPadrao = Math.max(0, totalDisciplinas - feitas)
  const [nfdc, setNfdc] = useState(String(nfdcInicial))
  const [tcc, setTcc] = useState(String(tccInicial))
  const [restantes, setRestantes] = useState(String(restantesPadrao))
  const [mediaRest, setMediaRest] = useState("9.0")

  const nfdcN = Number(nfdc.replace(",", ".")) || 0
  const tccN = Number(tcc.replace(",", ".")) || 0
  const restN = Math.max(0, Math.floor(Number(restantes) || 0))
  const mediaN = Number(mediaRest.replace(",", ".")) || 0

  const somaReais = mdsBase.reduce((s, m) => s + m, 0)
  const totalCont = feitas + restN
  const mficSim = totalCont > 0 ? (somaReais + restN * mediaN) / totalCont : null
  const mgcSim = mgcDe(mficSim, nfdcN, tccN)

  const acima = mgcSim != null ? mgcsOutros.filter(m => m > mgcSim).length : 0
  const proj = mgcSim != null ? calcularProjecaoConsolidada(mgcSim, acima, turmaSize, mgcsOutros.length + 1) : null
  const posT1 = mgcSim != null ? Math.round(calcularPosicaoHistorica(mgcSim, BASE_T1)) : 0
  const posT2 = mgcSim != null ? Math.round(calcularPosicaoHistorica(mgcSim, BASE_T2)) : 0

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
        Simule sua <strong>nota disciplinar (NFDC)</strong>, a <strong>nota do TCC</strong> e as <strong>disciplinas ainda não concluídas</strong>.
        Parte das suas {feitas} disciplina(s) já lançada(s) e projeta o resto. <strong>Não altera</strong> nada — é só para você.
      </p>
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>NFDC (0–10)
            <input style={{ ...inputStyle, marginTop: 4 }} value={nfdc} onChange={e => setNfdc(e.target.value)} inputMode="decimal" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Nota do TCC (0–10)
            <input style={{ ...inputStyle, marginTop: 4 }} value={tcc} onChange={e => setTcc(e.target.value)} inputMode="decimal" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Disciplinas ainda não concluídas
            <input style={{ ...inputStyle, marginTop: 4 }} value={restantes} onChange={e => setRestantes(e.target.value)} inputMode="numeric" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Média estimada dessas disciplinas
            <input style={{ ...inputStyle, marginTop: 4 }} value={mediaRest} onChange={e => setMediaRest(e.target.value)} inputMode="decimal" />
          </label>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-60)", margin: "10px 0 0" }}>
          Você já lançou <strong>{feitas}</strong> disciplina(s). MFIC simulada considera as suas + as estimadas.
        </p>
      </div>

      {mgcSim != null && proj ? (
        <>
          <div style={{ marginTop: 14, padding: "20px 18px", borderRadius: 14, background: "var(--olive)", color: "var(--canvas)", textAlign: "center" }}>
            <div style={{ fontSize: 13, opacity: 0.85 }}>MGC simulada</div>
            <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2rem", fontWeight: 600 }}>{mgcSim.toFixed(3)}</div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>Posição provável: {proj.provavel}º de {turmaSize} (faixa {proj.melhor}º–{proj.conservador}º)</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ padding: "12px 10px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--ink-60)" }}>Se fosse da T1</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)" }}>{posT1}º <span style={{ fontSize: 12, color: "var(--ink-60)" }}>de {BASE_T1.length}</span></div>
            </div>
            <div style={{ padding: "12px 10px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--ink-60)" }}>Se fosse da T2</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)" }}>{posT2}º <span style={{ fontSize: 12, color: "var(--ink-60)" }}>de {BASE_T2.length}</span></div>
            </div>
          </div>
        </>
      ) : <p style={{ marginTop: 12, color: "var(--ink-60)" }}>Informe os valores para simular.</p>}
    </div>
  )
}
