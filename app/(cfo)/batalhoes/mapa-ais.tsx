"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { AIS_PE, DIRETORIAS, FONTE_AIS, NORONHA, REGIOES, UNIDADES_PRISIONAIS, aisDoBatalhao, type IdAIS, type Regiao } from "@/lib/ais-pernambuco"
import { CAIXA_RMR, MAPA_ALTURA, MAPA_LARGURA, MUNICIPIOS_MAPA, RECORTE_RMR, ROTULOS_AIS } from "@/lib/ais-mapa"
import { REM, disputa } from "./batalhoes-client"

export type BatalhaoMapa = { sigla: string; slug: string; opcao1: number }

type Modo = "areas" | "turma" | "disputa"
const MODOS: { id: Modo; rot: string }[] = [
  { id: "areas", rot: "Áreas (mapa da SDS)" },
  { id: "turma", rot: "Escolha da turma" },
  { id: "disputa", rot: "Disputa T1+T2" },
]

const POR_ID = new Map(AIS_PE.map(a => [a.id, a]))
const DIM = new Set<IdAIS>(AIS_PE.filter(a => a.diretoria === "DIM").map(a => a.id))
const MUNIS_DA_AIS = MUNICIPIOS_MAPA.reduce((m, x) => m.set(x.ais, [...(m.get(x.ais) ?? []), x.nome]), new Map<IdAIS, string[]>())
const NOMES_MUNI = MUNICIPIOS_MAPA.map(m => m.nome)
const NEUTRO = "#e7e3d8"
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const numeroRotulo = (id: IdAIS) => id === "1-5" ? "1–5" : id

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.12)", padding: 18 }
const titulo: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }
const rotulo: React.CSSProperties = { fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }
const pilula = (ativo: boolean): React.CSSProperties => ({
  padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.18)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
  background: ativo ? "var(--olive)" : "#fff", color: ativo ? "var(--canvas)" : "var(--ink-60)",
})

