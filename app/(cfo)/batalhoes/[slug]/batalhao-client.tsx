"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import remuneracao from "@/lib/remuneracao-oficiais.json"
import criminalidade from "@/lib/criminalidade-batalhoes.json"
import { useRouter } from "next/navigation"
import {
  CAMPOS_FICHA, FONTES_ASPIRANTADO, FORMULARIO_DAG_URL, GRUPOS_FICHA, TIPOS_CONTRIBUICAO, nomeCurto,
  bairrosDeTexto, bairrosParaTexto, fontesDeTexto, fontesParaTexto, linksDeTexto, linksParaTexto, operacoesDeTexto, operacoesParaTexto,
  type AspirantadoFicha, type BairroFicha, type ChaveFicha, type FonteFicha, type LinkFicha, type OperacaoFicha, type TipoContribuicao,
} from "@/lib/batalhoes-base"

type Pessoa = { mat: number; nome: string; pelotao: number | null; outra: string | null }
type Msg = { id: string; texto: string; tipo: string; bairro: string | null; valor: string | null; link: string | null; criadoEm: string; mat: number; nome: string }

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18 }
const rotuloCampo: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 14, fontFamily: "inherit" }
const tituloGrupo: React.CSSProperties = { margin: "0 0 8px", fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }
const semInfo: React.CSSProperties = { margin: 0, fontSize: 13.5, color: "var(--ink-60)", fontStyle: "italic" }
const botao = (bg: string, cor: string): React.CSSProperties => ({ padding: "9px 14px", borderRadius: 10, background: bg, color: cor, fontWeight: 700, textDecoration: "none", fontSize: 13.5, textAlign: "center" })
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const rotuloTipo = (t: string) => TIPOS_CONTRIBUICAO.find(x => x.id === t)?.rotulo ?? "💡 Dica"

function ListaPessoas({ pessoas, minhaMatricula, rotuloOutra }: { pessoas: Pessoa[]; minhaMatricula: number; rotuloOutra: string }) {
  const [busca, setBusca] = useState("")
  const lista = useMemo(() => {
    const t = semAcento(busca.trim())
    return pessoas.filter(p => !t || semAcento(`${p.mat} ${p.nome}`).includes(t)).sort((a, b) => a.mat - b.mat)
  }, [pessoas, busca])
  if (pessoas.length === 0) return <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>Ninguém por enquanto.</p>
  return (
    <>
      {pessoas.length > 8 && (
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar nome ou matrícula" style={{ ...inputStyle, marginBottom: 8 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {lista.map((p, i) => (
          <div key={p.mat} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 2px", borderTop: i ? "1px solid var(--surface)" : "none",
            fontWeight: p.mat === minhaMatricula ? 700 : 400, background: p.mat === minhaMatricula ? "rgba(181,147,63,0.12)" : "transparent", fontSize: 13.5 }}>
            <span><span style={{ color: "var(--gold)", fontWeight: 700, display: "inline-block", minWidth: 34 }}>{p.mat}</span>{p.nome}{p.mat === minhaMatricula ? " · você" : ""}</span>
            <span style={{ color: "var(--ink-60)", fontSize: 12, whiteSpace: "nowrap" }}>{p.pelotao ? `${p.pelotao}º Pel · ` : ""}{p.outra ? `${rotuloOutra} ${p.outra}` : ""}</span>
          </div>
        ))}
      </div>
    </>
  )
}

