"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

export type CardBatalhao = {
  sigla: string; slug: string; nome: string; sede: string; municipio: string
  opcao1: number; opcao2: number; comandante: string | null; mensagens: number
}
export type Pendente = { mat: number; nome: string; pelotao: number | null }

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const numero = (s: string) => Number(s.match(/\d+/)?.[0] ?? 999)
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)
const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18 }
const tituloSecao: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: "0 0 4px" }
const subSecao: React.CSSProperties = { margin: "0 0 14px", fontSize: 12.5, color: "var(--ink-60)" }

export function BatalhoesClient({ cards, respondentes, respondentesDaCia, totalAlunos, pendentes, minha, minhaMatricula, planilhaOk, planilhaUrl, formularioUrl }: {
  cards: CardBatalhao[]; respondentes: number; respondentesDaCia: number; totalAlunos: number; pendentes: Pendente[]
  minha: { opcao1: string; opcao2: string | null } | null; minhaMatricula: number
  planilhaOk: boolean; planilhaUrl: string; formularioUrl: string
}) {
  const [busca, setBusca] = useState("")
  const [criterio, setCriterio] = useState<"opcao1" | "opcao2">("opcao1")
  const [verPendentes, setVerPendentes] = useState(false)
  const [buscaPend, setBuscaPend] = useState("")

  const taxa = pct(respondentesDaCia, totalAlunos)
  const ranking = useMemo(() => [...cards].sort((a, b) => b[criterio] - a[criterio] || numero(a.sigla) - numero(b.sigla)), [cards, criterio])
  const maxRank = Math.max(1, ...ranking.map(c => c[criterio]))
  const emOrdem = useMemo(() => {
    const t = semAcento(busca.trim())
    return cards
      .filter(c => !t || semAcento(`${c.sigla} ${c.nome} ${c.sede} ${c.municipio} ${c.comandante ?? ""}`).includes(t))
      .sort((a, b) => numero(a.sigla) - numero(b.sigla))
  }, [cards, busca])
  const pendFiltrados = useMemo(() => {
    const t = semAcento(buscaPend.trim())
    return pendentes.filter(p => !t || semAcento(`${p.mat} ${p.nome}`).includes(t))
  }, [pendentes, buscaPend])
  const pendPorPel = useMemo(() => {
    const g = new Map<string, Pendente[]>()
    for (const p of pendFiltrados) { const k = p.pelotao ? `${p.pelotao}º Pelotão` : "Sem pelotão"; (g.get(k) ?? g.set(k, []).get(k)!).push(p) }
    return [...g.entries()]
  }, [pendFiltrados])
  const euFalto = pendentes.some(p => p.mat === minhaMatricula)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Minha escolha + mudar ── */}
      <section style={{ ...cartao, background: "linear-gradient(135deg, #3a4a3a 0%, #45573f 60%, #4f6347 100%)", color: "#fff", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Minha escolha</p>
            {minha ? (
              <p style={{ margin: "6px 0 0", fontSize: 16 }}>
                1ª <strong style={{ color: "#e0c979" }}>{minha.opcao1}</strong>
                {minha.opcao2 && <> · 2ª <strong style={{ color: "#e0c979" }}>{minha.opcao2}</strong></>}
              </p>
            ) : (
              <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "rgba(255,255,255,0.9)" }}>{euFalto ? "Você ainda não respondeu o levantamento." : "Você não aparece no levantamento da DAG."}</p>
            )}
          </div>
          <a href={formularioUrl} target="_blank" rel="noopener noreferrer"
            style={{ padding: "10px 16px", borderRadius: 10, background: "#e0c979", color: "#2b2a27", fontWeight: 700, fontSize: 14, textDecoration: "none", whiteSpace: "nowrap" }}>
            {minha ? "Mudar meu batalhão ↗" : "Escolher meu batalhão ↗"}
          </a>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
          Para mudar, responda de novo o formulário da DAG com a sua numérica — vale a resposta mais recente. O portal atualiza a cada 5 minutos.
        </p>
      </section>

      {!planilhaOk && <p style={{ margin: 0, fontSize: 13, color: "var(--red)" }}>✗ Não foi possível abrir a planilha da DAG agora — os números podem estar zerados. Tente de novo em instantes.</p>}

      {/* ── Participação ── */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h2 style={tituloSecao}>Participação</h2>
          <span style={{ fontFamily: "var(--serif-cfo)", fontSize: 30, fontWeight: 700, color: "var(--olive)" }}>{taxa.toLocaleString("pt-BR")}%</span>
        </div>
        <div style={{ height: 12, borderRadius: 99, background: "var(--surface)", overflow: "hidden", margin: "8px 0" }}>
          <div style={{ width: `${taxa}%`, height: "100%", background: "linear-gradient(90deg, #3a4a3a, #b5933f)", borderRadius: 99 }} />
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>
          <strong style={{ color: "var(--ink)" }}>{respondentesDaCia}</strong> de {totalAlunos} alunos da CIA responderam · faltam <strong style={{ color: "var(--red)" }}>{pendentes.length}</strong>
          {respondentes > respondentesDaCia && <> · {respondentes - respondentesDaCia} resposta(s) de fora do cadastro</>}
          {" · "}<a href={planilhaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>planilha da DAG ↗</a>
        </p>
      </section>

      {/* ── Ranking ── */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={tituloSecao}>Ranking dos mais escolhidos</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {([["opcao1", "1ª opção"], ["opcao2", "2ª opção"]] as const).map(([k, r]) => (
              <button key={k} onClick={() => setCriterio(k)}
                style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: criterio === k ? "var(--olive)" : "var(--surface)", color: criterio === k ? "var(--canvas)" : "var(--ink-60)" }}>{r}</button>
            ))}
          </div>
        </div>
        <p style={subSecao}>% sobre os {respondentes} que responderam</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {ranking.map((c, i) => {
            const meu = criterio === "opcao1" ? minha?.opcao1 === c.sigla : minha?.opcao2 === c.sigla
            return (
              <Link key={c.slug} href={`/batalhoes/${c.slug}`} style={{ display: "grid", gridTemplateColumns: "26px 78px 1fr 92px", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
                <span style={{ fontWeight: 700, color: i < 3 ? "var(--gold)" : "var(--ink-60)", fontSize: 13.5, textAlign: "right" }}>{i + 1}º</span>
                <span style={{ fontWeight: 700, color: "var(--olive)", fontSize: 13.5, whiteSpace: "nowrap" }}>{c.sigla}{meu ? " ★" : ""}</span>
                <span style={{ height: 14, borderRadius: 99, background: "var(--surface)", overflow: "hidden" }}>
                  <span style={{ display: "block", width: `${(c[criterio] / maxRank) * 100}%`, height: "100%", background: i < 3 ? "var(--gold)" : "var(--olive)", borderRadius: 99 }} />
                </span>
                <span style={{ fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}><strong>{c[criterio]}</strong> <span style={{ color: "var(--ink-60)" }}>· {pct(c[criterio], respondentes).toLocaleString("pt-BR")}%</span></span>
              </Link>
            )
          })}
        </div>
        {minha && <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>★ = sua escolha</p>}
      </section>

      {/* ── Batalhões em ordem ── */}
      <section>
        <h2 style={{ ...tituloSecao, margin: "6px 0 4px" }}>Conheça cada batalhão</h2>
        <p style={subSecao}>Em ordem numérica · toque para ver a ficha, quem escolheu e o mural da turma</p>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Batalhão, bairro, município ou comandante"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15, marginBottom: 12 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {emOrdem.map(c => {
            const meu = minha?.opcao1 === c.sigla
            return (
              <Link key={c.slug} href={`/batalhoes/${c.slug}`}
                style={{ ...cartao, padding: 16, textDecoration: "none", color: "var(--ink)", display: "flex", flexDirection: "column", gap: 6,
                  border: meu ? "1.5px solid var(--gold)" : cartao.border, background: meu ? "#fbf7ec" : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 700, fontSize: "1.35rem", color: "var(--olive)" }}>{c.sigla}</span>
                  {meu && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>sua 1ª opção</span>}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{c.nome}</span>
                <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}>📍 {c.sede}, {c.municipio}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 10, background: "var(--surface)" }}>
                    <strong style={{ display: "block", fontSize: 18, color: "var(--olive)" }}>{c.opcao1}</strong><span style={{ fontSize: 11, color: "var(--ink-60)" }}>1ª opção</span>
                  </span>
                  <span style={{ flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 10, background: "var(--surface)" }}>
                    <strong style={{ display: "block", fontSize: 18, color: "var(--olive)" }}>{c.opcao2}</strong><span style={{ fontSize: 11, color: "var(--ink-60)" }}>2ª opção</span>
                  </span>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>
                  {c.comandante ? `Cmt: ${c.comandante}` : "Ficha em construção"}{c.mensagens > 0 ? ` · 💬 ${c.mensagens}` : ""}
                </span>
                <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>Conheça o batalhão ›</span>
              </Link>
            )
          })}
        </div>
        {emOrdem.length === 0 && <p style={{ color: "var(--ink-60)" }}>Nenhum batalhão encontrado.</p>}
      </section>

      {/* ── Quem falta escolher ── */}
      <section style={cartao}>
        <button onClick={() => setVerPendentes(v => !v)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
          <span>
            <span style={{ ...tituloSecao, display: "block" }}>Quem falta escolher <span style={{ color: "var(--red)" }}>({pendentes.length})</span></span>
            <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}>Alunos da CIA que ainda não aparecem no levantamento da DAG</span>
          </span>
          <span style={{ fontSize: 13, color: "var(--ink-60)", transform: verPendentes ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
        </button>
        {verPendentes && (
          <div style={{ marginTop: 12 }}>
            {pendentes.length > 10 && (
              <input value={buscaPend} onChange={e => setBuscaPend(e.target.value)} placeholder="🔍 Buscar nome ou matrícula"
                style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 14, marginBottom: 10 }} />
            )}
            {pendentes.length === 0 ? <p style={{ margin: 0, fontSize: 13.5, color: "var(--olive)", fontWeight: 600 }}>✓ Todos já responderam.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendPorPel.map(([pel, ps]) => (
                  <div key={pel}>
                    <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{pel} ({ps.length})</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ps.map(p => (
                        <span key={p.mat} style={{ padding: "4px 10px", borderRadius: 999, fontSize: 13, background: p.mat === minhaMatricula ? "var(--gold)" : "var(--surface)", color: p.mat === minhaMatricula ? "#fff" : "var(--ink)", fontWeight: p.mat === minhaMatricula ? 700 : 500 }}>
                          {p.mat} {p.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
