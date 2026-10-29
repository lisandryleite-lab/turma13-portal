"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import remuneracao from "@/lib/remuneracao-oficiais.json"
import criminalidade from "@/lib/criminalidade-batalhoes.json"

export type CardBatalhao = {
  sigla: string; slug: string; nome: string; sede: string; municipio: string
  opcao1: number; opcao2: number; comandante: string | null; mensagens: number
  t1: number; t2: number
}
export type Pendente = { mat: number; nome: string; pelotao: number | null }

type Pos = { melhor: number; pior: number; n: number } | null
export type Rem = { vagasT2: number; posT1: Pos; posT2: Pos; diarias: { total: number } | null }
type Crime = { cvli: { taxa2025: number; variacao: number | null }; compartilhado: string | null }
export const REM = remuneracao.porBatalhao as Record<string, Rem>
// Pior classificado de cada turma entre os aspirantes cruzados, e o batalhão para onde foi
const ultimo = (t: "posT1" | "posT2") => Object.entries(REM).reduce<[string, number] | null>((m, [o, r]) => r[t] && (!m || r[t]!.pior > m[1]) ? [o, r[t]!.pior] : m, null)
const ULTIMO = { T2: ultimo("posT2"), T1: ultimo("posT1") }
const AMOSTRA_MIN = 3
const TAMANHO = { posT2: 182, posT1: 148 } as const
// Disputa T1+T2: média do corte em % da turma, só com amostras suficientes (menor = mais disputado)
export const disputa = (r: Rem | undefined) => {
  const v = (["posT2", "posT1"] as const).flatMap(t => r?.[t] && r[t]!.n >= AMOSTRA_MIN ? [r[t]!.pior / TAMANHO[t]] : [])
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
const CRIME = criminalidade.porBatalhao as Record<string, Crime>

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const numero = (s: string) => Number(s.match(/\d+/)?.[0] ?? 999)
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)
const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.12)", padding: 18 }
const titulo: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }
const th: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "10px", borderTop: "1px solid var(--surface)", fontSize: 13.5, whiteSpace: "nowrap" }

type Ordem = "turma" | "vagas" | "disputa" | "diarias" | "seguranca"
const ORDENS: { id: Ordem; rot: string }[] = [
  { id: "turma", rot: "Mais escolhidos pela turma" },
  { id: "vagas", rot: "Mais vagas (T2)" },
  { id: "disputa", rot: "Mais disputados (T1+T2)" },
  { id: "diarias", rot: "Mais diárias" },
  { id: "seguranca", rot: "Menor violência" },
]