type Aba = "resumo" | "seguranca" | "historico" | "area" | "morar" | "colab"
const ABAS: { id: Aba; rot: string }[] = [
  { id: "resumo", rot: "Resumo" },
  { id: "seguranca", rot: "Segurança" },
  { id: "historico", rot: "Histórico T1/T2" },
  { id: "area", rot: "Área e serviço" },
  { id: "morar", rot: "Onde morar" },
  { id: "colab", rot: "Colaborativo" },
]
const tituloAba: React.CSSProperties = { margin: "0 0 14px", fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)" }
const kpi: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, background: "var(--surface)" }
const kpiNum: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: 24, fontWeight: 700, color: "var(--olive)", lineHeight: 1.1 }
const kpiRot: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, marginTop: 2 }
const kpiSub: React.CSSProperties = { fontSize: 11.5, color: "var(--ink-60)" }
type Crime = { municipios: string[]; populacao: number; compartilhado: string | null
  cvli: { a2023: number; a2024: number; a2025: number; jan_set_2025: number; jan_set_2026: number; taxa2025: number; variacao: number | null }
  cvp: { a2023: number; a2024: number; a2025: number; jan_set_2025: number; jan_set_2026: number; taxa2025: number; variacao: number | null } }
type PorBatRem = { vagasT2: number; t2ComFuncao: number; pctT2: number; posT2: { mediana: number; n: number } | null; diarias: { total: number } | null }

// Texto da ficha com respiro: cada linha vira um parágrafo; "1ª CPM: ..." ganha o prefixo em negrito.
function Texto({ texto }: { texto: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {texto.split("\n").filter(l => l.trim()).map((l, i) => {
        const m = l.match(/^(\d+ª (?:CPM|CIA)[^:]{0,40}):\s*(.*)$/)
        return <p key={i} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65 }}>{m ? <><strong style={{ color: "var(--olive)" }}>{m[1]}:</strong> {m[2]}</> : l}</p>
      })}
    </div>
  )
}

