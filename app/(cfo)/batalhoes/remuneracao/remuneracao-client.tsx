"use client"

import { useState } from "react"
import dados from "@/lib/remuneracao-oficiais.json"

type Linha = { n: number; bruto: number; liquido: number; remuneracao: number; gratificacao: number | null } | null
type Turma = { rotulo: string; mes: string; quando: string; pessoas: number; soldo: number; bruto: number; liquido: number; distribuicao: Record<string, number>; porFuncao: Record<string, Linha>; extras: { pessoas: number; pct: number; mediana: number | null } }

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 20px 22px" }
const titulo: React.CSSProperties = { margin: "0 0 6px", fontFamily: "var(--serif-cfo)", fontSize: "1.25rem", color: "var(--olive)" }
const sub: React.CSSProperties = { margin: "0 0 16px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.6 }
const th: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontSize: 11.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }
const td: React.CSSProperties = { padding: "10px", borderTop: "1px solid var(--surface)", fontSize: 14, whiteSpace: "nowrap" }
const brl = (v: number | null | undefined) => v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const FUNCOES = ["Sem função", "Função de supervisão (FGS)", "Comandante de pelotão", "Comandante de companhia"] as const
const COR = { "Sem função": "#c9cfc4", "Função de supervisão (FGS)": "#8a9a7b", "Comandante de pelotão": "#b5933f", "Comandante de companhia": "#3a4a3a" } as const
type Aba = "funcao" | "turmas" | "previsao" | "batalhao" | "efetivo" | "fontes"
type Pos = { n: number; melhor: number; mediana: number; pior: number } | null
type PorBat = { posT1: Pos; posT2: Pos; vagasT2: number; t2ComFuncao: number; pctT2: number; t2NoComando: number; t1ComFuncao: number; diarias: { total: number; pagamentos: number; mediana: number; principais: { operacao: string; valor: number }[] } | null }
type Ordem = "vagasT2" | "pctT2" | "t1ComFuncao" | "diarias" | "posT2"
const ABAS: { id: Aba; rot: string }[] = [
  { id: "funcao", rot: "💵 Por função" }, { id: "turmas", rot: "📊 Comparação entre turmas" }, { id: "previsao", rot: "🔮 Nossa previsão" }, { id: "batalhao", rot: "🏢 Por batalhão" },
  { id: "efetivo", rot: "🧩 Efetivo e funções" }, { id: "fontes", rot: "📚 Fontes" },
]

