"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CAMPOS_FICHA, FORMULARIO_DAG_URL, GRUPOS_FICHA, TIPOS_CONTRIBUICAO,
  bairrosDeTexto, bairrosParaTexto, fontesDeTexto, fontesParaTexto, linksDeTexto, linksParaTexto,
  type BairroFicha, type ChaveFicha, type FonteFicha, type LinkFicha, type TipoContribuicao,
} from "@/lib/batalhoes-base"

type Pessoa = { mat: number; nome: string; pelotao: number | null; outra: string | null }
type Msg = { id: string; texto: string; tipo: string; bairro: string | null; valor: string | null; link: string | null; criadoEm: string; mat: number; nome: string }

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18 }
const titulo: React.CSSProperties = { margin: "0 0 12px", fontSize: 15, color: "var(--olive)" }
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

export function BatalhaoClient({ sigla, mapaUrl, rotaUrl, isAdmin, minhaMatricula, planilhaOk, info, bairros, links, fontes, atualizadoEm, primeira, segunda, mural }: {
  sigla: string; mapaUrl: string; rotaUrl: string; isAdmin: boolean; minhaMatricula: number; planilhaOk: boolean
  info: Record<ChaveFicha, string>; bairros: BairroFicha[]; links: LinkFicha[]; fontes: FonteFicha[]; atualizadoEm: string | null
  primeira: Pessoa[]; segunda: Pessoa[]; mural: Msg[]
}) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(info)
  const [listas, setListas] = useState({ bairros: bairrosParaTexto(bairros), links: linksParaTexto(links), fontes: fontesParaTexto(fontes) })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [abaLista, setAbaLista] = useState<1 | 2>(1)
  // contribuições da turma
  const [tipo, setTipo] = useState<TipoContribuicao>("moradia")
  const [contrib, setContrib] = useState({ texto: "", bairro: "", valor: "", link: "" })
  const [enviando, setEnviando] = useState(false)
  const [erroContrib, setErroContrib] = useState("")
  const [filtro, setFiltro] = useState<"todos" | TipoContribuicao>("todos")

  async function salvarFicha(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true); setErro("")
    const corpo = { sigla, ...form, bairros: bairrosDeTexto(listas.bairros), links: linksDeTexto(listas.links), fontes: fontesDeTexto(listas.fontes) }
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

  const moradias = mural.filter(m => m.tipo === "moradia")
  const muralFiltrado = filtro === "todos" ? mural : mural.filter(m => m.tipo === filtro)
  const visiveis = (g: string) => CAMPOS_FICHA.filter(c => c.grupo === g && !("oculto" in c && c.oculto) && info[c.chave])
  const filtros = [
    { id: "todos" as const, rotulo: "Todas", n: mural.length },
    ...TIPOS_CONTRIBUICAO.map(t => ({ id: t.id, rotulo: t.rotulo, n: mural.filter(m => m.tipo === t.id).length })),
  ].filter(f => f.id === "todos" || f.n > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Números */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {[{ n: primeira.length, r: "querem como 1ª opção" }, { n: segunda.length, r: "como 2ª opção" }, { n: mural.length, r: "contribuições da turma" }].map(x => (
          <div key={x.r} style={{ ...cartao, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 28, fontWeight: 700, color: "var(--olive)" }}>{x.n}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-60)" }}>{x.r}</div>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
        <a href={mapaUrl} target="_blank" rel="noopener noreferrer" style={botao("var(--olive)", "var(--canvas)")}>📍 Abrir no Google Maps ↗</a>
        <a href={rotaUrl} target="_blank" rel="noopener noreferrer" style={botao("var(--surface)", "var(--olive)")}>🧭 Traçar rota até o batalhão ↗</a>
        {info.linkGrupo
          ? <a href={info.linkGrupo} target="_blank" rel="noopener noreferrer" style={botao("#25D366", "#fff")}>💬 Grupo do WhatsApp ↗</a>
          : <span title="O link do grupo será publicado em breve" style={{ ...botao("var(--surface)", "var(--ink-60)"), cursor: "default" }}>💬 Grupo do WhatsApp · em breve</span>}
      </div>

      {/* Ficha padrão */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h2 style={{ ...titulo, margin: 0, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem" }}>Conheça o batalhão</h2>
          {isAdmin && !editando && (
            <button onClick={() => setEditando(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Editar ficha</button>
          )}
        </div>

        {editando ? (
          <form onSubmit={salvarFicha} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>
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
                {g.id === "morar" && <EditorLista rotulo="Bairros próximos" dica="Bairro | distância | tempo | observação" valor={listas.bairros} onChange={v => setListas({ ...listas, bairros: v })} />}
              </fieldset>
            ))}
            <EditorLista rotulo="🔗 Links úteis" dica="Rótulo | https://…" valor={listas.links} onChange={v => setListas({ ...listas, links: v })} />
            <EditorLista rotulo="📚 Fontes" dica="Informação | fonte | https://… (opcional)" valor={listas.fontes} onChange={v => setListas({ ...listas, fontes: v })} />
            {erro && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erro}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setEditando(false); setForm(info) }} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button type="submit" disabled={salvando} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", cursor: "pointer", fontWeight: 600 }}>{salvando ? "Salvando…" : "Salvar ficha"}</button>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {GRUPOS_FICHA.map(g => {
              const campos = visiveis(g.id)
              const temBairros = g.id === "morar" && bairros.length > 0
              return (
                <div key={g.id} style={{ padding: "14px 0", borderTop: "1px solid var(--surface)" }}>
                  <h3 style={tituloGrupo}>{g.titulo}</h3>
                  {campos.length === 0 && !temBairros && <p style={semInfo}>{g.id === "vagas" ? "Sem informação oficial sobre vagas ainda." : "Sem informação ainda."}</p>}
                  {temBairros && <TabelaBairros bairros={bairros} />}
                  {campos.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: temBairros ? 12 : 0 }}>
                      {campos.map(c => (
                        <div key={c.chave} style={{ gridColumn: "longo" in c && c.longo ? "1 / -1" : undefined }}>
                          {campos.length > 1 || temBairros ? <p style={rotuloCampo}>{c.rotulo}</p> : null}
                          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{info[c.chave]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {g.id === "morar" && (
                    <p style={{ margin: "10px 0 0", fontSize: 13 }}>
                      <a href="#contribuicoes" onClick={() => { setFiltro(moradias.length ? "moradia" : "todos"); setTipo("moradia") }} style={{ color: "var(--olive)", fontWeight: 700 }}>
                        🏠 {moradias.length ? `${moradias.length} sugest${moradias.length > 1 ? "ões" : "ão"} de moradia da turma` : "Indique um lugar para alugar"} ↓
                      </a>
                    </p>
                  )}
                </div>
              )
            })}
            {links.length > 0 && (
              <div style={{ padding: "14px 0", borderTop: "1px solid var(--surface)" }}>
                <h3 style={tituloGrupo}>🔗 Links úteis</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {links.map(l => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", borderRadius: 999, background: "var(--surface)", color: "var(--olive)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{l.rotulo} ↗</a>
                  ))}
                </div>
              </div>
            )}
            {fontes.length > 0 && (
              <details style={{ padding: "14px 0", borderTop: "1px solid var(--surface)" }}>
                <summary style={{ ...tituloGrupo, cursor: "pointer", margin: 0 }}>📚 Fontes das informações ({fontes.length})</summary>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, lineHeight: 1.45 }}>
                  {fontes.map((f, i) => (
                    <li key={i}><strong>{f.info}:</strong> {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--olive)" }}>{f.rotulo || f.url} ↗</a> : f.rotulo}</li>
                  ))}
                </ul>
              </details>
            )}
            {atualizadoEm && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>Ficha atualizada em {new Date(atualizadoEm).toLocaleDateString("pt-BR")}. Comando e contatos podem mudar — confirme com a unidade antes de se apresentar.</p>}
          </div>
        )}
      </section>

      {/* Quem escolheu — visualizador 1ª / 2ª opção */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ ...titulo, margin: 0, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem" }}>Quem escolheu o {sigla}</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {([[1, "1ª opção", primeira.length], [2, "2ª opção", segunda.length]] as const).map(([n, r, q]) => (
              <button key={n} onClick={() => setAbaLista(n)}
                style={{ padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                  background: abaLista === n ? "var(--olive)" : "var(--surface)", color: abaLista === n ? "var(--canvas)" : "var(--ink-60)" }}>
                {r} <span style={{ opacity: 0.75 }}>{q}</span>
              </button>
            ))}
          </div>
        </div>
        {abaLista === 1
          ? <ListaPessoas key="p1" pessoas={primeira} minhaMatricula={minhaMatricula} rotuloOutra="2ª:" />
          : <ListaPessoas key="p2" pessoas={segunda} minhaMatricula={minhaMatricula} rotuloOutra="1ª:" />}
        <a href={FORMULARIO_DAG_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: "var(--olive)" }}>
          Quer mudar sua escolha? Responda de novo o formulário da DAG ↗
        </a>
      </section>
      {!planilhaOk && <p style={{ margin: 0, fontSize: 12.5, color: "var(--red)" }}>Não foi possível abrir a planilha da DAG agora — as listas podem estar vazias.</p>}

      {/* Contribuições da turma */}
      <section id="contribuicoes" style={{ ...cartao, scrollMarginTop: 16 }}>
        <h2 style={{ ...titulo, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", marginBottom: 4 }}>Contribuições da turma — {sigla}</h2>
        <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--ink-60)" }}>Indique lugares para alugar, dicas do serviço, informações e dúvidas. Fica visível para a turma, com seu nome.</p>

        <form onSubmit={publicar} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, padding: 12, borderRadius: 12, background: "var(--surface)" }}>
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
            placeholder={tipo === "moradia" ? "Descreva: tipo de imóvel, mobiliado, contato, se dá para ir a pé…" : tipo === "duvida" ? "Qual sua dúvida sobre o batalhão?" : "Escreva sua contribuição…"}
            style={{ ...inputStyle, resize: "vertical" }} />
          {erroContrib && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erroContrib}</p>}
          <button type="submit" disabled={enviando || !contrib.texto.trim()} style={{ alignSelf: "flex-end", padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer", opacity: contrib.texto.trim() ? 1 : 0.5 }}>
            {enviando ? "Publicando…" : "Publicar"}
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
        {muralFiltrado.length === 0 ? <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>{filtro === "todos" ? "Nenhuma contribuição ainda — seja o primeiro." : "Nenhuma contribuição desse tipo ainda."}</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {muralFiltrado.map(m => (
              <div key={m.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--ink-60)", marginBottom: 4, flexWrap: "wrap" }}>
                  <span><span style={{ fontWeight: 700, color: "var(--gold)" }}>{rotuloTipo(m.tipo)}</span> · <strong style={{ color: "var(--olive)" }}>{m.mat} {m.nome}</strong> · {new Date(m.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  {(isAdmin || m.mat === minhaMatricula) && <button onClick={() => apagar(m.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>apagar</button>}
                </div>
                {(m.bairro || m.valor) && (
                  <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700 }}>{[m.bairro && `📍 ${m.bairro}`, m.valor && `💰 ${m.valor}`].filter(Boolean).join("  ·  ")}</p>
                )}
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.texto}</p>
                {m.link && <a href={m.link} target="_blank" rel="noopener noreferrer nofollow" style={{ display: "inline-block", marginTop: 4, fontSize: 13, fontWeight: 600, color: "var(--olive)" }}>Ver anúncio ↗</a>}
              </div>
            ))}
          </div>
        )}
      </section>
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