function Barras({ itens, max, cor }: { itens: { rot: string; v: number; destaque?: boolean }[]; max: number; cor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {itens.map(i => (
        <div key={i.rot} style={{ display: "grid", gridTemplateColumns: "92px 1fr 52px", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ color: "var(--ink-60)" }}>{i.rot}</span>
          <span style={{ height: 12, borderRadius: 99, background: "var(--surface)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${max ? (i.v / max) * 100 : 0}%`, borderRadius: 99, background: i.destaque ? cor : "#c9cfc4" }} />
          </span>
          <strong style={{ textAlign: "right" }}>{i.v.toLocaleString("pt-BR")}</strong>
        </div>
      ))}
    </div>
  )
}

function Variacao({ v }: { v: number | null }) {
  if (v == null) return null
  const cor = v < 0 ? "#3a7a3a" : v > 0 ? "var(--red)" : "var(--ink-60)"
  return <span style={{ color: cor, fontWeight: 700 }}>{v > 0 ? "▲" : v < 0 ? "▼" : "="} {Math.abs(v)}%</span>
}

export function BatalhaoClient({ sigla, mapaUrl, mapaEmbutidoUrl, isAdmin, minhaMatricula, planilhaOk, info, bairros, links, fontes, operacoes, aspirantado, atualizadoEm, primeira, segunda, mural }: {
  sigla: string; mapaUrl: string; mapaEmbutidoUrl: string; isAdmin: boolean; minhaMatricula: number; planilhaOk: boolean
  info: Record<ChaveFicha, string>; bairros: BairroFicha[]; links: LinkFicha[]; fontes: FonteFicha[]; operacoes: OperacaoFicha[]; aspirantado: AspirantadoFicha | null; atualizadoEm: string | null
  primeira: Pessoa[]; segunda: Pessoa[]; mural: Msg[]
}) {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>("resumo")
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(info)
  const [listas, setListas] = useState({ bairros: bairrosParaTexto(bairros), links: linksParaTexto(links), fontes: fontesParaTexto(fontes), operacoes: operacoesParaTexto(operacoes) })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [abaLista, setAbaLista] = useState<1 | 2>(1)
  const [tipo, setTipo] = useState<TipoContribuicao>("moradia")
  const [contrib, setContrib] = useState({ texto: "", bairro: "", valor: "", link: "" })
  const [enviando, setEnviando] = useState(false)
  const [erroContrib, setErroContrib] = useState("")
  const [filtro, setFiltro] = useState<"todos" | TipoContribuicao>("todos")

  async function salvarFicha(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true); setErro("")
    const corpo = { sigla, ...form, bairros: bairrosDeTexto(listas.bairros), links: linksDeTexto(listas.links), fontes: fontesDeTexto(listas.fontes), operacoes: operacoesDeTexto(listas.operacoes) }
    const res = await fetch("/api/batalhoes/info", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
    setSalvando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao salvar.") }
    setEditando(false); router.refresh()
  }
  async function publicar(e: React.FormEvent) {
    e.preventDefault(); if (!contrib.texto.trim()) return
    setEnviando(true); setErroContrib("")
    const corpo = tipo === "moradia" ? { sigla, tipo, ...contrib } : { sigla, tipo, texto: contrib.texto }
    const res = await fetch("/api/batalhoes/mural", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) })
    setEnviando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErroContrib(j.error || "Erro ao publicar.") }
    setContrib({ texto: "", bairro: "", valor: "", link: "" }); router.refresh()
  }
  async function apagar(id: string) {
    if (!confirm("Apagar esta contribuição?")) return
    const res = await fetch(`/api/batalhoes/mural?id=${id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
  }

  const crime = (criminalidade.porBatalhao as Record<string, Crime>)[sigla]
  const todosCrime = Object.values(criminalidade.porBatalhao as Record<string, Crime>)
  const posTaxa = crime ? [...new Set(todosCrime.map(c => c.cvli.taxa2025))].sort((a, b) => a - b).indexOf(crime.cvli.taxa2025) + 1 : 0
  const nTaxas = new Set(todosCrime.map(c => c.cvli.taxa2025)).size
  const rem = (remuneracao.porBatalhao as Record<string, PorBatRem>)[sigla]
  const muralFiltrado = filtro === "todos" ? mural : mural.filter(m => m.tipo === filtro)
  const filtros = [
    { id: "todos" as const, rotulo: "Todas", n: mural.length },
    ...TIPOS_CONTRIBUICAO.map(t => ({ id: t.id, rotulo: t.rotulo, n: mural.filter(m => m.tipo === t.id).length })),
  ].filter(f => f.id === "todos" || f.n > 0)
  const opsRecentes = [...operacoes].sort((a, b) => chaveData(b.data).localeCompare(chaveData(a.data))).slice(0, 4)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid rgba(58,74,58,0.15)" }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => { setAba(a.id); setEditando(false) }}
            style={{ padding: "9px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: aba === a.id ? 700 : 500, fontFamily: "inherit",
              color: aba === a.id ? "var(--olive)" : "var(--ink-60)", borderBottom: aba === a.id ? "2px solid var(--gold)" : "2px solid transparent", marginBottom: -1 }}>
            {a.rot}{a.id === "colab" && mural.length ? ` · ${mural.length}` : ""}
          </button>
        ))}
      </nav>

      <section style={{ ...cartao, padding: "20px 20px 22px" }}>
        {editando ? (
          <form onSubmit={salvarFicha} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...GRUPOS_FICHA, { id: "grupo", titulo: "💬 Grupo" }].map(g => (
              <fieldset key={g.id} style={{ border: "1px solid var(--surface)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <legend style={{ ...tituloGrupo, padding: "0 6px" }}>{g.titulo}</legend>
                {CAMPOS_FICHA.filter(c => c.grupo === g.id).map(c => (
                  <label key={c.chave} style={{ fontSize: 13, fontWeight: 600 }}>{c.rotulo}
                    {"longo" in c && c.longo
                      ? <textarea rows={3} value={form[c.chave]} onChange={e => setForm({ ...form, [c.chave]: e.target.value })} style={{ ...inputStyle, marginTop: 4, resize: "vertical" }} />
                      : <input value={form[c.chave]} onChange={e => setForm({ ...form, [c.chave]: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />}
                  </label>
                ))}
                {g.id === "operacao" && <EditorLista rotulo="Operações" dica="Título | data | resumo | URL da foto | fonte | URL da matéria" valor={listas.operacoes} onChange={v => setListas({ ...listas, operacoes: v })} />}
                {g.id === "morar" && <EditorLista rotulo="Bairros próximos" dica="Bairro | distância | tempo | observação" valor={listas.bairros} onChange={v => setListas({ ...listas, bairros: v })} />}
              </fieldset>
            ))}
            <EditorLista rotulo="Links úteis" dica="Rótulo | https://… | grupo (opcional)" valor={listas.links} onChange={v => setListas({ ...listas, links: v })} />
            <EditorLista rotulo="Fontes" dica="Informação | fonte | https://… (opcional)" valor={listas.fontes} onChange={v => setListas({ ...listas, fontes: v })} />
            {erro && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erro}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setEditando(false); setForm(info) }} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button type="submit" disabled={salvando} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", cursor: "pointer", fontWeight: 600 }}>{salvando ? "Salvando…" : "Salvar ficha"}</button>
            </div>
          </form>
        ) : (
          <>
            {aba === "resumo" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
                  <div style={kpi}><div style={kpiNum}>{rem?.vagasT2 ?? "—"}</div><div style={kpiRot}>vagas na escolha da T2</div><div style={kpiSub}>quadro oficial, 28/06/2026</div></div>
                  <div style={kpi}><div style={kpiNum}>{rem?.posT2 ? `${rem.posT2.mediana}º` : "—"}</div><div style={kpiRot}>posição típica na T2</div><div style={kpiSub}>quanto menor, mais disputado</div></div>
                  <div style={kpi}><div style={kpiNum}>{rem ? `${rem.pctT2}%` : "—"}</div><div style={kpiRot}>da T2 já com função</div><div style={kpiSub}>comando ou seção</div></div>
                  <div style={kpi}><div style={kpiNum}>{crime ? crime.cvli.taxa2025.toLocaleString("pt-BR") : "—"}</div><div style={kpiRot}>CVLI por 100 mil (2025)</div><div style={kpiSub}>{crime && <>2026: <Variacao v={crime.cvli.variacao} /> vs 2025</>}</div></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <h2 style={{ ...tituloAba, margin: 0 }}>Quem escolheu</h2>
                  <div style={{ display: "flex", gap: 6 }}>
                    {([[1, "1ª opção", primeira.length], [2, "2ª opção", segunda.length]] as const).map(([n, r, q]) => (
                      <button key={n} onClick={() => setAbaLista(n)}
                        style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                          background: abaLista === n ? "var(--olive)" : "var(--surface)", color: abaLista === n ? "var(--canvas)" : "var(--ink-60)" }}>
                        {r} <span style={{ opacity: 0.75 }}>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {abaLista === 1
                  ? <ListaPessoas key="p1" pessoas={primeira} minhaMatricula={minhaMatricula} rotuloOutra="2ª:" />
                  : <ListaPessoas key="p2" pessoas={segunda} minhaMatricula={minhaMatricula} rotuloOutra="1ª:" />}
                {!planilhaOk && <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--red)" }}>Não foi possível abrir a planilha da DAG agora.</p>}
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16, fontSize: 13 }}>
                  <a href={FORMULARIO_DAG_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>Mudar minha escolha ↗</a>
                  <a href={mapaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>Ver no Google Maps ↗</a>
                  {info.comandante && <span style={{ color: "var(--ink-60)" }}>Cmt: {nomeCurto(info.comandante)}</span>}
                </div>
              </>
            )}

            {aba === "seguranca" && (
              <>
                <h2 style={tituloAba}>Criminalidade na área do batalhão</h2>
                {!crime ? <p style={semInfo}>Sem dados.</p> : (
                  <>
                    <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.6 }}>
                      Área: {crime.municipios.join(", ")} · {crime.populacao.toLocaleString("pt-BR")} habitantes.
                      {crime.compartilhado && <> <strong style={{ color: "var(--ink)" }}>Atenção:</strong> {crime.compartilhado}.</>}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                      {([["CVLI", crime.cvli, "#8a3b2e"], ["CVP", crime.cvp, "#b5933f"]] as const).map(([nome, d, cor]) => (
                        <div key={nome} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid var(--surface)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                            <strong style={{ fontSize: 15 }}>{nome}</strong>
                            <span style={{ fontSize: 13 }}>{d.taxa2025.toLocaleString("pt-BR")} <span style={{ color: "var(--ink-60)" }}>por 100 mil (2025)</span></span>
                          </div>
                          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-60)", lineHeight: 1.5 }}>{criminalidade.explicacao[nome]}</p>
                          <Barras cor={cor} max={Math.max(d.a2023, d.a2024, d.a2025)} itens={[{ rot: "2023", v: d.a2023 }, { rot: "2024", v: d.a2024 }, { rot: "2025", v: d.a2025, destaque: true }]} />
                          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--surface)", fontSize: 13 }}>
                            Jan–set: {d.jan_set_2025.toLocaleString("pt-BR")} (2025) → <strong>{d.jan_set_2026.toLocaleString("pt-BR")}</strong> (2026) · <Variacao v={d.variacao} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.6 }}>
                      Entre as áreas dos 13 batalhões, a taxa de CVLI daqui é <strong>{posTaxa === 1 ? "a mais baixa" : posTaxa === nTaxas ? "a mais alta" : `a ${posTaxa}ª mais baixa de ${nTaxas}`}</strong> (áreas no mesmo município contam uma vez).
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--ink-60)", lineHeight: 1.5 }}>{criminalidade.metodo}</p>
                  </>
                )}
              </>
            )}

            {aba === "historico" && (
              <>
                <h2 style={tituloAba}>O que as turmas anteriores encontraram aqui</h2>
                {aspirantado && aspirantado.registros.length > 0
                  ? <Aspirantado asp={aspirantado} temVagas={false} />
                  : <p style={semInfo}>Sem designações de aspirantes publicadas para este batalhão.</p>}
                <Link href="/batalhoes/remuneracao" style={{ display: "inline-block", marginTop: 16, fontSize: 13.5, fontWeight: 700, color: "var(--olive)" }}>Quanto ganha cada função →</Link>
              </>
            )}

            {aba === "area" && (
              <>
                <h2 style={tituloAba}>Área e serviço</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {info.area && <Texto texto={info.area} />}
                  {info.sobreArea && <div style={{ paddingTop: 14, borderTop: "1px solid var(--surface)" }}><Texto texto={info.sobreArea} /></div>}
                  {!info.area && !info.sobreArea && <p style={semInfo}>Sem informação ainda.</p>}
                </div>
                {opsRecentes.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ ...rotuloCampo, marginBottom: 10 }}>Operações recentes</p>
                    <Operacoes operacoes={opsRecentes} />
                  </div>
                )}
              </>
            )}

            {aba === "morar" && (
              <>
                <h2 style={tituloAba}>Localização e onde morar</h2>
                {info.endereco && <div style={{ marginBottom: 12 }}><Texto texto={info.endereco} /></div>}
                {info.distanciaBR && <div style={{ marginBottom: 14, fontSize: 14 }}><Texto texto={info.distanciaBR} /></div>}
                <iframe src={mapaEmbutidoUrl} title={`Mapa — ${sigla}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: 240, border: 0, borderRadius: 12, background: "var(--surface)", marginBottom: 18 }} />
                {bairros.length > 0 && <TabelaBairros bairros={bairros} />}
                {info.morarPerto && <div style={{ marginTop: 14 }}><Texto texto={info.morarPerto} /></div>}
                {(info.telefone || info.email) && <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "var(--ink-60)" }}>Contato: {[info.telefone, info.email].filter(Boolean).join(" · ")}</p>}
                <button onClick={() => { setTipo("moradia"); setAba("colab") }}
                  style={{ marginTop: 14, padding: 0, border: "none", background: "none", cursor: "pointer", color: "var(--olive)", fontWeight: 700, fontSize: 13.5, fontFamily: "inherit" }}>
                  Conhece um lugar para alugar? Indique →
                </button>
              </>
            )}

            {aba === "colab" && (
              <>
                <h2 style={{ ...tituloAba, marginBottom: 6 }}>Espaço colaborativo</h2>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--ink-60)", lineHeight: 1.6 }}>Quem já está no batalhão ou conhece a área: conte como é o serviço, indique moradia, tire dúvidas. Visível para a turma, com seu nome.</p>
                {info.linkGrupo
                  ? <a href={info.linkGrupo} target="_blank" rel="noopener noreferrer" style={{ ...botao("#25D366", "#fff"), display: "inline-block", marginBottom: 16 }}>Grupo do WhatsApp ↗</a>
                  : <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-60)" }}>Grupo do WhatsApp: link em breve.</p>}
                <form onSubmit={publicar} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18, padding: 14, borderRadius: 12, background: "var(--surface)" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {TIPOS_CONTRIBUICAO.map(t => (
                      <button key={t.id} type="button" onClick={() => setTipo(t.id)}
                        style={{ padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                          background: tipo === t.id ? "var(--olive)" : "#fff", color: tipo === t.id ? "var(--canvas)" : "var(--ink-60)" }}>{t.rotulo}</button>
                    ))}
                  </div>
                  {tipo === "moradia" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                      <input value={contrib.bairro} maxLength={80} onChange={e => setContrib({ ...contrib, bairro: e.target.value })} placeholder="Bairro" style={inputStyle} />
                      <input value={contrib.valor} maxLength={60} onChange={e => setContrib({ ...contrib, valor: e.target.value })} placeholder="Valor (ex.: R$ 1.200/mês)" style={inputStyle} />
                      <input value={contrib.link} maxLength={500} onChange={e => setContrib({ ...contrib, link: e.target.value })} placeholder="Link do anúncio (opcional)" style={inputStyle} />
                    </div>
                  )}
                  <textarea rows={3} value={contrib.texto} maxLength={1000} onChange={e => setContrib({ ...contrib, texto: e.target.value })}
                    placeholder={tipo === "moradia" ? "Tipo de imóvel, mobiliado, contato, se dá para ir a pé…" : tipo === "duvida" ? "Qual sua dúvida?" : "Escreva a informação…"}
                    style={{ ...inputStyle, resize: "vertical" }} />
                  {erroContrib && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erroContrib}</p>}
                  <button type="submit" disabled={enviando || !contrib.texto.trim()} style={{ alignSelf: "flex-end", padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer", opacity: contrib.texto.trim() ? 1 : 0.5 }}>
                    {enviando ? "Publicando…" : "Acrescentar"}
                  </button>
                </form>
                {mural.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {filtros.map(f => (
                      <button key={f.id} onClick={() => setFiltro(f.id)}
                        style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                          background: filtro === f.id ? "var(--olive)" : "#fff", color: filtro === f.id ? "var(--canvas)" : "var(--ink-60)" }}>{f.rotulo} · {f.n}</button>
                    ))}
                  </div>
                )}
                {muralFiltrado.length === 0 ? <p style={semInfo}>Nada por aqui ainda — seja o primeiro.</p> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {muralFiltrado.map(m => (
                      <div key={m.id} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--ink-60)", marginBottom: 6, flexWrap: "wrap" }}>
                          <span><span style={{ fontWeight: 700, color: "var(--gold)" }}>{rotuloTipo(m.tipo)}</span> · <strong style={{ color: "var(--olive)" }}>{m.mat} {m.nome}</strong> · {new Date(m.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                          {(isAdmin || m.mat === minhaMatricula) && <button onClick={() => apagar(m.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>apagar</button>}
                        </div>
                        {(m.bairro || m.valor) && <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>{[m.bairro && `📍 ${m.bairro}`, m.valor && `💰 ${m.valor}`].filter(Boolean).join("  ·  ")}</p>}
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.texto}</p>
                        {m.link && <a href={m.link} target="_blank" rel="noopener noreferrer nofollow" style={{ display: "inline-block", marginTop: 6, fontSize: 13, fontWeight: 600, color: "var(--olive)" }}>Ver anúncio ↗</a>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* Fontes — sempre no rodapé */}
      <details style={{ padding: "4px 4px 0" }}>
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink-60)" }}>Fontes e links ({fontes.length + links.length + criminalidade.fontes.length + FONTES_ASPIRANTADO.length})</summary>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 10, fontSize: 12.5, lineHeight: 1.55 }}>
          <div>
            <p style={{ ...rotuloCampo, marginBottom: 6 }}>Ficha</p>
            {fontes.map((f, i) => <div key={i}>{f.info}: {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{f.rotulo} ↗</a> : f.rotulo}</div>)}
          </div>
          <div>
            <p style={{ ...rotuloCampo, marginBottom: 6 }}>Segurança e turmas</p>
            {[...criminalidade.fontes, ...FONTES_ASPIRANTADO].map(f => <div key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{f.rotulo} ↗</a></div>)}
          </div>
          {links.length > 0 && (
            <div>
              <p style={{ ...rotuloCampo, marginBottom: 6 }}>Links úteis e legislação</p>
              {links.map(l => <div key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{l.rotulo} ↗</a></div>)}
            </div>
          )}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>
          {atualizadoEm && `Ficha atualizada em ${new Date(atualizadoEm).toLocaleDateString("pt-BR")}. `}Só entra dado com fonte pública.
          {isAdmin && !editando && <> · <button onClick={() => setEditando(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--olive)", fontWeight: 600, fontSize: 11.5 }}>editar ficha</button></>}
        </p>
      </details>
    </div>
  )
}

const chaveData = (d: string) => { const m = d.match(/(\d{1,2})\/(\d{2})\/(\d{4})/) ?? d.match(/(\d{1,2})[–-]\d{1,2}\/(\d{2})\/(\d{4})/); if (m) return m[3] + m[2] + m[1].padStart(2, "0"); const a = d.match(/(\d{4})/); return a ? a[1] + "0000" : "0" }

function Operacoes({ operacoes }: { operacoes: OperacaoFicha[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {operacoes.map(o => (
        <div key={o.titulo + o.data} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {o.foto
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={o.foto} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = "none" }} style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 8, flex: "0 0 auto", background: "var(--surface)" }} />
            : <span style={{ width: 72, height: 54, borderRadius: 8, flex: "0 0 auto", background: "var(--surface)" }} />}
          <div style={{ fontSize: 13, lineHeight: 1.45 }}>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 11.5 }}>{o.data}</span><br />
            <strong>{o.titulo}</strong> — {o.resumo}{" "}
            {o.url && <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600, whiteSpace: "nowrap" }}>{o.fonte} ↗</a>}
          </div>
        </div>
      ))}
    </div>
  )
}