export function RemuneracaoClient() {
  const [aba, setAba] = useState<Aba>("funcao")
  const [ordem, setOrdem] = useState<Ordem>("vagasT2")
  const porBat = dados.porBatalhao as Record<string, PorBat>
  const valorOrdem = (p: PorBat) => ordem === "diarias" ? (p.diarias?.total ?? 0) : ordem === "posT2" ? -(p.posT2?.mediana ?? 999) : p[ordem]
  const linhasBat = Object.entries(porBat).sort((a, b) => valorOrdem(b[1]) - valorOrdem(a[1]))
  const maxDiarias = Math.max(1, ...Object.values(porBat).map(p => p.diarias?.total ?? 0))
  const turmas = dados.turmas as Turma[]
  const [t1asp, t2asp, t1ten] = turmas

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ margin: 0, padding: "10px 14px", borderRadius: 12, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)", fontSize: 13, lineHeight: 1.6 }}>
        🔓 <strong>Dados públicos</strong> (Lei de Acesso à Informação — Lei nº 12.527/2011), divulgados pelo Governo de Pernambuco no Portal da Transparência e no Portal de Dados Abertos.
        Aqui aparecem <strong>só medianas e percentuais por turma e função</strong> — nenhum salário individual (grupos com menos de 3 pessoas não são exibidos). Valores brutos e líquidos do mês, sem férias e 13º.
      </p>

      <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
              background: aba === a.id ? "var(--olive)" : "#fff", color: aba === a.id ? "var(--canvas)" : "var(--ink-60)", boxShadow: aba === a.id ? "none" : "inset 0 0 0 1px rgba(58,74,58,0.18)" }}>{a.rot}</button>
        ))}
      </nav>

      <section style={cartao}>
        {aba === "funcao" && (
          <>
            <h2 style={titulo}>Quanto ganha cada função</h2>
            <p style={sub}>Folha de {t2asp.mes} · mediana de quem recebeu o mês normal. O valor do comando de pelotão e de companhia é praticamente o mesmo para aspirante e 2º Ten — o que muda o salário é a função, não o batalhão.</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Função</th><th style={th}>Aspirante (T2)</th><th style={th}>2º Tenente (T1)</th></tr></thead>
                <tbody>
                  {FUNCOES.map(f => {
                    const a = t2asp.porFuncao[f], b = t1ten.porFuncao[f]
                    const cel = (l: Linha) => l && l.n < 3 ? <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>menos de 3 pessoas — não exibido</span> : l ? <><strong>{brl(l.bruto)}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>bruto</span><br /><span style={{ color: "var(--olive)" }}>{brl(l.liquido)}</span> <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>líquido · {l.n} pessoas</span></> : <span style={{ color: "var(--ink-60)" }}>—</span>
                    return (
                      <tr key={f}>
                        <td style={{ ...td, whiteSpace: "normal" }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: COR[f], marginRight: 8 }} />{f}</td>
                        <td style={td}>{cel(a)}</td>
                        <td style={td}>{cel(b)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 18 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>Soldo (09/2026)</strong><br />Aspirante: {brl(dados.soldos["09/2026"].aspirante)}<br />2º Tenente: {brl(dados.soldos["09/2026"].segundoTenente)}
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>Função de supervisão (FGS)</strong><br />Gratificação na folha: {brl(t2asp.porFuncao["Função de supervisão (FGS)"]?.gratificacao)} (aspirante) · {brl(t1ten.porFuncao["Função de supervisão (FGS)"]?.gratificacao)} (2º Ten). São as seções de Planejamento, Pessoal, Ensino, Correcional, Secretaria.
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>Pagamentos extras</strong><br />{t1ten.extras.pct}% da T1 e {t2asp.extras.pct}% da T2 tiveram créditos em linha separada da folha (mediana {brl(t1ten.extras.mediana)} e {brl(t2asp.extras.mediana)}). O arquivo não detalha a natureza — não somados aos valores acima.
              </div>
            </div>
          </>
        )}

        {aba === "turmas" && (
          <>
            <h2 style={titulo}>Comparação entre as turmas</h2>
            <p style={sub}>Mesma fase da carreira, turmas diferentes. Turma identificada pelos nomes dos atos de nomeação (BGSDS nº 221 e 103). Entre mar e set/2026 o soldo foi reajustado (aspirante {brl(dados.soldos["03/2026"].aspirante)} → {brl(dados.soldos["09/2026"].aspirante)}).</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[t1asp, t2asp, t1ten].map(t => (
                <div key={t.rotulo} style={{ padding: "14px 16px", borderRadius: 14, background: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                    <strong style={{ fontSize: 15, color: "var(--olive)" }}>{t.rotulo}</strong>
                    <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}>folha {t.mes} · {t.quando} · {t.pessoas} pessoas</span>
                  </div>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "10px 0" }}>
                    <span style={{ fontSize: 13.5 }}>Soldo <strong>{brl(t.soldo)}</strong></span>
                    <span style={{ fontSize: 13.5 }}>Bruto (mediana) <strong>{brl(t.bruto)}</strong></span>
                    <span style={{ fontSize: 13.5 }}>Líquido (mediana) <strong style={{ color: "var(--olive)" }}>{brl(t.liquido)}</strong></span>
                  </div>
                  <div style={{ display: "flex", height: 16, borderRadius: 99, overflow: "hidden", background: "#fff" }}>
                    {FUNCOES.map(f => t.distribuicao[f] > 0 && <span key={f} title={`${f}: ${t.distribuicao[f]}%`} style={{ width: `${t.distribuicao[f]}%`, background: COR[f] }} />)}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, fontSize: 12.5 }}>
                    {FUNCOES.map(f => <span key={f}><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: COR[f], marginRight: 5 }} />{f} <strong>{t.distribuicao[f]}%</strong></span>)}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ ...sub, margin: "16px 0 0" }}>Leitura: a T1 começou com mais comando (16% já comandavam companhia como aspirante); a T2, maior, começou com mais gente sem função (66%). Como 2º Ten, 76% da T1 comanda pelotão ou companhia.</p>
          </>
        )}

        {aba === "previsao" && (
          <>
            <h2 style={titulo}>Nossa previsão — CFO 2026 (3ª turma do concurso de 2023, formatura 15/12/2026)</h2>
            <p style={sub}>Estimativa do portal, não oficial: usa os valores de 09/2026 (sem reajustes futuros) e a distribuição de funções das turmas anteriores na mesma fase. O líquido varia com dependentes e descontos.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {([["🎓 Aspirante", dados.previsao.aspirante], ["⭐ 2º Tenente", dados.previsao.segundoTenente]] as const).map(([rot, p]) => (
                <div key={rot} style={{ padding: "16px", borderRadius: 14, background: "var(--surface)", borderLeft: "4px solid var(--gold)" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{rot}</p>
                  <p style={{ margin: "2px 0 10px", fontSize: 12.5, color: "var(--ink-60)" }}>{p.periodo}</p>
                  <p style={{ margin: 0, fontSize: 13.5 }}>Soldo {brl(p.soldo)}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13.5 }}>Bruto esperado <strong style={{ fontSize: 18 }}>{brl(p.brutoEsperado)}</strong></p>
                  <p style={{ margin: "2px 0 0", fontSize: 13.5 }}>Líquido esperado <strong style={{ fontSize: 18, color: "var(--olive)" }}>{brl(p.liquidoEsperado)}</strong></p>
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--ink-60)" }}>Base: {p.base}.</p>
                </div>
              ))}
            </div>
            <p style={{ margin: "18px 0 8px", fontSize: 13.5, fontWeight: 700 }}>Faixa por função (valores de 09/2026)</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, lineHeight: 1.5 }}>
              {FUNCOES.map(f => { const a = t2asp.porFuncao[f], b = t1ten.porFuncao[f]; return <li key={f}><strong>{f}:</strong> aspirante {a && a.n >= 3 ? `${brl(a.liquido)} líquido` : "poucos casos"} · 2º Ten {b && b.n >= 3 ? `${brl(b.liquido)} líquido` : "poucos casos"}</li> })}
            </ul>
            <p style={{ ...sub, margin: "14px 0 0" }}>Promoção a 2º Ten após 6 meses de estágio probatório (LC nº 470/2021, Anexo V). Se a nossa turma seguir a T2, cerca de 2 em cada 3 começam sem função gratificada e o salário sobe quando assumem pelotão ou companhia.</p>
          </>
        )}

        {aba === "batalhao" && (
          <>
            <h2 style={titulo}>Comparação por batalhão</h2>
            <p style={sub}>
              <strong>Vagas da T2</strong>: quadro oficial da escolha de {dados.escolhaT2.data} ({dados.escolhaT2.local}), {dados.escolhaT2.total} vagas. {dados.escolhaT2.regra}<br />
              <strong>Posição</strong>: mediana da classificação no CFO dos aspirantes vistos no batalhão (T2 de 1º a 182º; T1 de 1º a 148º) — quanto menor, mais cedo o batalhão foi escolhido. Amostra: {dados.posicoes.cruzados} aspirantes com função publicada e nome na lista de nomeação.<br />
              <strong>Com função</strong>: aspirantes com designação publicada no Boletim da SDS (dez/2025–out/2026). <strong>Diárias</strong>: diárias operacionais pagas em 2026 (até {dados.diariasAte}) cuja finalidade cita o batalhão — todo o efetivo da unidade, não só aspirantes.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-60)", alignSelf: "center" }}>Ordenar por:</span>
              {([["vagasT2", "Vagas T2"], ["posT2", "Mais disputado (posição T2)"], ["pctT2", "% T2 com função"], ["t1ComFuncao", "T1 com função"], ["diarias", "Diárias 2026"]] as const).map(([k, r]) => (
                <button key={k} onClick={() => setOrdem(k)} style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: ordem === k ? "var(--olive)" : "#fff", color: ordem === k ? "var(--canvas)" : "var(--ink-60)" }}>{r}</button>
              ))}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Batalhão</th><th style={th}>Vagas T2</th><th style={th}>Posição (T2 · T1)</th><th style={th}>T2 com função</th><th style={th}>T1 com função</th><th style={th}>Diárias 2026</th></tr></thead>
                <tbody>
                  {linhasBat.map(([o, p]) => (
                    <tr key={o}>
                      <td style={{ ...td, fontWeight: 700, color: "var(--olive)" }}>{o}</td>
                      <td style={td}>{p.vagasT2}</td>
                      <td style={td}>
                        {p.posT2 ? <><strong>{p.posT2.mediana}º</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>T2 (melhor {p.posT2.melhor}º · n={p.posT2.n})</span></> : <span style={{ color: "var(--ink-60)" }}>T2 —</span>}<br />
                        {p.posT1 ? <><strong>{p.posT1.mediana}º</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>T1 (melhor {p.posT1.melhor}º · n={p.posT1.n})</span></> : <span style={{ color: "var(--ink-60)" }}>T1 —</span>}
                      </td>
                      <td style={td}>{p.t2ComFuncao} <span style={{ color: "var(--ink-60)", fontSize: 12.5 }}>({p.pctT2}% · {p.t2NoComando} no comando)</span></td>
                      <td style={td}>{p.t1ComFuncao}</td>
                      <td style={{ ...td, minWidth: 170 }}>
                        {p.diarias ? <>
                          <strong>{brl(p.diarias.total)}</strong> <span style={{ color: "var(--ink-60)", fontSize: 12 }}>· {p.diarias.pagamentos.toLocaleString("pt-BR")} pagamentos</span>
                          <span style={{ display: "block", height: 6, borderRadius: 99, background: "var(--surface)", marginTop: 4 }}><span style={{ display: "block", width: `${(p.diarias.total / maxDiarias) * 100}%`, height: "100%", borderRadius: 99, background: "var(--gold)" }} /></span>
                          <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{p.diarias.principais.slice(0, 2).map(x => x.operacao).join(" · ")}</span>
                        </> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ ...sub, margin: "14px 0 0" }}>
              Leitura: na T2, os aspirantes vistos no 6º, 26º, 20º, 13º BPM e BPTur estavam entre os mais bem classificados (mediana até ~40º); no 18º, 11º, 1º e 12º, mais para o fim da lista. A amostra é pequena (1 a 7 por batalhão) — use como indicativo. Em proporção às vagas, a T2 recebeu mais funções no 16º, 11º, 20º, 18º e 19º BPM; menos no 17º e no 26º. As diárias mostram onde há mais operação paga (PE Seguro, Carnaval, São João) — maiores no 11º, BPTur, 13º e 12º.
              A diária não identifica o posto de quem recebe, então não dá para separar os valores dos aspirantes.
            </p>
          </>
        )}

        {aba === "efetivo" && (
          <>
            <h2 style={titulo}>Efetivo de oficiais (QOPM) e funções de comando</h2>
            <p style={sub}>Efetivo fixado em lei (LC nº 152/2009, anexo vigente desde 03/2018 no texto atualizado da Alepe) × pessoas na folha de 09/2026. Não há dado público de efetivo por batalhão.</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Posto</th><th style={th}>Fixado</th><th style={th}>Na folha</th><th style={th}>Diferença</th></tr></thead>
                <tbody>
                  {dados.efetivo.map(e => (
                    <tr key={e.posto}>
                      <td style={td}>{e.posto}</td><td style={td}>{e.previsto}</td><td style={td}>{e.folha}</td>
                      <td style={{ ...td, fontWeight: 700, color: e.diferenca < 0 ? "var(--red)" : "var(--olive)" }}>{e.diferenca > 0 ? `+${e.diferenca}` : e.diferenca}</td>
                    </tr>
                  ))}
                  <tr><td style={td}>Aspirante a Oficial</td><td style={td}>—</td><td style={td}>{dados.asp}</td><td style={{ ...td, color: "var(--ink-60)" }}>fora do quadro fixado</td></tr>
                </tbody>
              </table>
            </div>
            <p style={{ ...sub, margin: "12px 0 18px" }}>Leitura: faltam muitos Capitães e 1º Tenentes em relação ao fixado — por isso tenentes recém-formados já assumem comando de companhia. O excesso de Tenentes-Coronéis pode vir de promoções fora do quadro (ex.: decenal) ou de alteração posterior da lei; a tabela é um indicativo.</p>
            <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 700 }}>Funções de comando previstas por batalhão (INCG nº 605/2023)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
              {Object.entries(dados.funcoesComando).map(([o, v]) => (
                <div key={o} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)", fontSize: 13, lineHeight: 1.55 }}>
                  <strong style={{ color: "var(--olive)" }}>{o}</strong><br />
                  Cmt de companhia: {v.cpm.length ? v.cpm.join(", ") : "—"}<br />
                  Cmt de pelotão: {v.pelotoes.length ? v.pelotoes.join(", ") : "—"}
                </div>
              ))}
            </div>
            <p style={{ ...sub, margin: "12px 0 0" }}>A tabela da norma pode não refletir mudanças recentes — ex.: em jul/2026 houve designação para a 4ª CPM do 18º BPM. Interstícios (LC nº 470/2021): {dados.interesticios.map(([p, t]) => `${p} ${t}`).join(" · ")}.</p>
          </>
        )}

        {aba === "fontes" && (
          <>
            <h2 style={titulo}>Fontes e método</h2>
            <ul style={{ margin: "0 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, lineHeight: 1.5 }}>
              {dados.fontes.map(f => <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>{f.rotulo} ↗</a></li>)}
            </ul>
            <p style={sub}>
              Método: dos arquivos de remuneração dos servidores ativos (Portal de Dados Abertos de PE) foram usados só os registros da Polícia Militar nos postos de Aspirante e oficiais QOPM. Cada pessoa pode ter mais de uma linha na folha; a linha principal (soldo + vantagens) foi separada dos créditos avulsos.
              As turmas T1 e T2 foram identificadas pelos nomes publicados nos atos de nomeação. Foram calculadas medianas por turma e por função, excluindo meses com férias ou 13º. Atualizado em {dados.atualizado}.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