export function MapaAIS({ batalhoes, respondentes, minha1 }: { batalhoes: BatalhaoMapa[]; respondentes: number; minha1: string | null }) {
  const aisMinha = minha1 ? aisDoBatalhao(minha1) : null
  const [sel, setSel] = useState<IdAIS>(aisMinha ?? "1-5")
  const [hover, setHover] = useState<{ muni: string; ais: IdAIS } | null>(null)
  const [regiao, setRegiao] = useState<Regiao | null>(null)
  const [modo, setModo] = useState<Modo>("areas")
  const [rmr, setRmr] = useState(false)
  const [busca, setBusca] = useState("")
  const rolagem = useRef<HTMLDivElement>(null)
  // No celular o estado não cabe: começa pelo leste (Grande Recife e Agreste)
  useEffect(() => { if (!rmr && rolagem.current) rolagem.current.scrollLeft = rolagem.current.scrollWidth }, [rmr])

  // Batalhões da escolha agrupados por AIS, com a procura da turma e o corte T1+T2
  const porAIS = useMemo(() => {
    const m = new Map<IdAIS, BatalhaoMapa[]>()
    for (const b of batalhoes) { const a = aisDoBatalhao(b.sigla); if (a) m.set(a, [...(m.get(a) ?? []), b]) }
    return m
  }, [batalhoes])
  const op1 = (id: IdAIS) => (porAIS.get(id) ?? []).reduce((s, b) => s + b.opcao1, 0)
  const disp = (id: IdAIS) => {
    const v = (porAIS.get(id) ?? []).map(b => disputa(REM[b.sigla])).filter((x): x is number => x != null)
    return v.length ? Math.min(...v) : null
  }
  const maxOp1 = Math.max(1, ...[...DIM].map(op1))
  const dispVals = [...DIM].map(disp).filter((x): x is number => x != null)
  const [dMin, dMax] = [Math.min(...dispVals), Math.max(...dispVals)]

  const cor = (id: IdAIS) => {
    if (modo === "areas") return POR_ID.get(id)!.cor
    if (modo === "turma") return DIM.has(id) ? `rgba(181,147,63,${0.12 + 0.88 * op1(id) / maxOp1})` : NEUTRO
    const d = disp(id)
    return d == null ? NEUTRO : `rgba(58,74,58,${0.15 + 0.75 * (dMax > dMin ? 1 - (d - dMin) / (dMax - dMin) : 1)})`
  }
  const apagada = (id: IdAIS) => regiao != null && POR_ID.get(id)!.regiao !== regiao

  const achado = useMemo(() => {
    const t = semAcento(busca.trim())
    if (t.length < 3) return null
    return MUNICIPIOS_MAPA.find(m => semAcento(m.nome) === t) ?? MUNICIPIOS_MAPA.find(m => semAcento(m.nome).startsWith(t)) ?? null
  }, [busca])

  const escolher = (id: IdAIS) => { setSel(id); if (DIM.has(id) && !rmr) setRmr(true) }
  const buscar = (v: string) => {
    setBusca(v)
    const t = semAcento(v.trim())
    const m = t.length >= 3 ? MUNICIPIOS_MAPA.find(x => semAcento(x.nome) === t) ?? MUNICIPIOS_MAPA.find(x => semAcento(x.nome).startsWith(t)) : null
    if (m) { setSel(m.ais); setRmr(DIM.has(m.ais)); setRegiao(null) }
  }

  const ais = POR_ID.get(sel)!
  const diretoria = DIRETORIAS.find(d => d.id === ais.diretoria)!
  const munis = MUNIS_DA_AIS.get(sel) ?? []
  const prisoes = UNIDADES_PRISIONAIS.filter(p => p.ais === sel)
  const topo = [...DIM].sort((a, b) => op1(b) - op1(a))[0]
  const vb = rmr ? RECORTE_RMR.join(" ") : `0 0 ${MAPA_LARGURA} ${MAPA_ALTURA}`
  const fs = rmr ? 4.2 : 13
  const visiveis = AIS_PE.filter(a => !regiao || a.regiao === regiao)
  const muniInfo = hover ?? (achado ? { muni: achado.nome, ais: achado.ais } : null)

  return (
    <section style={cartao}>
      <h2 style={titulo}>Mapa das AIS — onde cada batalhão atua</h2>
      <p style={{ margin: "4px 0 12px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
        As 26 Áreas Integradas de Segurança de Pernambuco: cada uma junta um batalhão da PM, uma seccional da Polícia Civil, os Bombeiros e a Polícia Científica no mesmo território. Toque numa área para ver municípios e unidades.
      </p>

      {/* Leitura rápida */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8, marginBottom: 12 }}>
        <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)" }}>
          <div style={rotulo}>Nossa escolha</div>
          <div style={{ fontSize: 13, marginTop: 3, lineHeight: 1.4 }}>Os {batalhoes.length} batalhões ficam todos na <strong>DIM</strong> (AIS 1 a 10, Grande Recife).</div>
        </div>
        {topo && op1(topo) > 0 && (
          <button onClick={() => escolher(topo)} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>
            <div style={rotulo}>Mais procurada pela turma</div>
            <div style={{ fontSize: 13, marginTop: 3, lineHeight: 1.4 }}><strong>{POR_ID.get(topo)!.rotulo} · {POR_ID.get(topo)!.nome}</strong> — {op1(topo)} na 1ª opção{respondentes ? ` (${Math.round((op1(topo) / respondentes) * 100)}%)` : ""}</div>
          </button>
        )}
        {aisMinha && (
          <button onClick={() => escolher(aisMinha)} style={{ padding: "10px 12px", borderRadius: 12, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)", textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: "var(--ink)" }}>
            <div style={rotulo}>Sua 1ª opção ★</div>
            <div style={{ fontSize: 13, marginTop: 3, lineHeight: 1.4 }}><strong>{minha1}</strong> → {POR_ID.get(aisMinha)!.rotulo} · {POR_ID.get(aisMinha)!.nome} ({(MUNIS_DA_AIS.get(aisMinha) ?? []).length} {(MUNIS_DA_AIS.get(aisMinha) ?? []).length === 1 ? "município" : "municípios"})</div>
          </button>
        )}
      </div>

      {/* Controles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...rotulo, marginRight: 2 }}>Região</span>
          <button onClick={() => setRegiao(null)} style={pilula(regiao == null)}>Todas</button>
          {REGIOES.map(r => <button key={r} onClick={() => { setRegiao(r); setRmr(r === "Grande Recife"); const p = AIS_PE.find(a => a.regiao === r)!; if (POR_ID.get(sel)!.regiao !== r) setSel(p.id) }} style={pilula(regiao === r)}>{r}</button>)}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ ...rotulo, marginRight: 2 }}>Colorir por</span>
          {MODOS.map(m => <button key={m.id} onClick={() => setModo(m.id)} style={pilula(modo === m.id)}>{m.rot}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "inline-flex", borderRadius: 10, border: "1px solid rgba(58,74,58,0.18)", overflow: "hidden" }}>
            {[{ v: false, r: "Pernambuco" }, { v: true, r: "Grande Recife" }].map(o => (
              <button key={o.r} onClick={() => setRmr(o.v)} style={{ padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", background: rmr === o.v ? "var(--olive)" : "#fff", color: rmr === o.v ? "var(--canvas)" : "var(--ink-60)" }}>{o.r}</button>
            ))}
          </div>
          <input value={busca} onChange={e => buscar(e.target.value)} list="ais-municipios" placeholder="Em que AIS fica a cidade…?" aria-label="Buscar município"
            style={{ flex: "1 1 200px", maxWidth: 300, padding: "7px 12px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.25)", background: "#fff", fontSize: 13.5 }} />
          <datalist id="ais-municipios">{NOMES_MUNI.map(n => <option key={n} value={n} />)}</datalist>
        </div>
      </div>

      {/* Mapa */}
      <div ref={rolagem} style={{ overflowX: rmr ? "visible" : "auto", margin: "0 -6px", padding: "0 6px" }}>
        <svg viewBox={vb} role="img" aria-label={`Mapa das AIS de Pernambuco${rmr ? " — Grande Recife" : ""}`}
          style={{ display: "block", width: rmr ? "auto" : "100%", minWidth: rmr ? undefined : 600, height: rmr ? "min(440px, 110vw)" : "auto", margin: "0 auto", touchAction: "manipulation" }}
          onMouseLeave={() => setHover(null)}>
          {AIS_PE.map(a => (
            <g key={a.id} role="button" tabIndex={0} aria-label={`${a.rotulo} · ${a.nome}`} aria-pressed={sel === a.id}
              onClick={() => escolher(a.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); escolher(a.id) } }}
              style={{ cursor: "pointer", outline: "none", opacity: apagada(a.id) ? 0.28 : 1, transition: "opacity .2s" }}>
              {MUNICIPIOS_MAPA.filter(m => m.ais === a.id).map(m => (
                <path key={m.nome} d={m.d} fill={cor(a.id)} stroke="#fff" strokeWidth={0.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round"
                  onMouseEnter={() => setHover({ muni: m.nome, ais: a.id })} />
              ))}
            </g>
          ))}
          {/* Contorno da AIS selecionada: traço grosso por baixo, preenchimento por cima esconde as divisas internas */}
          <g pointerEvents="none">
            {MUNICIPIOS_MAPA.filter(m => m.ais === sel).map(m => <path key={m.nome} d={m.d} fill="none" stroke="var(--ink)" strokeWidth={4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
            {MUNICIPIOS_MAPA.filter(m => m.ais === sel).map(m => <path key={m.nome} d={m.d} fill={cor(sel)} stroke={cor(sel)} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />)}
            {MUNICIPIOS_MAPA.filter(m => m.ais === sel).map(m => <path key={m.nome} d={m.d} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />)}
            {achado && <path d={achado.d} fill="none" stroke="var(--gold)" strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
          </g>
          {/* Rótulos */}
          <g pointerEvents="none" style={{ fontFamily: "inherit", fontWeight: 700 }}>
            {AIS_PE.filter(a => rmr ? DIM.has(a.id) : !DIM.has(a.id)).map(a => {
              const [x, y] = ROTULOS_AIS[a.id]
              return (
                <text key={a.id} x={x} y={y} fontSize={fs} textAnchor="middle" dominantBaseline="central" fill="var(--ink)"
                  stroke="#fff" strokeWidth={fs / 4.5} paintOrder="stroke" opacity={apagada(a.id) ? 0.35 : 1}>
                  {numeroRotulo(a.id)}{a.id === aisMinha ? <tspan fill="var(--gold)"> ★</tspan> : null}
                </text>
              )
            })}
          </g>
          {!rmr && (
            <g onClick={() => setRmr(true)} style={{ cursor: "pointer" }}>
              <rect x={CAIXA_RMR[0]} y={CAIXA_RMR[1]} width={CAIXA_RMR[2]} height={CAIXA_RMR[3]} fill="none" stroke="#1f8a4c" strokeWidth={1.5} strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />
              <text x={MAPA_LARGURA - 2} y={CAIXA_RMR[1] - 6} fontSize={12} textAnchor="end" fill="#1f8a4c" fontWeight={700} stroke="#fff" strokeWidth={3} paintOrder="stroke">AIS 1–10 · ampliar{aisMinha && DIM.has(aisMinha) ? " ★" : ""}</text>
            </g>
          )}
        </svg>
      </div>
      <div style={{ minHeight: 20, marginTop: 6, fontSize: 12.5, color: "var(--ink-60)", textAlign: "center" }}>
        {muniInfo ? <><strong style={{ color: "var(--ink)" }}>{muniInfo.muni}</strong> · {POR_ID.get(muniInfo.ais)!.rotulo} · {POR_ID.get(muniInfo.ais)!.nome}</>
          : <span className="sm:hidden">{rmr ? "Toque numa área para ver os detalhes" : "Arraste o mapa para ver o Sertão · toque numa área"}</span>}
      </div>

      {/* Legenda do modo */}
      {modo !== "areas" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 11.5, color: "var(--ink-60)", marginTop: 4, flexWrap: "wrap" }}>
          {modo === "turma" ? <>menos procurada<span style={{ width: 90, height: 8, borderRadius: 99, background: "linear-gradient(90deg, rgba(181,147,63,.12), rgba(181,147,63,1))" }} />mais procurada (1ª opção)</>
            : <>menos disputada<span style={{ width: 90, height: 8, borderRadius: 99, background: "linear-gradient(90deg, rgba(58,74,58,.15), rgba(58,74,58,.9))" }} />mais disputada (corte T1+T2)</>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: NEUTRO }} />{modo === "turma" ? "fora da escolha" : "sem dados"}</span>
        </div>
      )}
      {modo === "areas" && (
        <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11.5, color: "var(--ink-60)", marginTop: 4, flexWrap: "wrap" }}>
          {DIRETORIAS.map(d => <span key={d.id} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: d.cor }} /><strong style={{ color: "var(--ink)" }}>{d.id}</strong> {d.resumo}</span>)}
        </div>
      )}

      {/* Atalhos por AIS (também servem de navegação por teclado) */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "12px 0 14px" }}>
        {visiveis.map(a => (
          <button key={a.id} onClick={() => escolher(a.id)} title={`${a.rotulo} · ${a.nome}`}
            style={{ ...pilula(sel === a.id), padding: "4px 9px", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: a.cor, border: "1px solid rgba(0,0,0,.12)" }} />{numeroRotulo(a.id)}{a.id === aisMinha ? " ★" : ""}
          </button>
        ))}
      </div>

      {/* Painel da AIS */}
      <div style={{ borderTop: "1px solid var(--surface)", paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: ais.cor, alignSelf: "center" }} />
          <h3 style={{ ...titulo, fontSize: "1.15rem" }}>{ais.rotulo} · {ais.nome}</h3>
          <span style={{ fontSize: 12, color: "var(--ink-60)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: diretoria.cor, marginRight: 4 }} />{diretoria.id} · {ais.regiao} · {munis.length} {munis.length === 1 ? "município" : "municípios"}
          </span>
        </div>

        {/* PM */}
        <div style={{ marginTop: 12 }}>
          <div style={rotulo}>Polícia Militar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
            {ais.areas.map(r => (
              <div key={r.numero} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {ais.areas.length > 1 && <span style={{ fontSize: 12, color: "var(--ink-60)", minWidth: 58 }}>Área {String(r.numero).padStart(2, "0")}</span>}
                {r.militar.map(sig => {
                  const b = batalhoes.find(x => x.sigla === sig)
                  if (!b) return <span key={sig} style={{ padding: "5px 10px", borderRadius: 10, background: "var(--surface)", fontSize: 13, fontWeight: 600 }}>{sig}</span>
                  const rem = REM[sig]
                  const meu = minha1 === sig
                  return (
                    <Link key={sig} href={`/batalhoes/${b.slug}`} style={{ padding: "5px 10px", borderRadius: 10, border: meu ? "1.5px solid var(--gold)" : "1px solid rgba(58,74,58,0.2)", fontSize: 13, textDecoration: "none", color: "var(--ink)", background: "#fff" }}>
                      <strong style={{ color: "var(--olive)" }}>{sig}{meu ? " ★" : ""}</strong>
                      <span style={{ color: "var(--ink-60)", fontSize: 12 }}> · {b.opcao1} na 1ª · {rem?.vagasT2 ?? "—"} vagas T2 · corte {rem?.posT2 ? `${rem.posT2.pior}º` : "—"} ›</span>
                    </Link>
                  )
                })}
              </div>
            ))}
            {sel === "7" && batalhoes.some(b => b.sigla === "BPTur") && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <Link href="/batalhoes/bptur" style={{ padding: "5px 10px", borderRadius: 10, border: minha1 === "BPTur" ? "1.5px solid var(--gold)" : "1px solid rgba(58,74,58,0.2)", fontSize: 13, textDecoration: "none", color: "var(--ink)" }}>
                  <strong style={{ color: "var(--olive)" }}>BPTur{minha1 === "BPTur" ? " ★" : ""}</strong>
                  <span style={{ color: "var(--ink-60)", fontSize: 12 }}> · sede no Varadouro · {batalhoes.find(b => b.sigla === "BPTur")!.opcao1} na 1ª ›</span>
                </Link>
              </div>
            )}
          </div>
          {!DIM.has(sel) && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--ink-60)" }}>Fora da nossa escolha — referência para conhecer o estado, apoio entre áreas e remoções futuras.</p>}
        </div>

        {/* Integração */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
          <div><div style={rotulo}>Polícia Civil</div><div style={{ fontSize: 13, marginTop: 3 }}>{ais.areas.map(r => r.civil).join(" · ")}</div></div>
          <div><div style={rotulo}>Bombeiros</div><div style={{ fontSize: 13, marginTop: 3, lineHeight: 1.45 }}>{ais.areas.map(r => r.bombeiro).filter(x => x !== "—").join(" · ") || "—"}</div></div>
          <div><div style={rotulo}>Polícia Científica</div><div style={{ fontSize: 13, marginTop: 3 }}>{ais.areas.map(r => r.cientifica).filter(Boolean).join(" · ") || "—"}</div></div>
        </div>

        {/* Municípios */}
        <div style={{ marginTop: 14 }}>
          <div style={rotulo}>Municípios ({munis.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {munis.map(n => <span key={n} style={{ padding: "3px 9px", borderRadius: 999, fontSize: 12.5, background: achado?.nome === n ? "var(--gold)" : "var(--surface)", color: achado?.nome === n ? "#fff" : "var(--ink)" }}>{n}</span>)}
          </div>
          {sel === "1-5" && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-60)" }}>O Recife é dividido em 5 áreas (uma por batalhão); o mapa da SDS mostra a capital numa mancha só.</p>}
        </div>

        {prisoes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={rotulo}>Unidades prisionais na área ({prisoes.length})</div>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
              {prisoes.map(p => <li key={p.n}>{p.nome} <span style={{ color: "var(--ink-60)" }}>({p.municipio})</span></li>)}
            </ul>
          </div>
        )}

        <details style={{ marginTop: 14, fontSize: 13 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--olive)" }}>Unidades especializadas da {diretoria.id} — {diretoria.nome}</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.55, color: "var(--ink)" }}>
            {diretoria.especializadas.map(t => <li key={t}>{t}</li>)}
          </ul>
        </details>
      </div>

      <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
        Fora do mapa: {NORONHA.nome}, {NORONHA.resumo} ({NORONHA.unidades}). <strong>Escolha da turma</strong> soma a 1ª opção dos batalhões de cada AIS; <strong>Disputa</strong> usa o corte T1+T2 do batalhão mais disputado da área (mesma conta do comparativo). Fonte: {FONTE_AIS}; limites municipais do IBGE.
      </p>
    </section>
  )
}