const mi = (v: number) => `R$ ${(v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`
const corCvli = (nivel: number) => nivel < 0.34 ? "#7aa36f" : nivel < 0.67 ? "#d6b45a" : "#c0704f"
const rotulo: React.CSSProperties = { fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.04em" }

// Corte = último colocado da T2 (destaque) e da T1 (secundário); cinza = poucos dados na amostra
function Corte({ r }: { r: Rem | undefined }) {
  const cinza = (p: Pos) => !p || p.n < AMOSTRA_MIN ? "var(--ink-60)" : undefined
  return (
    <span style={{ lineHeight: 1.25 }}>
      <strong title={r?.posT2 ? `T2 · ${r.posT2.n} na amostra` : undefined} style={{ fontSize: 15, color: cinza(r?.posT2 ?? null) }}>{r?.posT2 ? `${r.posT2.pior}º` : "—"}</strong>
      <span title={r?.posT1 ? `T1 · ${r.posT1.n} na amostra` : undefined} style={{ display: "block", fontSize: 11.5, color: "var(--ink-60)", opacity: r?.posT1 && r.posT1.n >= AMOSTRA_MIN ? 1 : 0.6 }}>T1 {r?.posT1 ? `${r.posT1.pior}º` : "—"}</span>
    </span>
  )
}

function Tendencia({ v }: { v: number | null }) {
  if (v == null) return null
  return <span style={{ fontSize: 12, color: v < 0 ? "#3a7a3a" : "var(--red)", fontWeight: 600 }}>{v < 0 ? "▼" : "▲"}{Math.abs(v)}%</span>
}

export function BatalhoesClient({ cards, respondentes, respondentesDaCia, totalAlunos, pendentes, minha, minhaMatricula, planilhaOk, planilhaUrl, formularioUrl, mapa }: {
  cards: CardBatalhao[]; respondentes: number; respondentesDaCia: number; totalAlunos: number; pendentes: Pendente[]
  minha: { opcao1: string; opcao2: string | null } | null; minhaMatricula: number
  planilhaOk: boolean; planilhaUrl: string; formularioUrl: string; mapa?: React.ReactNode
}) {
  const [ordem, setOrdem] = useState<Ordem>("turma")
  const [busca, setBusca] = useState("")
  const [verPendentes, setVerPendentes] = useState(false)
  const taxa = pct(respondentesDaCia, totalAlunos)
  const maxOp1 = Math.max(1, ...cards.map(c => c.opcao1))
  const taxas = cards.map(c => CRIME[c.sigla]?.cvli.taxa2025 ?? 0)
  const [tMin, tMax] = [Math.min(...taxas), Math.max(...taxas)]

  const linhas = useMemo(() => {
    const v = (c: CardBatalhao) => ordem === "turma" ? c.opcao1 : ordem === "vagas" ? (REM[c.sigla]?.vagasT2 ?? 0)
      : ordem === "disputa" ? -(disputa(REM[c.sigla]) ?? 9) : ordem === "diarias" ? (REM[c.sigla]?.diarias?.total ?? 0)
      : -(CRIME[c.sigla]?.cvli.taxa2025 ?? 999)
    return [...cards].sort((a, b) => v(b) - v(a) || numero(a.sigla) - numero(b.sigla))
  }, [cards, ordem])
  const emOrdem = useMemo(() => {
    const t = semAcento(busca.trim())
    return cards.filter(c => !t || semAcento(`${c.sigla} ${c.nome} ${c.sede} ${c.municipio}`).includes(t)).sort((a, b) => numero(a.sigla) - numero(b.sigla))
  }, [cards, busca])
  const pendPorPel = useMemo(() => {
    const g = new Map<string, Pendente[]>()
    for (const p of pendentes) { const k = p.pelotao ? `${p.pelotao}º Pelotão` : "Sem pelotão"; (g.get(k) ?? g.set(k, []).get(k)!).push(p) }
    return [...g.entries()]
  }, [pendentes])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Minha escolha */}
      <section style={{ ...cartao, background: "#3a4a3a", color: "#fff", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>Minha escolha</div>
          <div style={{ fontSize: 16, marginTop: 4 }}>
            {minha ? <>1ª <strong style={{ color: "#e0c979" }}>{minha.opcao1}</strong>{minha.opcao2 && <> · 2ª <strong style={{ color: "#e0c979" }}>{minha.opcao2}</strong></>}</> : "Você ainda não respondeu"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{taxa.toLocaleString("pt-BR")}% da CIA respondeu · faltam {pendentes.length}</div>
        </div>
        <a href={formularioUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 14px", borderRadius: 10, background: "#e0c979", color: "#2b2a27", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          {minha ? "Mudar escolha ↗" : "Escolher ↗"}
        </a>
      </section>
      {!planilhaOk && <p style={{ margin: 0, fontSize: 13, color: "var(--red)" }}>Não foi possível abrir a planilha da DAG agora.</p>}

      {/* Comparativo */}
      <section style={cartao}>
        <h2 style={titulo}>Compare os batalhões</h2>
        <p style={{ margin: "4px 0 12px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>O que pesa na escolha, lado a lado. Toque no batalhão para ver a ficha completa.</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {ORDENS.map(o => (
            <button key={o.id} onClick={() => setOrdem(o.id)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.18)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
              background: ordem === o.id ? "var(--olive)" : "#fff", color: ordem === o.id ? "var(--canvas)" : "var(--ink-60)" }}>{o.rot}</button>
          ))}
        </div>
        <p style={{ margin: "0 0 10px", padding: "8px 12px", borderRadius: 10, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)", fontSize: 13 }}>
          <strong>Pior classificado que vimos:</strong> {(["T2", "T1"] as const).map((t, i) => ULTIMO[t] && <span key={t}>{i > 0 && " · "}{t} {ULTIMO[t]![1]}º no <strong>{ULTIMO[t]![0]}</strong></span>)}
        </p>

        {/* Celular: cartões */}
        <div className="flex flex-col gap-2 sm:hidden">
          {linhas.map(c => {
            const r = REM[c.sigla], cr = CRIME[c.sigla]
            const t = cr?.cvli.taxa2025 ?? 0
            const meu = minha?.opcao1 === c.sigla
            return (
              <Link key={c.slug} href={`/batalhoes/${c.slug}`} style={{ display: "block", padding: "12px 14px", borderRadius: 12, border: meu ? "1.5px solid var(--gold)" : "1px solid rgba(58,74,58,0.12)", textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <strong style={{ color: "var(--olive)", fontSize: 15.5 }}>{c.sigla}{meu ? " ★" : ""}</strong>
                  <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}><strong style={{ color: "var(--ink)" }}>{c.opcao1}</strong> na 1ª opção · {pct(c.opcao1, respondentes).toLocaleString("pt-BR")}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "var(--surface)", margin: "6px 0 10px" }}>
                  <div style={{ height: "100%", width: `${(c.opcao1 / maxOp1) * 100}%`, borderRadius: 99, background: "var(--gold)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  <div><div style={rotulo}>Vagas T2</div><strong style={{ fontSize: 15 }}>{r?.vagasT2 ?? "—"}</strong></div>
                  <div><div style={rotulo}>Corte</div><Corte r={r} /></div>
                  <div><div style={rotulo}>Diárias</div><strong style={{ fontSize: 13.5 }}>{r?.diarias ? mi(r.diarias.total).replace("R$ ", "") : "—"}</strong></div>
                  <div><div style={rotulo}>CVLI</div><strong style={{ fontSize: 13.5 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, marginRight: 4, background: corCvli(tMax > tMin ? (t - tMin) / (tMax - tMin) : 0) }} />{t.toLocaleString("pt-BR")}</strong></div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Computador: tabela */}
        <div className="hidden sm:block" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={th}>Batalhão</th><th style={th}>Turma (1ª opção)</th><th style={th}>Vagas T2</th><th style={th}>Corte</th><th style={th}>Diárias 2026</th><th style={th}>CVLI /100 mil</th>
            </tr></thead>
            <tbody>
              {linhas.map(c => {
                const r = REM[c.sigla], cr = CRIME[c.sigla]
                const t = cr?.cvli.taxa2025 ?? 0
                const meu = minha?.opcao1 === c.sigla
                return (
                  <tr key={c.slug}>
                    <td style={td}><Link href={`/batalhoes/${c.slug}`} style={{ color: "var(--olive)", fontWeight: 700, textDecoration: "none" }}>{c.sigla}{meu ? " ★" : ""}</Link></td>
                    <td style={{ ...td, minWidth: 120 }}>
                      <span style={{ display: "inline-block", width: 60, height: 8, borderRadius: 99, background: "var(--surface)", verticalAlign: "middle", marginRight: 8 }}>
                        <span style={{ display: "block", height: "100%", width: `${(c.opcao1 / maxOp1) * 100}%`, borderRadius: 99, background: "var(--gold)" }} />
                      </span>
                      <strong>{c.opcao1}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>{pct(c.opcao1, respondentes).toLocaleString("pt-BR")}%</span>
                    </td>
                    <td style={td}>{r?.vagasT2 ?? "—"}</td>
                    <td style={td}><Corte r={r} /></td>
                    <td style={td}>{r?.diarias ? mi(r.diarias.total) : "—"}</td>
                    <td style={td}>
                      <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, marginRight: 6, background: corCvli(tMax > tMin ? (t - tMin) / (tMax - tMin) : 0) }} />
                      {t.toLocaleString("pt-BR")} <Tendencia v={cr?.cvli.variacao ?? null} />{cr?.compartilhado ? <span style={{ color: "var(--ink-60)", fontSize: 11 }}> *</span> : ""}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
          <strong>Corte</strong>: classificação do último aspirante da turma visto no batalhão (T2 de 1º a 182º; embaixo, a T1, de 1º a 148º) — quanto menor, mais disputado. Em cinza: menos de {AMOSTRA_MIN} aspirantes na amostra. “Mais disputados” junta T1 e T2: média do corte em % de cada turma, ignorando as amostras em cinza. A amostra só tem quem recebeu função publicada no BGSDS.
          <strong> Diárias</strong>: pagas em 2026 citando o batalhão (todo o efetivo).
          <strong> CVLI</strong>: mortes violentas por 100 mil habitantes (2025) e variação jan–set 2026. * dado do município inteiro (Recife ou Jaboatão).
          Fontes: <a href="https://www.sds.pe.gov.br/estatisticas/crimes-violentos-letais-intencionais" target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>SDS</a>, <a href="https://sidra.ibge.gov.br/tabela/4709" target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>IBGE</a>, quadro de vagas da escolha da T2 e boletins da SDS · <a href={planilhaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>planilha da DAG</a>.
        </p>
      </section>

      <Link href="/batalhoes/remuneracao" style={{ ...cartao, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "var(--ink)", background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)" }}>
        <span style={{ fontSize: 13.5 }}><strong>Salário:</strong> é o mesmo em qualquer batalhão — o que muda é a função. Veja quanto ganha cada uma e a previsão para a nossa turma.</span>
        <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 18 }}>›</span>
      </Link>
      <Link href="/batalhoes/carreira" style={{ ...cartao, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "var(--ink)", background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)" }}>
        <span style={{ fontSize: 13.5 }}><strong>Simulador de carreira:</strong> quando você chega a 1º Ten, Capitão, Major… pela sua classificação, com as regras de promoção da LC nº 470/2021.</span>
        <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 18 }}>›</span>
      </Link>

      {mapa}

      {/* Batalhões */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <h2 style={titulo}>Fichas</h2>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar batalhão, bairro ou cidade"
            style={{ flex: "1 1 220px", maxWidth: 320, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.25)", background: "#fff", fontSize: 14 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {emOrdem.map(c => {
            const meu = minha?.opcao1 === c.sigla
            return (
              <Link key={c.slug} href={`/batalhoes/${c.slug}`} style={{ ...cartao, padding: 14, textDecoration: "none", color: "var(--ink)", border: meu ? "1.5px solid var(--gold)" : cartao.border }}>
                <div style={{ fontFamily: "var(--serif-cfo)", fontWeight: 700, fontSize: "1.2rem", color: "var(--olive)" }}>{c.sigla}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 2 }}>{c.sede}, {c.municipio}</div>
                <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink-60)" }}>{c.opcao1} na 1ª opção · {REM[c.sigla]?.vagasT2 ?? "—"} vagas T2{c.mensagens > 0 ? ` · ${c.mensagens} 💬` : ""}</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quem falta */}
      <section style={cartao}>
        <button onClick={() => setVerPendentes(v => !v)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ ...titulo, fontSize: "1.05rem" }}>Quem falta escolher <span style={{ color: "var(--red)" }}>({pendentes.length})</span></span>
          <span style={{ color: "var(--ink-60)", transform: verPendentes ? "rotate(180deg)" : "none" }}>▾</span>
        </button>
        {verPendentes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {pendentes.length === 0 ? <p style={{ margin: 0, fontSize: 13.5, color: "var(--olive)" }}>Todos já responderam.</p> : pendPorPel.map(([pel, ps]) => (
              <div key={pel}>
                <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{pel} ({ps.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ps.map(p => <span key={p.mat} style={{ padding: "3px 9px", borderRadius: 999, fontSize: 12.5, background: p.mat === minhaMatricula ? "var(--gold)" : "var(--surface)", color: p.mat === minhaMatricula ? "#fff" : "var(--ink)" }}>{p.mat} {p.nome}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