const CORES_TURMA = { T1: "#3a4a3a", T2: "#b5933f" } as const

function Aspirantado({ asp, temVagas }: { asp: AspirantadoFicha; temVagas: boolean }) {
  const funcoes = Object.entries(asp.funcoes).sort((a, b) => b[1] - a[1])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: temVagas ? 12 : 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        {([["T1", asp.t1, "formada em 28/11/2025 · 2º Ten desde 29/05/2026"], ["T2", asp.t2, "formada em 08/06/2026 · no batalhão desde 15/06"]] as const).map(([t, n, sub]) => (
          <div key={t} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)", borderLeft: `4px solid ${CORES_TURMA[t]}` }}>
            <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 24, fontWeight: 700, color: CORES_TURMA[t] }}>{n}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>aspirantes da {t} com função</div>
            <div style={{ fontSize: 11, color: "var(--ink-60)" }}>{sub}</div>
          </div>
        ))}
      </div>
      <div>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.06em" }}>O que eles assumiram</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {funcoes.map(([f, n]) => (
            <span key={f} style={{ padding: "4px 10px", borderRadius: 999, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.35)", fontSize: 12.5 }}>{f} <strong style={{ color: "var(--gold)" }}>{n}</strong></span>
          ))}
        </div>
      </div>
      {(["T1", "T2"] as const).map(t => {
        const regs = asp.registros.filter(r => r.turma === t)
        if (!regs.length) return null
        return (
          <details key={t} style={{ borderRadius: 12, border: "1px solid var(--surface)", padding: "8px 12px" }}>
            <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: CORES_TURMA[t] }}>Ver as {regs.length} designações da {t}</summary>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
              {regs.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "6px 0", borderTop: i ? "1px solid var(--surface)" : "none", fontSize: 13 }}>
                  <span><strong>{r.posto} {r.nome}</strong><br /><span style={{ color: "var(--ink-60)" }}>{r.detalhe.replace(/^Supervisão (\d) — (.+)$/, "$2 (FGS-$1)").replace(/^Função Gratificada de Supervisão (\d)$/, "Função gratificada FGS-$1")}</span></span>
                  <span style={{ textAlign: "right", fontSize: 11.5, color: "var(--ink-60)", whiteSpace: "nowrap" }}>{r.desde ? `desde ${r.desde}` : ""}<br />
                    {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>{r.bg.replace("BGSDS nº ", "BG ")} ↗</a> : r.bg}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )
      })}
      <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-60)", lineHeight: 1.5 }}>
        Levantado nos Boletins Gerais da SDS de dez/2025 a out/2026 (atos de designação de Aspirante a Oficial e de 2º Ten das turmas T1 e T2). Conta só quem recebeu função publicada — o total lotado no batalhão pode ser maior. Não há publicação oficial de “vagas” por batalhão; esse é o melhor indicativo de onde as turmas anteriores foram empregadas. Cada designação acima traz o link do boletim.
      </p>
      <p style={{ margin: "0", fontSize: 11.5, color: "var(--ink-60)", lineHeight: 1.7 }}>
        <strong>Fontes:</strong>{" "}
        {FONTES_ASPIRANTADO.map((f, i) => (
          <span key={f.url}>{i > 0 && " · "}<a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)", fontWeight: 600 }}>{f.rotulo} ↗</a></span>
        ))}
      </p>
    </div>
  )
}

function TabelaBairros({ bairros }: { bairros: BairroFicha[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--ink-60)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <th style={{ padding: "6px 8px 6px 0" }}>Bairro</th>
            <th style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>Até a sede</th>
            <th style={{ padding: "6px 8px" }}>Tempo</th>
            <th style={{ padding: "6px 0 6px 8px" }}>Observação</th>
          </tr>
        </thead>
        <tbody>
          {bairros.map(b => (
            <tr key={b.nome} style={{ borderTop: "1px solid var(--surface)", verticalAlign: "top" }}>
              <td style={{ padding: "7px 8px 7px 0", fontWeight: 700, color: "var(--olive)", whiteSpace: "nowrap" }}>{b.nome}</td>
              <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>{b.km}</td>
              <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>{b.tempo}</td>
              <td style={{ padding: "7px 0 7px 8px", color: "var(--ink-60)", minWidth: 180 }}>{b.obs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EditorLista({ rotulo, dica, valor, onChange }: { rotulo: string; dica: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 600 }}>{rotulo}
      <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: "var(--ink-60)" }}>Uma linha por item: {dica}</span>
      <textarea rows={4} value={valor} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, marginTop: 4, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 12.5 }} />
    </label>
  )
}
