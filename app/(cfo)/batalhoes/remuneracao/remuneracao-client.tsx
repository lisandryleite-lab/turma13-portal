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
type Aba = "ganho" | "extras" | "historico"
type Grat = { simbolo: string; funcao: string; quant: number; valor: number; designados: { asp: number; ten: number } }
type Diarias = { total: number; pagamentos: number; mediana: number; principais: { operacao: string; valor: number }[] } | null
const mi = (v: number) => `R$ ${(v / 1e6).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`

export function RemuneracaoClient() {
  const [aba, setAba] = useState<Aba>("ganho")
  const turmas = dados.turmas as Turma[]
  const [t1asp, t2asp, t1ten] = turmas
  const g = dados.gratificacoes
  const diarias = Object.entries(dados.porBatalhao as Record<string, { diarias: Diarias }>)
    .flatMap(([o, p]) => p.diarias ? [[o, p.diarias] as const] : []).sort((a, b) => b[1].total - a[1].total)
  const maxDiarias = Math.max(1, ...diarias.map(([, d]) => d.total))
  const medianaDiaria = diarias.map(([, d]) => d.mediana).sort((a, b) => a - b)[Math.floor(diarias.length / 2)] ?? 0
  const tabelaGrat = (itens: Grat[]) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th style={th}>Símbolo</th><th style={th}>Função</th><th style={th}>Valor/mês</th><th style={th}>T1/T2 designados</th></tr></thead>
        <tbody>
          {itens.map(i => {
            const tem = i.designados.asp + i.designados.ten > 0
            return (
              <tr key={i.simbolo} style={{ background: tem ? "#fbf7ec" : undefined }}>
                <td style={{ ...td, fontWeight: 700, color: "var(--olive)" }}>{i.simbolo}</td>
                <td style={{ ...td, whiteSpace: "normal", fontSize: 13.5, minWidth: 180 }}>{i.funcao}</td>
                <td style={td}><strong>{brl(i.valor)}</strong></td>
                <td style={{ ...td, fontSize: 13 }}>{tem ? <>{i.designados.asp} asp · {i.designados.ten} 2º Ten</> : <span style={{ color: "var(--ink-60)" }}>nenhum</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
  const cel = (l: Linha) => !l ? <span style={{ color: "var(--ink-60)" }}>—</span> : l.n < 3 ? <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>poucos casos</span>
    : <><strong>{brl(l.liquido)}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>líquido</span><br /><span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>{brl(l.bruto)} bruto · {l.n} pessoas</span></>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <nav style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(58,74,58,0.15)" }}>
        {([["ganho", "Quanto ganha"], ["extras", "Gratificações e extras"], ["historico", "Histórico e previsão"]] as const).map(([id, rot]) => (
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
              Além disso, parte recebe jornada extra/diárias em linha separada (mediana {brl(t2asp.extras.mediana)}–{brl(t1ten.extras.mediana)} para quem recebe), não somadas acima — veja a aba Gratificações e extras.
            </p>
          </>
        )}

        {aba === "extras" && (
          <>
            <h2 style={titulo}>Norte: aspirante com 2 plantões de PJES por mês</h2>
            <p style={sub}>Bruto típico da folha de {t2asp.mes} (já inclui a gratificação da função) + 2 × {brl(g.pjes.valorOficial)} de PJES.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 6 }}>
              {(["Sem função", "Função de supervisão (FGS)", "Comandante de pelotão"] as const).map(f => {
                const l = t2asp.porFuncao[f]
                return (
                  <div key={f} style={{ padding: 12, borderRadius: 12, background: "var(--surface)", borderLeft: `4px solid ${COR[f]}` }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{f}</div>
                    <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 22, fontWeight: 700, color: "var(--olive)" }}>{l ? brl(l.bruto + 2 * g.pjes.valorOficial) : "—"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{l ? `${brl(l.bruto)} + ${brl(2 * g.pjes.valorOficial)} PJES` : ""}</div>
                  </div>
                )
              })}
            </div>

            <h2 style={{ ...titulo, marginTop: 22 }}>Gratificações de comando (GEC)</h2>
            <p style={sub}>{g.gec.norma}. Paga enquanto a pessoa está designada. Em destaque, as que as turmas anteriores já ocuparam.</p>
            {tabelaGrat(g.gec.itens)}

            <h2 style={{ ...titulo, marginTop: 22 }}>Funções de supervisão (FGS)</h2>
            <p style={sub}>{g.fgs.norma}.</p>
            {tabelaGrat(g.fgs.itens)}
            <p style={{ ...sub, margin: "8px 0 0", fontSize: 12 }}>
              Designados: {g.designadosFonte} Na PMPE inteira há {g.gec.itens.find(i => i.simbolo === "GEC-2")?.quant} GEC-2, {g.gec.itens.find(i => i.simbolo === "GEC-3")?.quant} GEC-3, {g.fgs.itens[0].quant} FGS-2 e {g.fgs.itens[1].quant} FGS-3 (Quadro de Alocação de Gratificações — INCG nº 605, SUNOR nº 62/2023).
            </p>

            <h2 style={{ ...titulo, marginTop: 22 }}>PJES — jornada extra</h2>
            <p style={{ ...sub, margin: "0 0 4px" }}>
              <strong style={{ fontSize: 18, color: "var(--olive)" }}>{brl(g.pjes.valorOficial)}</strong> por {g.pjes.unidade} (oficial; praça {brl(g.pjes.valorPraca)}). {g.pjes.obs}
            </p>
            <p style={{ ...sub, margin: 0 }}>
              Na folha (mediana de quem recebeu extras): T1 aspirante {brl(t1asp.extras.mediana)} ({t1asp.extras.pct}%) · T2 aspirante {brl(t2asp.extras.mediana)} ({t2asp.extras.pct}%) · T1 2º Ten {brl(t1ten.extras.mediana)} ({t1ten.extras.pct}%) — cerca de 1, 2 e 4 plantões por mês.
            </p>

            <h2 style={{ ...titulo, marginTop: 22 }}>Diárias por batalhão — 2026</h2>
            <p style={sub}>Pagas até {dados.diariasAte} citando o batalhão (todo o efetivo). Diária típica {brl(medianaDiaria)}. Mais diárias = mais operação paga.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {diarias.map(([o, d], i) => (
                <div key={o} title={d.principais.filter(x => !/^Outras/.test(x.operacao)).map(x => x.operacao).join(" · ")}
                  style={{ display: "grid", gridTemplateColumns: "84px 1fr 78px", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span><span style={{ color: "var(--ink-60)", fontSize: 11.5 }}>{i + 1}º</span> <strong style={{ color: "var(--olive)" }}>{o}</strong></span>
                  <span style={{ height: 8, borderRadius: 99, background: "var(--surface)" }}>
                    <span style={{ display: "block", width: `${(d.total / maxDiarias) * 100}%`, height: "100%", borderRadius: 99, background: "var(--gold)" }} />
                  </span>
                  <strong style={{ textAlign: "right" }}>{mi(d.total)}</strong>
                </div>
              ))}
            </div>

            <details style={{ marginTop: 20 }}>
              <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--olive)" }}>Funções de comando previstas por batalhão (SUNOR nº 62/2023 · INCG nº 605)</summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, marginTop: 10 }}>
                {Object.entries(dados.funcoesComando).map(([o, v]) => (
                  <div key={o} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)", fontSize: 12.5, lineHeight: 1.55 }}>
                    <strong style={{ color: "var(--olive)" }}>{o}</strong><br />
                    Cmt de companhia (GEC-2): {v.cpm.length ? v.cpm.join(", ") : "—"}<br />
                    Cmt de pelotão (GEC-3): {v.pelotoes.length ? v.pelotoes.join(", ") : "—"}
                  </div>
                ))}
              </div>
            </details>
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
            <h3 style={{ ...titulo, fontSize: "1.02rem", margin: "22px 0 4px" }}>T1 no aspirantado, mês a mês</h3>
            <p style={{ ...sub, margin: "0 0 10px" }}>Quando a gratificação começou a chegar (folha oficial; % dos aspirantes da T1 em cada situação).</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Folha</th>{FUNCOES.map(f => <th key={f} style={th}>{f.replace("Função de supervisão (FGS)", "FGS").replace("Comandante de ", "Cmt ")}</th>)}</tr></thead>
                <tbody>
                  {dados.t1Linha.map(l => (
                    <tr key={l.mes}>
                      <td style={{ ...td, fontWeight: 600 }}>{l.mes}</td>
                      {FUNCOES.map(f => <td key={f} style={{ ...td, color: (l.distribuicao as Record<string, number>)[f] ? "var(--ink)" : "var(--ink-60)" }}>{(l.distribuicao as Record<string, number>)[f]}%</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ ...sub, margin: "8px 0 0", fontSize: 12 }}>
              {dados.t1LinhaNota} Remuneração típica do aspirante em mai/2026: sem função {brl(dados.t1Linha[5].remuneracao["Sem função"])} · FGS {brl(dados.t1Linha[5].remuneracao["Função de supervisão (FGS)"])} · cmt pelotão {brl(dados.t1Linha[5].remuneracao["Comandante de pelotão"])} · cmt companhia {brl(dados.t1Linha[5].remuneracao["Comandante de companhia"])}.
            </p>
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
          {dados.fontes.filter(f => !/LC nº 152/.test(f.rotulo)).map(f => <div key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{f.rotulo} ↗</a></div>)}
          <p style={{ margin: "8px 0 0", color: "var(--ink-60)" }}>Dados públicos (Lei nº 12.527/2011). Só medianas por turma e função — nenhum salário individual; grupos com menos de 3 pessoas não aparecem. Turmas identificadas pelos atos de nomeação. Atualizado em {dados.atualizado}.</p>
        </div>
      </details>
    </div>
  )
}
