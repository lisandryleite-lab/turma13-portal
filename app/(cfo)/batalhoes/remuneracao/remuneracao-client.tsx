"use client"

import { useState } from "react"
import dados from "@/lib/remuneracao-oficiais.json"

type Linha = { n: number; bruto: number; liquido: number; remuneracao: number; gratificacao: number | null } | null
type Turma = { rotulo: string; mes: string; quando: string; pessoas: number; soldo: number; bruto: number; liquido: number; distribuicao: Record<string, number>; porFuncao: Record<string, Linha>; extras: { pessoas: number; pct: number; mediana: number | null } }

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.12)", padding: "20px 20px 22px" }
const titulo: React.CSSProperties = { margin: "0 0 6px", fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)" }
const sub: React.CSSProperties = { margin: "0 0 14px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.6 }
const th: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "10px", borderTop: "1px solid var(--surface)", fontSize: 14, whiteSpace: "nowrap" }
const brl = (v: number | null | undefined) => v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const FUNCOES = ["Sem função", "Função de supervisão (FGS)", "Comandante de pelotão", "Comandante de companhia"] as const
const COR = { "Sem função": "#c9cfc4", "Função de supervisão (FGS)": "#8a9a7b", "Comandante de pelotão": "#b5933f", "Comandante de companhia": "#3a4a3a" } as const
type Aba = "ganho" | "historico"

export function RemuneracaoClient() {
  const [aba, setAba] = useState<Aba>("ganho")
  const turmas = dados.turmas as Turma[]
  const [t1asp, t2asp, t1ten] = turmas
  const cel = (l: Linha) => !l ? <span style={{ color: "var(--ink-60)" }}>—</span> : l.n < 3 ? <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>poucos casos</span>
    : <><strong>{brl(l.liquido)}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>líquido</span><br /><span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>{brl(l.bruto)} bruto · {l.n} pessoas</span></>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <nav style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(58,74,58,0.15)" }}>
        {([["ganho", "Quanto ganha"], ["historico", "Histórico e previsão"]] as const).map(([id, rot]) => (
          <button key={id} onClick={() => setAba(id)} style={{ padding: "9px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
            fontWeight: aba === id ? 700 : 500, color: aba === id ? "var(--olive)" : "var(--ink-60)", borderBottom: aba === id ? "2px solid var(--gold)" : "2px solid transparent", marginBottom: -1 }}>{rot}</button>
        ))}
      </nav>

      <section style={cartao}>
        {aba === "ganho" && (
          <>
            <h2 style={titulo}>Quanto ganha cada função</h2>
            <p style={sub}>Folha de {t2asp.mes}, mediana mensal. O valor não depende do batalhão — depende da função.</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Função</th><th style={th}>Aspirante</th><th style={th}>2º Tenente</th></tr></thead>
                <tbody>
                  {FUNCOES.map(f => (
                    <tr key={f}>
                      <td style={{ ...td, whiteSpace: "normal" }}><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: COR[f], marginRight: 8 }} />{f}</td>
                      <td style={td}>{cel(t2asp.porFuncao[f])}</td>
                      <td style={td}>{cel(t1ten.porFuncao[f])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ ...sub, margin: "14px 0 0" }}>
              Soldo: aspirante {brl(dados.soldos["09/2026"].aspirante)} · 2º Ten {brl(dados.soldos["09/2026"].segundoTenente)}.
              Além disso, parte recebe jornada extra/diárias em linha separada (mediana {brl(t2asp.extras.mediana)}–{brl(t1ten.extras.mediana)} para quem recebe), não somadas acima.
            </p>
          </>
        )}

        {aba === "historico" && (
          <>
            <h2 style={titulo}>O que aconteceu com as turmas anteriores</h2>
            <p style={sub}>Mesma fase da carreira, turmas diferentes (folha oficial). Barra = distribuição das funções.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[t1asp, t2asp, t1ten].map(t => (
                <div key={t.rotulo}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", fontSize: 13.5 }}>
                    <strong style={{ color: "var(--olive)" }}>{t.rotulo}</strong>
                    <span style={{ color: "var(--ink-60)" }}>{t.quando} · líquido típico <strong style={{ color: "var(--ink)" }}>{brl(t.liquido)}</strong></span>
                  </div>
                  <div style={{ display: "flex", height: 14, borderRadius: 99, overflow: "hidden", background: "var(--surface)", marginTop: 6 }}>
                    {FUNCOES.map(f => t.distribuicao[f] > 0 && <span key={f} title={`${f}: ${t.distribuicao[f]}%`} style={{ width: `${t.distribuicao[f]}%`, background: COR[f] }} />)}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4, fontSize: 11.5, color: "var(--ink-60)" }}>
                    {FUNCOES.map(f => <span key={f}>{f} {t.distribuicao[f]}%</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 20 }}>
              {([["Nossa turma como aspirante", dados.previsao.aspirante], ["Nossa turma como 2º Ten", dados.previsao.segundoTenente]] as const).map(([rot, p]) => (
                <div key={rot} style={{ padding: 14, borderRadius: 12, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{rot}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{p.periodo}</div>
                  <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 24, fontWeight: 700, color: "var(--olive)", marginTop: 6 }}>{brl(p.liquidoEsperado)}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-60)" }}>líquido esperado · {brl(p.brutoEsperado)} bruto</div>
                </div>
              ))}
            </div>
            <p style={{ ...sub, margin: "12px 0 0" }}>Previsão do portal (não oficial): valores de {t2asp.mes}, sem reajustes futuros, com a mesma distribuição de funções das turmas anteriores. Promoção a 2º Ten após 6 meses (LC nº 470/2021). Como faltam capitães e 1º tenentes na PMPE, o comando chega rápido: 76% da T1 já comanda pelotão ou companhia.</p>
          </>
        )}
      </section>

      <details style={{ padding: "0 4px" }}>
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink-60)" }}>Fontes e método</summary>
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.6 }}>
          {dados.fontes.filter(f => !/Diárias|SUNOR|INCG|LC nº 152/.test(f.rotulo)).map(f => <div key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{f.rotulo} ↗</a></div>)}
          <p style={{ margin: "8px 0 0", color: "var(--ink-60)" }}>Dados públicos (Lei nº 12.527/2011). Só medianas por turma e função — nenhum salário individual; grupos com menos de 3 pessoas não aparecem. Turmas identificadas pelos atos de nomeação. Atualizado em {dados.atualizado}.</p>
        </div>
      </details>
    </div>
  )
}
